# Features 8 & 9: Orders and Inventory Reservation

**Status:** 🚧 Backend done (Phase 3, step 1). Payment (Stripe) and the frontend pages come next.

Placing an order turns the cart into a `PENDING` order, freezes its prices, holds the stock
for 30 minutes and uses up the coupon. If the order isn't paid in time, a background job
cancels it and gives everything back. The store can never sell more units than it has, even
when customers order at the same moment.

## The order lifecycle (state machine)

```
            place order                 payment confirmed (Step 3: webhook)
  (cart) ───────────────▶ PENDING ─────────────────────────────▶ PAID ──▶ SHIPPED ──▶ DELIVERED
                            │                                     │
          30 min passed /   │                                     └──▶ REFUNDED
          user cancelled /  ▼
          new order placed  CANCELLED  (stock and coupon use returned)
```

Every status change is a **conditional update** (`WHERE status = 'PENDING'`), so an order can
never be both paid and cancelled, even if the payment and the expiry job happen at the same time.

## Backend side

Files: [`backend/src/modules/orders/`](../../backend/src/modules/orders) and
[`backend/src/jobs/expire-orders.job.ts`](../../backend/src/jobs/expire-orders.job.ts)

All endpoints need a logged-in user.

| Endpoint | Body | What it does |
|---|---|---|
| `POST /api/orders` | `{ couponCode? }` | Place an order from the current cart |
| `GET /api/orders` | | My orders, newest first |
| `GET /api/orders/:id` | | One of my orders (another user's order returns 404) |
| `POST /api/orders/:id/cancel` | | Cancel my unpaid order |

**What `createOrder` does** (`orders.service.ts`), all in **one database transaction**:
1. Cancels the user's previous unpaid order, if any. A customer has at most one.
2. Re-checks the cart (not empty, no stock issues) and the coupon (the cart only previewed it).
3. For each item, **takes the stock atomically**:
   `UPDATE variant SET stock = stock - N WHERE id = ? AND stock >= N`.
   If 0 rows match, someone else got there first: the whole transaction is undone and the user gets a `409`.
4. Uses up the coupon atomically: `usedCount + 1` only if `usedCount < maxUses`.
5. Creates the order with a **snapshot** of each item (name, variant, unit price) and a
   `StockReservation` per item that expires in 30 minutes.

The cart is **not** emptied. That happens only when payment succeeds, so closing the payment page doesn't lose the cart.

**How stock is counted:** `ProductVariant.stock` = units available to sell. A reservation takes
units out straight away. On payment the reservation becomes `CONSUMED`. On cancel or expiry it
becomes `RELEASED` and the units are added back.

**`releaseOrder`**: flips `PENDING → CANCELLED` with a conditional update, then returns stock and
the coupon use. If the order was already paid or cancelled, it does nothing, so it's safe to run twice.

**Expiry job:** every minute (and once at startup), cancels `PENDING` orders whose reservation
expired. It skips a tick if the previous run is still going.

## Tested

| Test | Result |
|---|---|
| Place an order (2 items + WELCOME10) | `PENDING`, stock −2, coupon uses +1, 10% discount, prices snapshotted |
| Place a second order | The first is `CANCELLED` and its stock and coupon are returned, so nothing is held twice |
| Cancel, then cancel again | Stock returned; the second cancel is rejected |
| Open another user's order | `404 Order not found` |
| **2 customers, 1 unit left, simultaneous orders** | One `201`, one `409 "just sold out"`. Stock 0, never −1 |
| Reservation time runs out | The job cancels the order within a minute and stock goes back to 1 |

## Concepts to be able to explain

1. Why is "check stock, then update stock" unsafe, and how does a conditional `UPDATE` fix it?
2. What does a database transaction guarantee if the 3rd item in an order is sold out?
3. Why copy product names and prices into `OrderItem` instead of linking to the product?
4. Why isn't the cart emptied when the order is placed?
5. Why does stock need to be *held* during payment, and what happens if the customer never pays?
