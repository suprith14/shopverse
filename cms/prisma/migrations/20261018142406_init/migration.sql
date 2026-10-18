-- CreateTable
CREATE TABLE "ContentEntry" (
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ContentEntry_pkey" PRIMARY KEY ("type")
);
