// import = bring in code from another file or package
import { Prisma } from '@prisma/client';
// import = bring in code from another file or package
import { stripe } from '../../lib/stripe.js';
// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from '../../config/env.js';
// import = bring in code from another file or package
import { markOrderPaid, releaseOrder } from '../orders/orders.service.js';

// POST /api/webhooks/stripe
//
// A webhook is Stripe calling OUR server: "this payment succeeded", "this page expired".
// It's the only trustworthy proof of payment: the browser's redirect to the success page
// can be faked, a signed message from Stripe can't.
//
// Rules every webhook handler follows:
//  1. Verify the signature, so nobody can fake a "payment succeeded" message.
//  2. Be idempotent: Stripe may send the same event more than once.
//  3. Answer quickly with 2xx. Anything else makes Stripe retry (for up to 3 days).
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function handleStripeWebhook(req, res) {
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // env = the checked settings from .env (config/env.js)
  if (!env.STRIPE_WEBHOOK_SECRET) {
    // console.log / warn / error = print to the server log
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set; cannot verify events');
    // return = give this value back and stop the function here
    // res.status(code) = set the HTTP status code (201 created, 404...)
    return res.status(500).json({ error: { message: 'Webhook not configured' } });
  }

  // 1. Signature check. It needs the raw request body exactly as Stripe sent it (a Buffer),
  //    which is why this route is registered BEFORE express.json() in app.ts.
  // let = a name whose value can be changed later
  let event;
  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // stripe.webhooks.constructEvent = check the event really came from Stripe (signature)
    // req.body = the JSON sent with POST/PUT/PATCH
    // obj[key] = read the property whose name is stored in key
    // req.headers = the request headers
    // env = the checked settings from .env (config/env.js)
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    // console.log / warn / error = print to the server log
    console.warn('[stripe-webhook] rejected: invalid signature', err.message);
    // return = give this value back and stop the function here
    // res.status(code) = set the HTTP status code (201 created, 404...)
    return res.status(400).json({ error: { message: 'Invalid signature' } });
  }

  // 2a. Already handled this exact event? Then just say OK.
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.processedWebhookEvent = the ProcessedWebhookEvent table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  const seen = await prisma.processedWebhookEvent.findUnique({ where: { id: event.id } });
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  // res.json = send this object as JSON (status 200 unless set)
  if (seen) return res.json({ received: true, duplicate: true });

  // If handling throws, we answer 500 and DON'T record the event, so Stripe sends it again later.
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  const outcome = await handleEvent(event);
  // console.log / warn / error = print to the server log
  // `text ${x}` = a template string: text with values inserted
  console.log(`[stripe-webhook] ${event.type} ${event.id}: ${outcome}`);

  // 2b. Remember it. (The handlers are idempotent on their own too, so if two copies
  //     arrive at the same moment and both get here, the second insert just fails harmlessly.)
  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // await = wait for a Promise (async result) before continuing
    // prisma.processedWebhookEvent = the ProcessedWebhookEvent table (model in prisma/schema.prisma)
    // create = insert one new row (INSERT)
    // data = Prisma: the values to write
    await prisma.processedWebhookEvent.create({ data: { id: event.id, type: event.type } });
  } catch (err) {
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // a && b = AND; in JSX: show b only when a is true
    // === = strictly equal (same value AND same type)
    // throw = stop here with an error
    if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002')) throw err;
  }

  // res.json = send this object as JSON (status 200 unless set)
  res.json({ received: true });
}

// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function handleEvent(event) {
  switch (event.type) {
    // Customer finished the payment page. For cards, the money is already captured.
    // (Some payment methods, like bank debits, confirm later: payment_status is then
    // "unpaid" and Stripe sends async_payment_succeeded when the money arrives.)
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      // const = a name for a value that is never reassigned
      const session = event.data.object;
      // const = a name for a value that is never reassigned
      // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
      const orderId = session.metadata?.orderId;
      // if (...) = run the next part only when the condition is true
      // ! = NOT: flips true/false
      // return = give this value back and stop the function here
      if (!orderId) return 'ignored (no orderId in metadata)';
      // if (...) = run the next part only when the condition is true
      // !== = not strictly equal
      // return = give this value back and stop the function here
      if (session.payment_status !== 'paid') return 'waiting (payment not captured yet)';
      // return = give this value back and stop the function here
      return markOrderPaid(orderId, session.payment_intent);
    }

    // Payment page closed without paying: give the stock back now instead of
    // waiting for the expiry job.
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      // const = a name for a value that is never reassigned
      // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
      const orderId = event.data.object.metadata?.orderId;
      // if (...) = run the next part only when the condition is true
      // ! = NOT: flips true/false
      // return = give this value back and stop the function here
      if (!orderId) return 'ignored (no orderId in metadata)';
      // return = give this value back and stop the function here
      // a ? b : c = ternary: if a then b else c
      // await = wait for a Promise (async result) before continuing
      return (await releaseOrder(orderId)) ? 'order cancelled, stock returned' : 'already not pending';
    }

    default:
      // return = give this value back and stop the function here
      return 'ignored (event type not used)'; // still answer 200, or Stripe keeps retrying
  }
}
