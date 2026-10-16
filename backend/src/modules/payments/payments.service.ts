import { stripe } from '../../lib/stripe.js';
import { env } from '../../config/env.js';
import { badRequest } from '../../lib/http-error.js';
import type { OrderResponse } from '../orders/orders.service.js';

// Stripe Checkout: Stripe hosts the payment page. The customer types their card details
// on stripe.com, so card numbers never touch our servers (much less security risk, and
// we don't need PCI certification to take payments).

// The payment page closes after 30 minutes (the shortest Stripe allows).
// Stock is held a little longer (see RESERVATION_MINUTES), so a customer can't pay at the
// last second for stock that was already given back.
export const CHECKOUT_PAGE_MINUTES = 30;

// returnTo: the store address Stripe sends the customer back to (see lib/store-origin.ts).
export async function createCheckoutSession(order: OrderResponse, customerEmail: string, returnTo: string = env.CLIENT_URL) {
  // The discount is passed to Stripe as a one-time coupon for exactly this order's discount,
  // so the total the customer pays on Stripe matches order.total to the cent.
  const stripeCoupon =
    order.discount > 0
      ? await stripe.coupons.create(
          {
            amount_off: order.discount,
            currency: 'usd',
            duration: 'once',
            max_redemptions: 1,
            name: order.couponCode ?? 'Discount',
          },
          { idempotencyKey: `coupon-${order.id}` },
        )
      : null;

  return stripe.checkout.sessions.create(
    {
      mode: 'payment',
      customer_email: customerEmail,
      // Prices come from the order snapshot in our database, never from the browser.
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: item.unitPrice, // cents
          product_data: {
            name: `${item.productName} (${item.variantName})`,
            ...(item.image && { images: [item.image] }),
          },
        },
      })),
      ...(stripeCoupon && { discounts: [{ coupon: stripeCoupon.id }] }),
      // Links the Stripe payment back to our order. The webhook (next step) reads this.
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      payment_intent_data: { metadata: { orderId: order.id } },
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_PAGE_MINUTES * 60,
      // Where Stripe sends the customer afterwards. Landing on success_url does NOT prove
      // payment (anyone can type that URL). Only the webhook marks an order as paid.
      success_url: `${returnTo}/orders/${order.id}?payment=success`,
      cancel_url: `${returnTo}/orders/${order.id}?payment=cancelled`,
    },
    // Idempotency key: if this request is sent twice (a retry after a network error),
    // Stripe returns the same session instead of creating a second one.
    { idempotencyKey: `checkout-${order.id}` },
  );
}

// "Pay now" for an order whose payment page was closed: reuse the same Stripe page while it's still open.
export async function getCheckoutUrl(stripeSessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  if (session.status !== 'open' || !session.url) {
    throw badRequest('The payment page has expired. Please place the order again from your cart.');
  }
  return session.url;
}
