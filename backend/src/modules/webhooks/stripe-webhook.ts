import type { Request, Response } from 'express';
import type Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { stripe } from '../../lib/stripe.js';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
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
export async function handleStripeWebhook(req: Request, res: Response) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set; cannot verify events');
    return res.status(500).json({ error: { message: 'Webhook not configured' } });
  }

  // 1. Signature check. It needs the raw request body exactly as Stripe sent it (a Buffer),
  //    which is why this route is registered BEFORE express.json() in app.ts.
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'] as string, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.warn('[stripe-webhook] rejected: invalid signature', (err as Error).message);
    return res.status(400).json({ error: { message: 'Invalid signature' } });
  }

  // 2a. Already handled this exact event? Then just say OK.
  const seen = await prisma.processedWebhookEvent.findUnique({ where: { id: event.id } });
  if (seen) return res.json({ received: true, duplicate: true });

  // If handling throws, we answer 500 and DON'T record the event, so Stripe sends it again later.
  const outcome = await handleEvent(event);
  console.log(`[stripe-webhook] ${event.type} ${event.id}: ${outcome}`);

  // 2b. Remember it. (The handlers are idempotent on their own too, so if two copies
  //     arrive at the same moment and both get here, the second insert just fails harmlessly.)
  try {
    await prisma.processedWebhookEvent.create({ data: { id: event.id, type: event.type } });
  } catch (err) {
    if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002')) throw err;
  }

  res.json({ received: true });
}

async function handleEvent(event: Stripe.Event): Promise<string> {
  switch (event.type) {
    // Customer finished the payment page. For cards, the money is already captured.
    // (Some payment methods, like bank debits, confirm later: payment_status is then
    // "unpaid" and Stripe sends async_payment_succeeded when the money arrives.)
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (!orderId) return 'ignored (no orderId in metadata)';
      if (session.payment_status !== 'paid') return 'waiting (payment not captured yet)';
      return markOrderPaid(orderId, session.payment_intent as string);
    }

    // Payment page closed without paying: give the stock back now instead of
    // waiting for the expiry job.
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      const orderId = event.data.object.metadata?.orderId;
      if (!orderId) return 'ignored (no orderId in metadata)';
      return (await releaseOrder(orderId)) ? 'order cancelled, stock returned' : 'already not pending';
    }

    default:
      return 'ignored (event type not used)'; // still answer 200, or Stripe keeps retrying
  }
}
