import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { getOrCreatePersonalOrganization } from "./organizations";
import { logAuthEvent } from "./audit";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      tier: string;
      mfaEnabled: boolean;
      /** True when this session has passed MFA challenge (if MFA is on) */
      mfaVerified: boolean;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    // Google OAuth — only if credentials are configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Email + password credentials
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
        // Step-2: optional MFA token for the credentials flow
        mfaToken: { label: "MFA Code", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip =
          (req as Request & { headers?: Record<string, string | undefined> })
            ?.headers?.["x-forwarded-for"]
            ?.split(",")[0]
            .trim() ?? "unknown";

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // ── Brute-force / account-lockout check ───────────────────────────
        if (user) {
          const LOCK_THRESHOLD = 10;
          const LOCK_WINDOW_MS = 15 * 60 * 1000; // 15 min

          const recentFailures = await prisma.authAttempt.count({
            where: {
              email:     credentials.email as string,
              success:   false,
              createdAt: { gte: new Date(Date.now() - LOCK_WINDOW_MS) },
            },
          });

          if (recentFailures >= LOCK_THRESHOLD) {
            await logAuthEvent({
              userId:  user.id,
              action:  "login.blocked",
              ip,
              metadata: { reason: "too_many_failures", count: recentFailures },
            });
            return null; // locked out
          }
        }

        if (!user || !user.password) {
          await prisma.authAttempt.create({
            data: { email: credentials.email as string, success: false, ip },
          });
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!valid) {
          await prisma.authAttempt.create({
            data: { email: credentials.email as string, success: false, ip },
          });
          await logAuthEvent({
            userId:  user.id,
            action:  "login.failed",
            ip,
            metadata: { reason: "invalid_password" },
          });
          return null;
        }

        // ── Record successful credential check ────────────────────────────
        await prisma.authAttempt.create({
          data: { email: credentials.email as string, success: true, ip },
        });

        // ── MFA check ─────────────────────────────────────────────────────
        if (user.mfaEnabled && user.mfaSecret) {
          const mfaToken = (credentials.mfaToken as string | undefined)?.trim();

          if (!mfaToken) {
            // Signal to the client that MFA is required
            // We encode the requirement in a special error that the login form intercepts.
            throw new Error("MFA_REQUIRED");
          }

          const { verifyTOTP } = await import("./mfa");
          const tokenValid = verifyTOTP(user.mfaSecret, mfaToken);

          if (!tokenValid) {
            // Allow recovery codes as fallback
            const recoveryValid = await import("./mfa").then((m) =>
              m.consumeRecoveryCode(user.id, mfaToken)
            );
            if (!recoveryValid) {
              await logAuthEvent({
                userId:  user.id,
                action:  "mfa.failed",
                ip,
                metadata: { method: "totp_or_recovery" },
              });
              return null;
            }
            await logAuthEvent({
              userId:  user.id,
              action:  "mfa.recovery_code_used",
              ip,
              metadata: {},
            });
          } else {
            await logAuthEvent({
              userId:  user.id,
              action:  "mfa.verified",
              ip,
              metadata: { method: "totp" },
            });
          }
        }

        await logAuthEvent({
          userId:  user.id,
          action:  "login.success",
          ip,
          metadata: { provider: "credentials" },
        });

        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          image: user.image,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
    error:  "/auth/error",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return true;

      const dbUser = await prisma.user.upsert({
        where:  { email: user.email },
        create: { email: user.email, name: user.name, image: user.image },
        update: { name: user.name, image: user.image },
      });

      if (dbUser.id) {
        await getOrCreatePersonalOrganization(dbUser.id, dbUser.email, dbUser.name);
      }

      // Audit Google OAuth logins
      if (account?.provider === "google") {
        await logAuthEvent({
          userId:   dbUser.id,
          action:   "login.success",
          ip:       "oauth",
          metadata: { provider: "google" },
        });
      }

      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user?.email || trigger === "update") {
        const email = (user?.email ?? token.email) as string | undefined;
        if (email) {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            token.id         = dbUser.id;
            token.tier       = dbUser.tier;
            token.mfaEnabled = dbUser.mfaEnabled;
            // mfaVerified is set to true only when MFA was passed during this sign-in
            token.mfaVerified = dbUser.mfaEnabled ? (token.mfaVerified ?? false) : true;
          }
        }
      }
      // After credentials authorize() succeeds with a mfaToken, mark verified
      if (user && (user as Record<string, unknown>).mfaVerified) {
        token.mfaVerified = true;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id          = token.id as string;
        session.user.tier        = (token.tier as string | undefined) ?? "free";
        session.user.mfaEnabled  = (token.mfaEnabled as boolean | undefined) ?? false;
        session.user.mfaVerified = (token.mfaVerified as boolean | undefined) ?? true;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },
});
