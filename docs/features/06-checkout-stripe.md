# Feature 6: Checkout with Stripe

**Status:** 🚧 Backend done (Phase 3, step 2). The webhook (step 3) and the frontend (step 4) come next.

"Place order" creates the order (stock held, see [08-orders-and-inventory](./08-orders-and-inventory.md))
and opens a **Stripe Checkout** page where the customer pays. Stripe hosts the page, so card
numbers never reach our servers.

## The flow

```
Browser                 Our backend                          Stripe
  │ POST /api/orders       │                                   │
  │───────────────────────▶│ 1. create order (PENDING, stock held)
  │                        │ 2. create Checkout Session ──────▶│
  │                        │◀────────────── session.url ───────│
  │◀── { order, checkoutUrl }                                  │
  │ redirect to checkoutUrl ──────────────────────────────────▶│ customer pays
  │◀──────────── redirect to success_url / cancel_url ─────────│
  │                        │◀──── webhook "paid" (step 3) ─────│  ← the ONLY proof of payment
```

## Backend side

Files: [`backend/src/modules/payments/payments.service.ts`](../../backend/src/modules/payments/payments.service.ts),
[`backend/src/lib/stripe.ts`](../../backend/src/lib/stripe.ts), `checkout` and `getPaymentUrl` in `orders.service.ts`.

| Endpoint | What it does |
|---|---|
| `POST /api/orders` | Creates the order **and** the Stripe session. Returns `{ order, checkoutUrl }` |
| `POST /api/orders/:id/pay` | "Pay now" for an unpaid order: returns the same Stripe page while it's still open |

**Config:** `STRIPE_SECRET_KEY` in `backend/.env` (test key `sk_test_...`). It's checked at startup in `config/env.ts`.

**Session details** (`createCheckoutSession`):
- **Line items** are built from the order's price snapshot (`unit_amount` in cents), never from the browser.
- **Discount:** a one-time Stripe coupon for exactly `order.discount` cents, so Stripe's total equals `order.total`.
- **Links to our order:** `client_reference_id`, `metadata.orderId` and `payment_intent_data.metadata.orderId`.
  The webhook uses these to find the order.
- **Expiry:** the page closes after 30 min. Stock is held for 32 min (`RESERVATION_MINUTES`), so
  the page always closes before the stock is given back.
- **Idempotency keys** (`checkout-<orderId>`, `coupon-<orderId>`): a retried request returns the
  same session or coupon instead of creating duplicates.
- `success_url` and `cancel_url` both go to `/orders/:id`. Landing on `success_url` is **not** proof of
  payment, because anyone can type that URL. Only the webhook marks an order as paid.

**If Stripe fails** (network error, bad key): the order is released (stock and coupon returned) and the
user gets `502 "The payment service is unavailable"`.

**Tested:** order total $124.20 (2 × $69 − 10%) matched Stripe's `amount_total` (12420) exactly. The
session is `open`, `metadata.orderId` points to the order, and "pay now" returns the same page.

## Test cards (test mode only)

| Card number | Result |
|---|---|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0025 0000 3155` | Asks for 3-D Secure authentication |

Use any future expiry date, any 3-digit CVC and any postcode.

## Concepts to be able to explain

1. Why do stores use a hosted payment page instead of a card form on their own site?
2. Why is reaching the success page not proof that the customer paid?
3. What is an idempotency key and what problem does it solve?
4. Why is the payment page set to close before the stock reservation ends?
