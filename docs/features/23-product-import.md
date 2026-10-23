# Feature 23: Bulk Product Import from Excel (admin)

**Status:** ✅ Done. No migration. 8 API tests (66 in total).

Admin → **Products → Import from Excel**: download a template, fill it in, upload it, check the
preview, import. Hundreds of products and variants in one go, created or updated, never duplicated.

## How it works for the admin

1. **Download template**: an `.xlsx` with the current categories filled in, a Category dropdown,
   two example rows and help on every column header.
2. **Choose file → Check file**: a *dry run*. The API reads and checks every row and answers with
   what *would* happen: new / updated / unchanged products, variants and categories, plus every
   problem with its sheet, row and column ("Products row 14, Price (USD): a price between 0.01
   and 100000"). Nothing is saved.
3. **Import N products**: only shown for a clean preview of the same file. Everything is saved in
   one transaction: all rows or none.

## The file format

| Sheet | One row per | Notes |
|---|---|---|
| **Products** | variant | Rows with the same **Handle** are one product. Product columns only need filling on its first row; if repeated they must match. |
| **Categories** | category | Missing categories are created, existing descriptions updated. |
| Instructions | - | How to use the file. |

Columns: Handle, Product name, Category, Brand, Description, Image URLs (1-8, `|` or new line),
Details (`key: value; key: value`, shown on the product page), Visible in shop (Yes/No),
Variant name, SKU, Options (`size: 9; color: Black`), Price (USD), Stock.

## Rules

| Rule | Why |
|---|---|
| Matched by **Handle** (product) and **SKU** (variant): importing again updates instead of duplicating | Re-running an import must be safe (idempotent). Fixing a typo = edit the file, import again. |
| Products missing from the file are **left alone** | An import never deletes. A partial file (one category) is a normal use. |
| **Stock is only set for new variants**; existing stock is reported as a note, never overwritten | Stock changes by +/- adjustments elsewhere in admin: overwriting it could undo a sale made since the file was exported. |
| A SKU that belongs to **another** product is an error | Moving a variant between products would corrupt order history and carts. |
| `basePrice` is recalculated (cheapest variant) for every updated product in **one SQL statement** | The shop filters and sorts by it; a query per product would be slow. |
| `dryRun` defaults to **true** | A forgotten flag can never write data. |
| Limits: 5 MB, 5,000 rows, errors capped at 500 in the answer | Protects the API from huge uploads; the admin fixes the first batch and checks again. |

## Files

| Where | File | What |
|---|---|---|
| API | `backend/src/modules/admin/products/import/workbook.js` | The column definitions, the template builder and the `.xlsx` reader (exceljs). One source for both directions. |
| API | `.../import/import.service.js` | Validate (Zod, per field) → plan (compare with the database) → apply (one transaction) |
| API | `.../import/import.routes.js`, `import.controller.js` | `GET /api/admin/products/import/template`, `POST /api/admin/products/import?dryRun=` (raw `.xlsx` body) |
| API | `backend/tests/api/product-import.test.js` | Template, access, not-an-xlsx, dry run vs import, re-import keeps stock, unchanged file stays unchanged (jsonb key order), errors by row, SKU owned by another product |
| Admin | `admin/src/features/products/ImportProductsPage.jsx` | The 3-step page, preview table, problems table |
| Admin | `admin/src/features/products/productsApi.js` | `importProducts` mutation; a real import refreshes products, categories and the dashboard (`Category` tag) |
| Data | `docs/sample-data/shopverse-catalog.xlsx` | Ready-to-import catalog: 15 categories, 323 real products, 764 variants |

## Why these choices

| Choice | Alternatives | Why |
|---|---|---|
| **Excel (.xlsx)** | CSV | A dropdown for categories, help on headers, several sheets, no encoding/comma problems with names like "Pride and Prejudice, Penguin". |
| **Parse on the server** (exceljs) | Parse in the browser (SheetJS) | The server must validate anyway. One parser, one set of rules, testable with API tests. (SheetJS on npm is also outdated and has known vulnerabilities.) |
| **Raw body** (`express.raw`, 5 MB) | multipart upload (multer) | One file, no form fields: no extra library, and the size limit applies before parsing. |
| **Dry run, then apply** | Import immediately | The admin sees every problem and the exact effect before anything changes. |
| **All or nothing** (one transaction) | Save the good rows, skip the bad ones | A half-imported catalog is hard to reason about; with all-or-nothing, "fix and re-upload" is always safe. |
| **Batch inserts** (`createManyAndReturn` + `createMany`) | One `create` per product | ~3 queries for 300 new products instead of 600+; the import fits well inside the transaction time limit. |
| **One row per variant, grouped by Handle** | One row per product with variant columns | The same idea as Shopify's product CSV: works for 1 or 50 variants without changing the columns. |

## Sample catalog

`docs/sample-data/shopverse-catalog.xlsx`: real products (real brands and models, realistic but
not live USD prices) in 15 categories: Books, Electronics, Sneakers, Home Decor, Kitchen & Dining,
Furniture, Beauty & Personal Care, Sports & Fitness, Toys & Games, Men's Fashion, Women's Fashion,
Watches, Bags & Luggage, Stationery & Office, Pet Supplies.

Images: the 22 books have their real covers (Open Library, listed in the **Image credits** sheet).
The other products have clean placeholders (brand + name on the category colour, from
placehold.co) until real photos are uploaded in admin. Keyword photo search on an open archive
(Wikimedia Commons) was tried and rejected: about half the results were unrelated, and one was
explicit. An open archive is not a safe source for a shop.

The six books that were already in the seed use the same handles and SKUs, so importing the file
**updates** them (real cover, real details) instead of creating duplicates.

## Concepts to be able to explain

- **Idempotent import**: natural keys (handle, SKU) make "run it again" safe.
- **Dry run / plan before apply**: the same pattern as `terraform plan` and database migrations.
- **Validate everything, report everything**: per-field checks collect all problems in one pass.
- **Transactions and their time limit**: why big writes are batched, and why the timeout is raised.
- **Not overwriting live counters** (stock) from a stale file: a classic lost-update bug.
- **jsonb normalises key order**: comparing JSON read back from PostgreSQL needs an
  order-insensitive comparison, or every re-import reports false "updates" (found at full scale,
  covered by a regression test).

## Verified

- Full catalog on the test database: 323 products + 764 variants imported in about 5 s in one
  transaction; importing the same file again reports all 323 unchanged.
- Dry run against the dev database: 0 problems; the 6 seed books are updated, not duplicated; 12
  stock notes (existing stock kept).
