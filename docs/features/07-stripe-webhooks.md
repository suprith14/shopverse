# Feature 7: Stripe Webhooks

**Status:** ✅ Backend done (Phase 3, step 3)

A webhook is Stripe calling **our** server to report what happened to a payment. It's the
**only** thing that marks an order as paid. The browser landing on the success page proves nothing,
because anyone can type that URL.

## The flow

```
Customer pays on stripe.com
        │
        ▼
Stripe ── POST /api/webhooks/stripe (signed) ──▶ our backend
                                                  1. verify signature
                                                  2. already processed this event id? → 200, stop
                                                  3. handle it (order PAID / cancelled / refunded)
                                                  4. record event id
                                                  5. answer 200 (anything else → Stripe retries for up to 3 days)
```

## Backend side

Files: [`backend/src/modules/webhooks/stripe-webhook.js`](../../backend/src/modules/webhooks/stripe-webhook.js),
`markOrderPaid` in [`orders.service.js`](../../backend/src/modules/orders/orders.service.js).

**Route:** `POST /api/webhooks/stripe`. It's registered in `app.js` **before** `express.json()` with
`express.raw()`, because the signature is computed over the exact raw bytes Stripe sent.

**Config:** `STRIPE_WEBHOOK_SECRET` (`whsec_...`) in `backend/.env`. Without it, the endpoint answers 500.

**Events handled:**

| Event | What we do |
|---|---|
| `checkout.session.completed` (when `payment_status` is `paid`) | `markOrderPaid` |
| `checkout.session.async_payment_succeeded` | `markOrderPaid` (slow payment methods that confirm later) |
| `checkout.session.expired` | `releaseOrder`: cancel and return stock straight away |
| `checkout.session.async_payment_failed` | `releaseOrder` |
| anything else | Ignored, but still answered with 200 so Stripe doesn't retry |

**`markOrderPaid(orderId, paymentIntentId)`**, in one transaction:
1. `PENDING → PAID` (conditional update, so a duplicate does nothing) and save the payment intent id.
2. Reservations `ACTIVE → CONSUMED`: the units are sold for good.
3. Remove the bought variants from the user's cart. Items added after checkout stay.

**Late payment** (the order was already `CANCELLED` because its time ran out and its stock was returned):
the payment is refunded automatically (`stripe.refunds.create`, idempotency key `refund-<orderId>`)
and the order becomes `REFUNDED`.

**Idempotency, two layers:**
1. The `ProcessedWebhookEvent` table stores each handled event id, so a repeated event returns `{ duplicate: true }`.
2. Every handler is idempotent on its own (conditional status updates), so even two copies arriving at the same moment are safe.

If handling throws, we answer 500 and don't record the event, so Stripe sends it again later.

## Local development: Stripe CLI

Stripe can't reach `localhost`, so the Stripe CLI forwards events to your laptop:

```powershell
stripe login
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired --forward-to localhost:4000/api/webhooks/stripe
```

Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET` and **restart the backend**, because `.env` is
read only at startup. Keep `stripe listen` running while testing payments.
To replay an event: `stripe events resend evt_...`.

In production there's no CLI. You register the public URL (e.g. `https://api.shopverse.com/api/webhooks/stripe`)
in the Stripe dashboard and get a different `whsec_` secret for it.

## Tested

| Test | Result |
|---|---|
| Unsigned request | `400 Invalid signature` |
| Body changed after signing (fake event) | `400 Invalid signature` |
| Payment made in time | Order `PAID`, reservation `CONSUMED`, item removed from cart, stock not returned |
| Same event delivered again (signed) | `200 { duplicate: true }`, nothing processed twice |
| Payment arrived after the order expired | Order `REFUNDED`, $124.20 refund `succeeded` on Stripe |

## Concepts to be able to explain

1. Why is the webhook, and not the success page, the source of truth for payment?
2. What does the signature check protect against, and why does it need the raw body?
3. Why must webhook handlers be idempotent? Name the two layers used here.
4. Why answer 200 for event types we ignore?
5. What should a store do when money arrives for an order it already cancelled?
