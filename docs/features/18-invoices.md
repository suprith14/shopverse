# Feature 18: Invoices & Payment Details

**Status:** ✅ Done

Every paid order gets a **sequential invoice number** (`INV-2026-00042`). Customers and admins can **download a PDF
invoice**, see the card used ("Visa •••• 4242") and open **Stripe's receipt**. The PDF is also attached to the
order confirmation email.

## Why these choices

| Decision | Choice | Alternatives |
|---|---|---|
| PDF made where | **Server** (`pdfkit`) | Browser print (looks different per browser, not a real file) or `jsPDF` (+300 kB on the store, data from the browser) |
| Invoice number | **Counter row** updated in the payment transaction | Order id (not sequential), `MAX()+1` (duplicates under concurrency), a PostgreSQL sequence (never duplicates, but **gaps** on rollback) |
| Card details | Read from Stripe **once** when payment is confirmed, then stored | Asking Stripe on every download (slower; fails if Stripe is unreachable) |
| PDF storage | Generated **on request** | Storing each issued PDF (what real accounting systems do for archiving): a possible next step |
| Refunds | Same invoice with a **REFUNDED** mark; the number is never reused | Real accounting issues a separate **credit note** |

## Database (migration `add_invoices`)

- `Order.invoiceNumber` (unique), `invoiceIssuedAt`, `cardBrand`, `cardLast4`, `receiptUrl`
- `InvoiceCounter` table: one row `{ id: 'invoice', value }`
- **Back-fill** (written by hand in the migration): orders already paid, shipped, delivered or refunded were numbered
  1…N with `ROW_NUMBER() OVER (ORDER BY "createdAt")`, and the counter set to N. Result on dev: 384 orders, numbers 1–384, 0 gaps.
- Seeds: `db:seed` resets the counter, and `db:seed-orders` numbers its paid demo orders.

## Backend

Files: [`backend/src/modules/orders/invoice.ts`](../../backend/src/modules/orders/invoice.ts),
[`backend/src/lib/send-pdf.ts`](../../backend/src/lib/send-pdf.ts), `markOrderPaid` in `orders.service.ts`.

| Endpoint | Who | Notes |
|---|---|---|
| `GET /api/orders/:id/invoice` | the order's customer | Another customer's order → 404. Unpaid → *"The invoice is available once the order is paid"* |
| `GET /api/admin/orders/:id/invoice` | admins | Any order |

Responses: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="INV-2026-00042.pdf"`,
`Cache-Control: private, no-store` (personal data: no shared or browser caching). Order JSON now includes `invoiceLabel`, `cardBrand`, `cardLast4` and `receiptUrl`.

**When an order is paid** (webhook → `markOrderPaid`):
1. In the paid transaction: `UPDATE "InvoiceCounter" SET value = value + 1 … RETURNING value`. The row lock serialises
   simultaneous payments, and a rollback undoes the +1.
2. After commit: `paymentIntents.retrieve(…, { expand: ['latest_charge'] })` → save card brand, last 4 and receipt URL (best effort).
3. The confirmation email is sent **with the invoice PDF attached**.

**The PDF:** header with invoice number, issue and order dates; billed-to (customer) and ship-to (the order's address snapshot);
items (snapshot names and prices); subtotal, discount and total; the card and Stripe reference; a "REFUNDED" watermark when refunded;
a test-mode footer. Missing data falls back to "No delivery address recorded" and "Card (via Stripe)".

**Tested:** a real PDF was downloaded and checked visually. Guest 401, another customer 404, admin 200, unpaid → 400.
**Concurrency:** 10 simultaneous transactions with 3 forced failures → committed numbers 385–390, **0 duplicates, 0 gaps**,
and the counter ended exactly at the last committed number. One extra transaction gave up waiting for the lock, which is
harmless for webhooks because Stripe retries.

## Frontend

- **Store** (`OrderDetailPage.tsx`): a "Payment" box on paid orders with the card, invoice number, **Download invoice** and **Stripe receipt**.
  `lib/download.ts` fetches with the auth token (a plain link can't send it), saves the file, and reads error messages out of Blob responses.
- **Admin** (`OrderDetailPage.tsx` → Payment box): card, invoice number and the same two actions. `admin/src/lib/download.ts`
  goes through `baseQueryWithReauth`, so token refresh works for downloads too.

## QR code: verify + view links

Each invoice PDF has a **QR code** that opens a **public verification page**, plus both links written out as text:
- `/verify/<invoiceToken>`: "Genuine ShopVerse invoice", with number, issue date, total and paid/refunded status
- `/orders/<id>`: the full order (login required)

**Why a separate `invoiceToken`** (migration `add_invoice_token`): the invoice number is guessable (try 41, 43…), and the order
id is used in other places (order URLs, logs). The token is `crypto.randomBytes(24)` as hex (48 characters, ~190 bits), used for
nothing else, and replaceable without touching the order. Existing invoices were back-filled in the migration with
`replace(gen_random_uuid()::text, '-', '') || left(…, 16)` (same 48-hex format, one per row, unique index created after the fill).

**Public endpoint** `GET /api/invoices/verify/:token` ([`modules/invoices/invoices.routes.ts`](../../backend/src/modules/invoices/invoices.routes.ts)):
- no login (the person checking may be an accountant, an employer or a tax officer)
- returns **only** number, issue date, total, currency and `PAID`/`REFUNDED`: no name, email, address or items
- token format-checked (`^[a-f0-9]{48}$`); unknown → 404 *"No ShopVerse invoice matches this code"*
- `Cache-Control: no-store`, because a refund changes the answer
- no rate limiting needed: a 190-bit token can't be guessed or enumerated (unlike a login form)

**In the PDF:** a 96 pt QR (error correction level **M**, so it still scans if the printout is slightly smudged), with the full
domain printed next to it so people can see where it leads before trusting it (QR phishing, "quishing"), and both links as text
for screen readers and single-device readers.

**Store page** `/verify/:token` (public, lazy-loaded): a skeleton while checking, then ✅ genuine/paid, ↺ genuine/refunded, or ⚠ not found
("the document may have been altered").

**Tested:** 388 invoices back-filled with 388 distinct 48-character tokens. Verify works without login. A wrong token → 404, malformed → 400.
The response contains no personal data. The PDF was checked visually. Locally the QR encodes `localhost` (scan it on the live site).

## Concepts to be able to explain

1. Why can't invoice numbers just be order ids, `MAX()+1` or a sequence?
2. How does the counter row prevent both duplicates and gaps?
3. Why is the invoice number assigned in the same transaction as "PAID"?
4. Why fetch card details from Stripe once instead of on each download? What do we never store?
5. Why does the browser download use `fetch` + a temporary object URL instead of a normal link?
6. Why `Cache-Control: private, no-store` on invoices?
7. Why does the QR code use a random token instead of the invoice number or order id?
8. What may a public verification page show, and what must it never show?
9. What is "quishing", and what in our PDF helps people avoid it?
