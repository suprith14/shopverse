/*
  Warnings:

  - A unique constraint covering the columns `[invoiceToken]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "invoiceToken" TEXT;

-- ---------------------------------------------------------------- Back-fill (added by hand)
-- Every order that already has an invoice gets its own random verification token:
-- 48 hex characters built from PostgreSQL's built-in random UUIDs (~190 random bits),
-- the same format the app generates for new invoices (crypto.randomBytes(24) as hex).
-- gen_random_uuid() runs once PER ROW, so every order gets a different token.
UPDATE "Order"
SET "invoiceToken" = replace(gen_random_uuid()::text, '-', '') || left(replace(gen_random_uuid()::text, '-', ''), 16)
WHERE "invoiceNumber" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_invoiceToken_key" ON "Order"("invoiceToken");
