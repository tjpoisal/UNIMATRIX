import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      tier: string;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId:     process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error:  "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Auto-create DB user on first OAuth login
      if (account?.provider !== "credentials" && user.email) {
        await prisma.user.upsert({
          where:  { email: user.email },
          create: { email: user.email, name: user.name, image: user.image },
          update: { name: user.name,   image: user.image },
        });
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      // Refresh DB user on sign-in or explicit session update
      if (user?.email || trigger === "update") {
        const email = (user?.email ?? token.email) as string | undefined;
        if (email) {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            token.id = dbUser.id;
            token.tier = dbUser.tier;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id   as string;
        session.user.tier = (token.tier as string | undefined) ?? "free";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60,
  },
});
