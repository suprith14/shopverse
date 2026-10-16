# Features 13 & 14: Admin API (products, orders, analytics)

**Status:** 🚧 Backend done (Phase 5, step 1). The separate `admin/` app comes next.

Everything an admin can do is in **one folder**: [`backend/src/modules/admin/`](../../backend/src/modules/admin).

```
modules/admin/
├── admin.routes.ts      /api/admin: requireAuth + requireRole('ADMIN') ONCE for everything below
├── products/            /api/admin/products
├── orders/              /api/admin/orders
└── analytics/           /api/admin/analytics
```

Because the role check sits on the parent router, any admin route added later is protected
automatically. No token → `401`. Logged in but not an admin → `403`.

## Products: `/api/admin/products`

| Endpoint | What it does |
|---|---|
| `GET /` | List, **including hidden products**. Filters: `q` (name, brand or **SKU**), `category`, `status` (`all`/`active`/`hidden`), `lowStock=true`. Each item has `totalStock` and `lowStock` |
| `GET /categories` | Categories for the product form |
| `GET /:id` | One product with all variants |
| `POST /` | Create a product with its variants. The slug is generated and kept unique (`test-smartwatch`, `test-smartwatch-2`) |
| `PATCH /:id` | Edit fields, or **hide/show** it with `{ isActive }` |
| `POST /:id/variants` | Add a variant |
| `PATCH /variants/:variantId` | Change a variant's name, price or options |
| `DELETE /variants/:variantId` | Delete a variant, **only if it was never ordered** and isn't the last one |
| `POST /variants/:variantId/stock` | `{ delta: +10 }` or `{ delta: -2 }`: adjust stock |

**Rules and why:**
- **No product delete: hide instead (soft delete).** Past orders point at products and variants, and order history must stay intact.
- **The slug never changes when renaming**, so shared links and search results keep working.
- **Stock is adjusted by a delta, never overwritten.** "Set stock to 50" could erase a sale that happened a second earlier.
  `+10` is applied atomically to the current value, and a decrease only happens if enough stock is left (the same idea as checkout).
- **`basePrice`** (cheapest variant) is recalculated whenever variants change, because the shop filters and sorts by it.
- **SKUs are unique store-wide**, so a duplicate gets `409 "A variant with this SKU already exists"`.
- Changing a price **never changes past orders**, which keep their snapshot price.

## Orders: `/api/admin/orders`

| Endpoint | What it does |
|---|---|
| `GET /` | All orders, newest first. `status` filter. `q` matches the order number (`#RHXB9NEJ`), customer name or email |
| `GET /:id` | Full order: customer, items with SKU, coupon, reservations |
| `PATCH /:id/status` | `{ status: 'SHIPPED' }` (from PAID) or `{ status: 'DELIVERED' }` (from SHIPPED) |
| `POST /:id/refund` | `{ restock: boolean }`: refund through Stripe; restock if the items came back |

**State machine:** admins can only move orders **forward one step** (`PAID → SHIPPED → DELIVERED`)
and refund paid orders. `PAID` and `CANCELLED` are set only by the payment flow. Every change is a
conditional update, so double clicks and out-of-date screens can't skip or repeat a step.

**Refund order of operations:** first call Stripe with idempotency key `refund-<orderId>`, then mark the
order `REFUNDED` (+ restock) in one transaction. If the second part fails, retrying is safe: Stripe returns
the same refund instead of paying twice, and the conditional update stops a double restock.

## Analytics: `/api/admin/analytics`

All take `days` = 7, 30 or 90 (default 30). Only `PAID`, `SHIPPED` and `DELIVERED` orders count as sales.

| Endpoint | Returns |
|---|---|
| `GET /summary` | Revenue, orders, average order value, customers, new sign-ups, **plus % change vs the previous period** |
| `GET /sales` | One row **per day** (`date`, `revenue`, `orders`). `generate_series` + `LEFT JOIN` so days with no sales are 0, not missing |
| `GET /top-products` | Best sellers by revenue from the `OrderItem` price snapshot (before order-level discounts) |
| `GET /sales-by-category` | Revenue per category. Every category is listed, even at $0 (filters in the `JOIN`, not `WHERE`) |
| `GET /customers` | Total customers, new sign-ups (with % vs previous period), **active now** (15 min), **active today** (24 h), **signed in** (valid session). Admins not counted |
| `GET /orders-by-status` | Count per status, e.g. "2 PAID" = 2 orders waiting to ship |
| `GET /low-stock` | Variants with stock ≤ 5 on visible products |

Each widget has its own endpoint, so they load in parallel and a slow one doesn't block the others.

**How "active" is tracked** (migration `add_user_activity`, [`lib/activity.ts`](../../backend/src/lib/activity.ts)):
`User.lastSeenAt` is updated by every logged-in request (`requireAuth`), login and session refresh, but
**at most once per user every 5 minutes** (an in-memory throttle), and fire-and-forget, so requests never wait for it.
Indexes on `lastSeenAt` and `createdAt` keep the counts fast.
- **Why Postgres and not Redis:** throttled, it's ~1 write per active user per 5 minutes, which is negligible at this scale.
  At tens of thousands of active users, "last seen" would move to Redis (in-memory, keys that expire on their own).
- **Precision:** "active" is accurate to about 5 minutes. Guests aren't counted, since that would need tracking cookies.
- "Signed in" comes from the existing `RefreshToken` table (unexpired, not revoked), so no new data was needed for it.
Days are UTC days.

## Tested

| Test | Result |
|---|---|
| Guest / customer / admin on `/api/admin/products` | `401` / `403` / `200` |
| Create product with 2 variants, lowercase SKU | Created, SKU uppercased, `basePrice` = cheapest |
| Same name again | Slug `test-smartwatch-2` |
| Duplicate SKU / invalid input | `409` / every bad field listed |
| Stock +10, then −50 | 13, then `"Can't remove 50: only 13 in stock"` |
| Lower a variant price | `basePrice` follows |
| Delete unused / last / ordered variant | Deleted / refused / refused |
| Hide product | Gone from shop search, listed under `status=hidden` |
| Search orders by `#RHXB9NEJ` and by email | Found |
| PAID → DELIVERED / → SHIPPED / SHIPPED again / → DELIVERED | Refused / OK / refused / OK |
| Set PAID by hand, refund a refunded order | Both refused |
| Analytics | Matches real data (2 paid orders × $129.99), 7 days of series with zeros filled in |

## Concepts to be able to explain

1. Why is the role check on the parent router instead of on each route?
2. Why hide products instead of deleting them?
3. Why adjust stock by a delta instead of setting it?
4. When a change involves Stripe *and* our database, which goes first and why?
5. Why does a per-day sales query need `generate_series`?
6. Why does putting a filter in `WHERE` instead of `JOIN … ON` change the result of a `LEFT JOIN`?
