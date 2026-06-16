-- ============================================================================
-- Migration: Add MFA fields, AuthAttempt table, MfaRecoveryRequest table
-- Compliance: SOC2 CC6.1 / HIPAA §164.312(a)(2)(i), §164.312(b), §164.312(d)
-- ============================================================================

-- 2FA fields on User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "mfaEnabled"         BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "mfaSecret"          TEXT,
  ADD COLUMN IF NOT EXISTS "mfaIv"              TEXT,
  ADD COLUMN IF NOT EXISTS "recoveryCodes"      TEXT[]   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "trustedPersonEmail" TEXT;

-- Brute-force / login-attempt ledger (append-only audit log)
CREATE TABLE IF NOT EXISTS "AuthAttempt" (
  "id"        TEXT        NOT NULL PRIMARY KEY,
  "email"     TEXT        NOT NULL,
  "userId"    TEXT,
  "success"   BOOLEAN     NOT NULL,
  "ip"        TEXT        NOT NULL DEFAULT 'unknown',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "AuthAttempt_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "AuthAttempt_email_createdAt_idx"   ON "AuthAttempt" ("email", "createdAt");
CREATE INDEX IF NOT EXISTS "AuthAttempt_userId_createdAt_idx"  ON "AuthAttempt" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuthAttempt_success_createdAt_idx" ON "AuthAttempt" ("success", "createdAt");

-- Trusted-person MFA recovery tokens (single-use, 15-min TTL)
CREATE TABLE IF NOT EXISTS "MfaRecoveryRequest" (
  "id"        TEXT        NOT NULL PRIMARY KEY,
  "userId"    TEXT        NOT NULL,
  "token"     TEXT        NOT NULL UNIQUE,
  "expires"   TIMESTAMPTZ NOT NULL,
  "usedAt"    TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "MfaRecoveryRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "MfaRecoveryRequest_userId_idx"  ON "MfaRecoveryRequest" ("userId");
CREATE INDEX IF NOT EXISTS "MfaRecoveryRequest_token_idx"   ON "MfaRecoveryRequest" ("token");
CREATE INDEX IF NOT EXISTS "MfaRecoveryRequest_expires_idx" ON "MfaRecoveryRequest" ("expires");

-- Retention policy: auto-purge AuthAttempts older than 1 year
-- (Postgres doesn't support INTERVAL expressions in CREATE TABLE — run this as a scheduled job or
--  add it to your maintenance cron. Provided here for documentation / SOC2 evidence.)
-- DELETE FROM "AuthAttempt" WHERE "createdAt" < NOW() - INTERVAL '1 year';
