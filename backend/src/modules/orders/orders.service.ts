import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { stripe } from '../../lib/stripe.js';
import { HttpError, badRequest, conflict, notFound } from '../../lib/http-error.js';
import { getCart } from '../cart/cart.service.js';
import { calculateDiscount, findCoupon } from '../coupons/coupons.service.js';
import { createCheckoutSession, getCheckoutUrl } from '../payments/payments.service.js';
import type { CreateOrderInput } from './orders.schema.js';

// How long stock is held for an unpaid order. The Stripe payment page closes after 30
// minutes; the 2 extra minutes make sure it always closes BEFORE the stock is given back.
export const RESERVATION_MINUTES = 32;

// How stock works:
//   ProductVariant.stock = units AVAILABLE TO SELL right now.
//   Placing an order takes the units out of stock straight away and records a
//   StockReservation (ACTIVE). Then:
//     paid      -> reservation CONSUMED (units are gone for good)
//     not paid  -> reservation RELEASED and the units are added back to stock

const orderInclude = {
  items: {
    select: {
      id: true,
      variantId: true,
      productName: true,
      variantName: true,
      unitPrice: true,
      quantity: true,
      variant: { select: { product: { select: { slug: true, images: true } } } },
    },
  },
  coupon: { select: { code: true } },
  reservations: { select: { expiresAt: true }, take: 1 },
} satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function toOrderResponse({ items, coupon, reservations, ...order }: OrderRow) {
  return {
    ...order,
    couponCode: coupon?.code ?? null,
    // Unpaid orders must be paid before this time, or they are cancelled automatically.
    paymentDeadline: order.status === 'PENDING' ? (reservations[0]?.expiresAt ?? null) : null,
    items: items.map(({ variant, ...item }) => ({
      ...item,
      productSlug: variant.product.slug,
      image: variant.product.images[0] ?? null,
      lineTotal: item.unitPrice * item.quantity,
    })),
  };
}

export type OrderResponse = ReturnType<typeof toOrderResponse>;

// ------------------------------------------------------------------ Checkout

// What "Place order" does: create the order (stock held), then open a Stripe payment page for it.
export async function checkout(userId: string, input: CreateOrderInput) {
  const order = await createOrder(userId, input);
  const { email } = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });

  try {
    const session = await createCheckoutSession(order, email);
    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    return { order, checkoutUrl: session.url! };
  } catch (err) {
    // No payment page means the customer can't pay, so don't keep their stock locked.
    console.error('[checkout] Stripe session failed', err);
    await releaseOrder(order.id);
    throw new HttpError(502, 'The payment service is unavailable. Please try again in a moment.');
  }
}

// "Pay now" on an unpaid order.
export async function getPaymentUrl(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId }, select: { status: true, stripeSessionId: true } });
  if (!order) throw notFound('Order not found');
  if (order.status !== 'PENDING' || !order.stripeSessionId) throw badRequest('This order is not waiting for payment');
  return getCheckoutUrl(order.stripeSessionId);
}

// ------------------------------------------------------------------ Place an order

export async function createOrder(userId: string, { couponCode }: CreateOrderInput) {
  // A customer has at most one unpaid order. Placing a new one cancels the old one,
  // which gives its held stock back. (Like going back to the cart from the payment page.)
  const pending = await prisma.order.findMany({ where: { userId, status: 'PENDING' }, select: { id: true } });
  for (const order of pending) await releaseOrder(order.id);

  const cart = await getCart(userId);
  if (cart.items.length === 0) throw badRequest('Your cart is empty');
  if (cart.hasIssues) throw badRequest('Some items in your cart are unavailable. Please update your cart.');

  // The coupon is checked again here. The cart preview was only a preview.
  const coupon = couponCode ? await findCoupon(couponCode) : null;
  const discount = coupon ? calculateDiscount(coupon, cart.subtotal) : 0;
  const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

  // Everything below happens in ONE transaction: either all of it succeeds, or none of it
  // does. If the 3rd item is sold out, the stock taken for items 1 and 2 is put back too.
  const order = await prisma.$transaction(
    async (tx) => {
      for (const item of cart.items) {
        // THE anti-overselling line. "Take N units only if at least N are left" runs as one
        // atomic UPDATE in the database. If two customers race for the last unit, the database
        // runs their updates one after the other: the first one matches, the second matches
        // 0 rows. Checking stock first and updating it afterwards would NOT be safe: both
        // customers could read "1 left" before either of them updates it.
        const { count } = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (count === 0) {
          throw conflict(`Sorry, "${item.productName} (${item.variantName})" just sold out. Please update your cart.`);
        }
      }

      if (coupon) {
        // Same idea for limited coupons: count a use only if one is still left.
        // Raw SQL because it compares two columns ("usedCount" < "maxUses").
        const used = await tx.$executeRaw`
          UPDATE "Coupon" SET "usedCount" = "usedCount" + 1
          WHERE "id" = ${coupon.id} AND ("maxUses" IS NULL OR "usedCount" < "maxUses")`;
        if (used === 0) throw badRequest('This coupon is no longer available');
      }

      return tx.order.create({
        data: {
          userId,
          subtotal: cart.subtotal,
          discount,
          total: cart.subtotal - discount,
          couponId: coupon?.id,
          // Snapshot: copy names and prices into the order. If the product is renamed or
          // repriced tomorrow, this order still shows what the customer actually paid.
          items: {
            create: cart.items.map((i) => ({
              variantId: i.variantId,
              productName: i.productName,
              variantName: i.variantName,
              unitPrice: i.unitPrice,
              quantity: i.quantity,
            })),
          },
          reservations: {
            create: cart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity, expiresAt })),
          },
        },
        include: orderInclude,
      });
    },
    { timeout: 15_000 }, // the database is in the cloud, so allow for network delay
  );

  // The cart is NOT emptied here. It's emptied when payment succeeds (Step 3), so a
  // customer who closes the payment page still has their cart.
  return toOrderResponse(order);
}

// ------------------------------------------------------------------ Give stock back

// Cancels an unpaid order and returns its stock and coupon use.
// Safe to call twice, or from two places at once (the expiry job and the user):
// only the call that actually flips PENDING -> CANCELLED does the rest.
export async function releaseOrder(orderId: string) {
  return prisma.$transaction(
    async (tx) => {
      const { count } = await tx.order.updateMany({
        where: { id: orderId, status: 'PENDING' },
        data: { status: 'CANCELLED' },
      });
      if (count === 0) return false; // already paid or already cancelled: nothing to give back

      const reservations = await tx.stockReservation.findMany({ where: { orderId, status: 'ACTIVE' } });
      for (const r of reservations) {
        await tx.productVariant.update({ where: { id: r.variantId }, data: { stock: { increment: r.quantity } } });
      }
      await tx.stockReservation.updateMany({ where: { orderId, status: 'ACTIVE' }, data: { status: 'RELEASED' } });

      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, select: { couponId: true } });
      if (order.couponId) {
        await tx.coupon.update({ where: { id: order.couponId }, data: { usedCount: { decrement: 1 } } });
      }
      return true;
    },
    { timeout: 15_000 },
  );
}

// ------------------------------------------------------------------ Payment confirmed

// Called by the Stripe webhook when payment succeeded. Returns what happened, for logging.
export async function markOrderPaid(orderId: string, paymentIntentId: string) {
  const result = await prisma.$transaction(
    async (tx) => {
      // PENDING -> PAID, and only from PENDING. If Stripe sends the same event twice,
      // the second time matches 0 rows and nothing happens again.
      const { count } = await tx.order.updateMany({
        where: { id: orderId, status: 'PENDING' },
        data: { status: 'PAID', stripePaymentIntentId: paymentIntentId },
      });
      if (count === 0) {
        const order = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
        return order?.status ?? 'MISSING';
      }

      // The held stock is now sold for good.
      await tx.stockReservation.updateMany({ where: { orderId, status: 'ACTIVE' }, data: { status: 'CONSUMED' } });

      // Empty the cart, but only of what was bought (the customer may have added more since).
      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
      await tx.cartItem.deleteMany({
        where: { userId: order.userId, variantId: { in: order.items.map((i) => i.variantId) } },
      });
      return 'PAID_NOW';
    },
    { timeout: 15_000 },
  );

  // Rare edge case: the money arrived AFTER the order was cancelled (stock already given back,
  // maybe already sold to someone else). We can't ship it, so give the money back.
  if (result === 'CANCELLED') {
    await stripe.refunds.create(
      { payment_intent: paymentIntentId, reason: 'requested_by_customer' },
      { idempotencyKey: `refund-${orderId}` }, // never refund twice
    );
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'REFUNDED', stripePaymentIntentId: paymentIntentId },
    });
    return 'REFUNDED_LATE_PAYMENT';
  }
  return result;
}

// Called every minute by the expiry job: cancels unpaid orders whose time ran out.
export async function expireStaleOrders(now = new Date()) {
  const stale = await prisma.order.findMany({
    where: { status: 'PENDING', reservations: { some: { status: 'ACTIVE', expiresAt: { lt: now } } } },
    select: { id: true },
  });
  let released = 0;
  for (const order of stale) if (await releaseOrder(order.id)) released++;
  return released;
}

// ------------------------------------------------------------------ Customer's orders

export async function listMyOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: orderInclude,
  });
  return orders.map(toOrderResponse);
}

// Filtering by userId too means a user can't open someone else's order by guessing its id.
export async function getMyOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId }, include: orderInclude });
  if (!order) throw notFound('Order not found');
  return toOrderResponse(order);
}

export async function cancelMyOrder(userId: string, orderId: string) {
  const order = await getMyOrder(userId, orderId);
  if (order.status !== 'PENDING') throw badRequest('Only unpaid orders can be cancelled');
  await releaseOrder(orderId);
  return getMyOrder(userId, orderId);
}
