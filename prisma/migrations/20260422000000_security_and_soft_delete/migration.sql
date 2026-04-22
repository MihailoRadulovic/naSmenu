-- Add verificationTokenExpiry for 24h expiry on email verification
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationTokenExpiry" TIMESTAMP(3);

-- Add approvalToken (single-use, replaces ADMIN_SECRET in URL)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "approvalToken" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_approvalToken_key" ON "User"("approvalToken");

-- Add deletedAt for Employee soft delete (preserves historical schedule data)
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
