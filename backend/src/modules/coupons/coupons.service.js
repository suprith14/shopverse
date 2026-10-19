// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
// badRequest = HttpError 400: the request is invalid
import { badRequest } from '../../lib/http-error.js';
// import = bring in code from another file or package
import { getCart } from '../cart/cart.service.js';

// Applying a coupon in the cart is only a PREVIEW: nothing is saved and usedCount is not
// touched. The coupon is checked again and actually used up at checkout (Phase 3), when the
// order is created. Otherwise people could "use up" a limited coupon just by trying it.

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// `text ${x}` = a template string: text with values inserted
// .toFixed(n) = number as text with n decimals
const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;

// Works out the discount (in cents) for a subtotal, or throws a message the customer can read.
// Exported so checkout can reuse exactly the same rules.
// export = other files can import this
// function = a named, reusable block of code
// x = value (in parameters) = the default used when x is not given
// new = create an object from a class (e.g. new Date())
// Date = a point in time (Date.now() = milliseconds since 1970)
export function calculateDiscount(coupon, subtotal, now = new Date()) {
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (!coupon.isActive) throw badRequest('Invalid coupon code');
  // if (...) = run the next part only when the condition is true
  // a && b = AND; in JSX: show b only when a is true
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (coupon.expiresAt && coupon.expiresAt < now) throw badRequest('This coupon has expired');
  // if (...) = run the next part only when the condition is true
  // !== = not strictly equal
  // a && b = AND; in JSX: show b only when a is true
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    // throw = stop here with an error
    // badRequest = HttpError 400: the request is invalid
    throw badRequest('This coupon is no longer available');
  }
  // if (...) = run the next part only when the condition is true
  if (subtotal < coupon.minOrderAmount) {
    // throw = stop here with an error
    // badRequest = HttpError 400: the request is invalid
    throw badRequest(
      // `text ${x}` = a template string: text with values inserted
      `Add ${formatMoney(coupon.minOrderAmount - subtotal)} more to use this coupon ` +
        // `text ${x}` = a template string: text with values inserted
        `(minimum order ${formatMoney(coupon.minOrderAmount)})`,
    );
  }

  // const = a name for a value that is never reassigned
  const discount =
    // a ? b : c = ternary: if a then b else c
    // === = strictly equal (same value AND same type)
    coupon.type === 'PERCENT'
      // Math = number helpers (min, max, round, floor, ceil...)
      ? Math.floor((subtotal * coupon.value) / 100) // round down: never give away a fraction of a cent extra
      : coupon.value;
  // A $20 coupon on a $15 order makes it free, not -$5.
  // return = give this value back and stop the function here
  // Math = number helpers (min, max, round, floor, ceil...)
  return Math.min(discount, subtotal);
}

// export = other files can import this
// function = a named, reusable block of code
export function describeCoupon(coupon) {
  // return = give this value back and stop the function here
  // a ? b : c = ternary: if a then b else c
  // === = strictly equal (same value AND same type)
  // `text ${x}` = a template string: text with values inserted
  return coupon.type === 'PERCENT' ? `${coupon.value}% off` : `${formatMoney(coupon.value)} off`;
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function findCoupon(code) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.coupon = the Coupon table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  // Same message for "doesn't exist" and "disabled", so people can't probe for hidden codes.
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (!coupon) throw badRequest('Invalid coupon code');
  // return = give this value back and stop the function here
  return coupon;
}

// Preview a coupon against the user's CURRENT cart. The subtotal is calculated here on the
// server from the database, never taken from the request.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function previewCoupon(userId, code) {
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // await = wait for a Promise (async result) before continuing
  // Promise = a value that arrives later; Promise.all waits for several at once
  const [coupon, cart] = await Promise.all([findCoupon(code), getCart(userId)]);
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (cart.items.length === 0) throw badRequest('Your cart is empty');

  // const = a name for a value that is never reassigned
  const discount = calculateDiscount(coupon, cart.subtotal);
  // return = give this value back and stop the function here
  return {
    code: coupon.code,
    description: describeCoupon(coupon),
    subtotal: cart.subtotal,
    discount,
    total: cart.subtotal - discount,
  };
}
