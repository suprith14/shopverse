import type { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma.js';
import { stripe } from '../../../lib/stripe.js';
import { badRequest, notFound } from '../../../lib/http-error.js';
import type { ListAdminOrdersQuery } from './orders.schema.js';

// The order state machine, admin part:
//   PAID -> SHIPPED -> DELIVERED
//   PAID / SHIPPED / DELIVERED -> REFUNDED
const ALLOWED_FROM: Record<'SHIPPED' | 'DELIVERED', OrderStatus> = {
  SHIPPED: 'PAID',
  DELIVERED: 'SHIPPED',
};
const REFUNDABLE: OrderStatus[] = ['PAID', 'SHIPPED', 'DELIVERED'];

export async function listOrders(query: ListAdminOrdersQuery) {
  const q = query.q?.replace(/^#/, ''); // "#RHXB9NEJ" -> "RHXB9NEJ"
  const where: Prisma.OrderWhereInput = {
    ...(query.status && { status: query.status }),
    ...(q && {
      OR: [
        // The short order number customers see is the last 8 characters of the id.
        { id: { endsWith: q.toLowerCase() } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
  ]);

  return { items: orders, page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) };
}

export async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      coupon: { select: { code: true } },
      items: { include: { variant: { select: { sku: true, product: { select: { id: true, slug: true, images: true } } } } } },
      reservations: { select: { status: true, expiresAt: true } },
    },
  });
  if (!order) throw notFound('Order not found');
  return order;
}

// Mark shipped / delivered. Conditional update: only moves forward from the right state,
// so two admins clicking at once, or a click on an out-of-date screen, can't skip or repeat a step.
export async function updateStatus(id: string, to: 'SHIPPED' | 'DELIVERED') {
  const from = ALLOWED_FROM[to];
  const { count } = await prisma.order.updateMany({ where: { id, status: from }, data: { status: to } });
  if (count === 0) {
    const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!order) throw notFound('Order not found');
    throw badRequest(`Can't mark as ${to}: the order is ${order.status} (must be ${from})`);
  }
  return getOrder(id);
}

// Refund the customer through Stripe, optionally putting the items back on sale.
//
// Order of operations matters when two systems are involved (Stripe and our database):
//   1. Ask Stripe to refund, with an idempotency key.
//   2. Then mark the order REFUNDED (+ restock) in one transaction.
// If step 2 fails, the admin just clicks again: the idempotency key makes Stripe return the
// SAME refund instead of paying the customer twice, and step 2 runs again.
export async function refundOrder(id: string, restock: boolean) {
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) throw notFound('Order not found');
  if (!REFUNDABLE.includes(order.status)) throw badRequest(`Can't refund an order that is ${order.status}`);
  if (!order.stripePaymentIntentId) throw badRequest('This order has no payment to refund');

  await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId }, { idempotencyKey: `refund-${id}` });

  await prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id, status: { in: REFUNDABLE } },
      data: { status: 'REFUNDED' },
    });
    if (count === 0) return; // someone else already refunded it: don't restock twice
    if (restock) {
      for (const item of order.items) {
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      }
    }
  });
  return getOrder(id);
}
