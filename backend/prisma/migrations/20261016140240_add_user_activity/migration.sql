-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeenAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_lastSeenAt_idx" ON "User"("lastSeenAt");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
