# Feature Implementation Tracker

Status legend: ✅ Done · 🚧 In progress · ⬜ Planned

Each feature has a doc in [`docs/features/`](./features) explaining what it does on the
**backend** and on the **frontend**, and which real-world concepts it demonstrates.

## Phase overview

| Phase | Theme | Status |
|---|---|---|
| 1 | Foundation, authentication, product catalog | ✅ Done |
| 2 | Cart, wishlist, coupons | ✅ Done |
| 3 | Checkout, Stripe payments + webhooks, inventory reservation, orders, order emails | ✅ Done |
| 4 | Reviews & ratings, advanced search (full-text + facets) | ⬜ Planned |
| 5 | Admin panel: product management, order management, analytics dashboard | ⬜ Planned |
| 6 | AI: product recommendations + AI shopping assistant | ⬜ Planned |
| 7 | Tests, deployment, README screenshots, polish | ⬜ Planned |

## Features

| # | Feature | Backend | Frontend | Doc | Key concepts |
|---|---|---|---|---|---|
| 0 | Project foundation | ✅ | ✅ | [Architecture](./ARCHITECTURE.md) | Layered architecture, env validation, central error handling |
| 1 | Authentication | ✅ | ✅ | [01-authentication](./features/01-authentication.md) | JWT access tokens, refresh token rotation, httpOnly cookies, bcrypt, RBAC |
| 2 | Product catalog & category tabs | ✅ | ✅ | [02-catalog](./features/02-catalog.md) | Product variants, filtering, sorting, pagination, URL state, caching |
| 3 | Cart | ✅ | ✅ | [03-cart](./features/03-cart.md) | Server-side cart, optimistic updates, stock validation |
| 4 | Wishlist | ✅ | ✅ | [04-wishlist](./features/04-wishlist.md) | Toggle pattern, unique constraints |
| 5 | Coupons | ✅ | ✅ | [05-coupons](./features/05-coupons.md) | Discount rules (%, fixed, min order, expiry, usage limits) |
| 6 | Checkout + Stripe payments | ✅ | ✅ | [06-checkout-stripe](./features/06-checkout-stripe.md) | Stripe Checkout Sessions, never trusting client prices |
| 7 | Stripe webhooks | ✅ | - | [07-stripe-webhooks](./features/07-stripe-webhooks.md) | Signature verification, idempotency, event-driven state |
| 8 | Inventory concurrency | ✅ | ✅ | [08-orders-and-inventory](./features/08-orders-and-inventory.md) | Stock reservations, atomic conditional updates, expiry job |
| 9 | Orders & order history | ✅ | ✅ | [08-orders-and-inventory](./features/08-orders-and-inventory.md) | Order lifecycle (state machine), price snapshots |
| 10 | Order emails | ✅ | - | [10-order-emails](./features/10-order-emails.md) | Transactional email (Resend), side effects after commit |
| 11 | Reviews & ratings | ⬜ | ⬜ | - | Verified-buyer check, denormalized rating stats |
| 12 | Advanced search | ⬜ | ⬜ | - | PostgreSQL full-text search, ranking, facet counts, debouncing |
| 13 | Admin: product & order management | ⬜ | ⬜ | - | Role-based access, CRUD, order status transitions |
| 14 | Admin analytics dashboard | ⬜ | ⬜ | - | SQL aggregations, time series, charts |
| 15 | AI recommendations | ⬜ | ⬜ | - | Co-purchase + similarity, LLM re-ranking |
| 16 | AI shopping assistant | ⬜ | ⬜ | - | LLM tool use (searches the real catalog), streaming responses |

## Change log

| Date | Change |
|---|---|
| 2026-10-15 | Phase 1: project setup, full database schema, auth (register/login/refresh/logout/me), catalog API + UI with category tabs, filters, sorting, pagination, product page with variants, seed data (24 products, 4 categories). |
| 2026-10-16 | Phase 2: cart (server-side cart API with stock checks and a quantity limit, cart page with optimistic updates, Add to cart button, header cart badge). |
| 2026-10-16 | Phase 2: wishlist (idempotent save/unsave API, heart button on product cards and product page, wishlist page, header link). Shared product card shape moved to catalog.service.ts. |
| 2026-10-16 | Phase 2: coupons (server-side coupon preview with expiry, usage-limit and minimum-order rules, coupon box and discount lines in the cart, FLASH50 demo coupon). Phase 2 complete. |
| 2026-10-16 | Phase 3, step 1: orders API (place, list, view, cancel), atomic stock reservation (no overselling), price snapshots, coupon redemption, expiry job that cancels unpaid orders after 30 min. |
| 2026-10-16 | Phase 3, step 2: Stripe Checkout. Placing an order opens a Stripe payment page (prices from the order snapshot, one-time coupon for the discount, idempotency keys, 30-min page expiry with 32-min stock hold), "pay now" endpoint, order released if Stripe fails. |
| 2026-10-16 | Phase 3, step 3: Stripe webhook (signature check on the raw body, idempotent by event id and by conditional updates). Orders become PAID (reservations consumed, bought items removed from cart), expired sessions release stock, late payments for cancelled orders are refunded automatically. |
| 2026-10-16 | Phase 3, step 4: frontend for checkout and orders. Checkout button in the cart, My orders page, order page with status banner (polls until the webhook confirms payment, Pay now / Cancel for unpaid orders), header link. |
| 2026-10-16 | Phase 3, step 5: order confirmation emails via Resend (sent after the PAID transaction commits, once per order, dev redirect to the developer's inbox, console fallback without an API key). Phase 3 complete. |
