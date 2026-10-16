import type { Coupon } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { badRequest } from '../../lib/http-error.js';
import { getCart } from '../cart/cart.service.js';

// Applying a coupon in the cart is only a PREVIEW: nothing is saved and usedCount is not
// touched. The coupon is checked again and actually used up at checkout (Phase 3), when the
// order is created. Otherwise people could "use up" a limited coupon just by trying it.

const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

// Works out the discount (in cents) for a subtotal, or throws a message the customer can read.
// Exported so checkout can reuse exactly the same rules.
export function calculateDiscount(coupon: Coupon, subtotal: number, now = new Date()): number {
  if (!coupon.isActive) throw badRequest('Invalid coupon code');
  if (coupon.expiresAt && coupon.expiresAt < now) throw badRequest('This coupon has expired');
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw badRequest('This coupon is no longer available');
  }
  if (subtotal < coupon.minOrderAmount) {
    throw badRequest(
      `Add ${formatMoney(coupon.minOrderAmount - subtotal)} more to use this coupon ` +
        `(minimum order ${formatMoney(coupon.minOrderAmount)})`,
    );
  }

  const discount =
    coupon.type === 'PERCENT'
      ? Math.floor((subtotal * coupon.value) / 100) // round down: never give away a fraction of a cent extra
      : coupon.value;
  // A $20 coupon on a $15 order makes it free, not -$5.
  return Math.min(discount, subtotal);
}

export function describeCoupon(coupon: Coupon) {
  return coupon.type === 'PERCENT' ? `${coupon.value}% off` : `${formatMoney(coupon.value)} off`;
}

export async function findCoupon(code: string) {
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  // Same message for "doesn't exist" and "disabled", so people can't probe for hidden codes.
  if (!coupon) throw badRequest('Invalid coupon code');
  return coupon;
}

// Preview a coupon against the user's CURRENT cart. The subtotal is calculated here on the
// server from the database, never taken from the request.
export async function previewCoupon(userId: string, code: string) {
  const [coupon, cart] = await Promise.all([findCoupon(code), getCart(userId)]);
  if (cart.items.length === 0) throw badRequest('Your cart is empty');

  const discount = calculateDiscount(coupon, cart.subtotal);
  return {
    code: coupon.code,
    description: describeCoupon(coupon),
    subtotal: cart.subtotal,
    discount,
    total: cart.subtotal - discount,
  };
}
