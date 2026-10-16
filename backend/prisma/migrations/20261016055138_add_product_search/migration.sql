-- Full-text search for products.
--
-- "searchVector" is a GENERATED column: PostgreSQL computes it from name, brand and
-- description, and recomputes it automatically whenever one of them changes. The app never
-- writes it, so it can never get out of sync.
--
-- to_tsvector('english', text) lowercases the text, drops stop words ("the", "with", "and")
-- and reduces words to their roots ("running" -> "run", "shoes" -> "shoe").
-- setweight marks where each word came from, so a match in the name ranks higher:
--   A = name, B = brand, C = description.
--
-- (Prisma can't express generated columns in schema.prisma, so this SQL was edited by hand
--  after `prisma migrate dev --create-only`. The schema declares the column as
--  Unsupported("tsvector") so Prisma knows it exists and doesn't try to drop it.)

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("brand", '')), 'B') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'C')
  ) STORED;

-- CreateIndex
-- A GIN ("generalized inverted") index maps each word root to the products containing it,
-- like the index at the back of a book. Searches use it instead of reading every row.
CREATE INDEX "Product_searchVector_idx" ON "Product" USING GIN ("searchVector");
