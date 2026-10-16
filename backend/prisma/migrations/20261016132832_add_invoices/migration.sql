/*
  Warnings:

  - A unique constraint covering the columns `[invoiceNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cardBrand" TEXT,
ADD COLUMN     "cardLast4" TEXT,
ADD COLUMN     "invoiceIssuedAt" TIMESTAMP(3),
ADD COLUMN     "invoiceNumber" INTEGER,
ADD COLUMN     "receiptUrl" TEXT;

-- CreateTable
CREATE TABLE "InvoiceCounter" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InvoiceCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_invoiceNumber_key" ON "Order"("invoiceNumber");

-- ---------------------------------------------------------------- Back-fill (added by hand)
-- Orders paid BEFORE this migration get invoice numbers too, in the order they were placed,
-- so their customers can download invoices. Refunded orders were paid once, so they count.
-- (The issue date is the order date: the closest we know for old orders.)
WITH numbered AS (
  SELECT id, "createdAt",
         ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS n
  FROM "Order"
  WHERE status IN ('PAID', 'SHIPPED', 'DELIVERED', 'REFUNDED')
)
UPDATE "Order" o
SET "invoiceNumber" = numbered.n,
    "invoiceIssuedAt" = numbered."createdAt"
FROM numbered
WHERE o.id = numbered.id;

-- The counter starts at the last number used, so the next paid order continues the series.
INSERT INTO "InvoiceCounter" (id, value)
SELECT 'invoice', COALESCE(MAX("invoiceNumber"), 0) FROM "Order";
