// import = bring in code from another file or package
import { stripe } from '../../lib/stripe.js';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from '../../config/env.js';
// import = bring in code from another file or package
// badRequest = HttpError 400: the request is invalid
import { badRequest } from '../../lib/http-error.js';

// Stripe Checkout: Stripe hosts the payment page. The customer types their card details
// on stripe.com, so card numbers never touch our servers (much less security risk, and
// we don't need PCI certification to take payments).

// The payment page closes after 30 minutes (the shortest Stripe allows).
// Stock is held a little longer (see RESERVATION_MINUTES), so a customer can't pay at the
// last second for stock that was already given back.
// export = other files can import this
// const = a name for a value that is never reassigned
export const CHECKOUT_PAGE_MINUTES = 30;

// returnTo: the store address Stripe sends the customer back to (see lib/store-origin.ts).
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
// x = value (in parameters) = the default used when x is not given
// env = the checked settings from .env (config/env.js)
export async function createCheckoutSession(order, customerEmail, returnTo = env.CLIENT_URL) {
  // The discount is passed to Stripe as a one-time coupon for exactly this order's discount,
  // so the total the customer pays on Stripe matches order.total to the cent.
  // const = a name for a value that is never reassigned
  const stripeCoupon =
    // a ? b : c = ternary: if a then b else c
    order.discount > 0
      // await = wait for a Promise (async result) before continuing
      // stripe.coupons = discounts on the Stripe side
      ? await stripe.coupons.create(
          {
            amount_off: order.discount,
            currency: 'usd',
            duration: 'once',
            max_redemptions: 1,
            // a ?? b = a, unless a is null/undefined, then b
            name: order.couponCode ?? 'Discount',
          },
          // `text ${x}` = a template string: text with values inserted
          { idempotencyKey: `coupon-${order.id}` },
        )
      : null;

  // return = give this value back and stop the function here
  // stripe.checkout.sessions = Stripe's hosted payment page
  return stripe.checkout.sessions.create(
    {
      // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
      mode: 'payment',
      customer_email: customerEmail,
      // Prices come from the order snapshot in our database, never from the browser.
      // .map = make a new array by transforming each item
      // => = an arrow function (a short function)
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: item.unitPrice, // cents
          product_data: {
            // `text ${x}` = a template string: text with values inserted
            name: `${item.productName} (${item.variantName})`,
            // ...x = spread: copy all items/properties of x into here
            // a && b = AND; in JSX: show b only when a is true
            ...(item.image && { images: [item.image] }),
          },
        },
      })),
      // ...x = spread: copy all items/properties of x into here
      // a && b = AND; in JSX: show b only when a is true
      ...(stripeCoupon && { discounts: [{ coupon: stripeCoupon.id }] }),
      // Links the Stripe payment back to our order. The webhook (next step) reads this.
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      payment_intent_data: { metadata: { orderId: order.id } },
      // Math = number helpers (min, max, round, floor, ceil...)
      // Date = a point in time (Date.now() = milliseconds since 1970)
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_PAGE_MINUTES * 60,
      // Where Stripe sends the customer afterwards. Landing on success_url does NOT prove
      // payment (anyone can type that URL). Only the webhook marks an order as paid.
      // `text ${x}` = a template string: text with values inserted
      success_url: `${returnTo}/orders/${order.id}?payment=success`,
      // `text ${x}` = a template string: text with values inserted
      cancel_url: `${returnTo}/orders/${order.id}?payment=cancelled`,
    },
    // Idempotency key: if this request is sent twice (a retry after a network error),
    // Stripe returns the same session instead of creating a second one.
    // `text ${x}` = a template string: text with values inserted
    { idempotencyKey: `checkout-${order.id}` },
  );
}

// "Pay now" for an order whose payment page was closed: reuse the same Stripe page while it's still open.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getCheckoutUrl(stripeSessionId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // stripe.checkout.sessions = Stripe's hosted payment page
  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  // if (...) = run the next part only when the condition is true
  // !== = not strictly equal
  // a || b = OR: a if it is truthy, else b
  // ! = NOT: flips true/false
  if (session.status !== 'open' || !session.url) {
    // throw = stop here with an error
    // badRequest = HttpError 400: the request is invalid
    throw badRequest('The payment page has expired. Please place the order again from your cart.');
  }
  // return = give this value back and stop the function here
  return session.url;
}
