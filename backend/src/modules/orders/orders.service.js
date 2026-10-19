// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
import { stripe } from '../../lib/stripe.js';
// import = bring in code from another file or package
// HttpError = an error with an HTTP status; the error handler sends it as JSON
// badRequest = HttpError 400: the request is invalid
// conflict = HttpError 409: clashes with existing data (e.g. email taken)
// notFound = HttpError 404: doesn't exist
import { HttpError, badRequest, conflict, notFound } from '../../lib/http-error.js';
// import = bring in code from another file or package
import { getCart } from '../cart/cart.service.js';
// import = bring in code from another file or package
import { calculateDiscount, findCoupon } from '../coupons/coupons.service.js';
// import = bring in code from another file or package
import { createCheckoutSession, getCheckoutUrl } from '../payments/payments.service.js';
// import = bring in code from another file or package
import { storeOrigin } from '../../lib/store-origin.js';
// import = bring in code from another file or package
import { assertCanShop } from '../../lib/account-status.js';
// import = bring in code from another file or package
import { sendOrderConfirmationEmail } from './order-emails.js';
// import = bring in code from another file or package
import {
  formatInvoiceNumber,
  loadInvoiceOrder,
  newInvoiceToken,
  renderInvoicePdf,
  saveCardDetails,
  takeNextInvoiceNumber,
} from './invoice.js';

// How long stock is held for an unpaid order. The Stripe payment page closes after 30
// minutes; the 2 extra minutes make sure it always closes BEFORE the stock is given back.
// export = other files can import this
// const = a name for a value that is never reassigned
export const RESERVATION_MINUTES = 32;

// How stock works:
//   ProductVariant.stock = units AVAILABLE TO SELL right now.
//   Placing an order takes the units out of stock straight away and records a
//   StockReservation (ACTIVE). Then:
//     paid      -> reservation CONSUMED (units are gone for good)
//     not paid  -> reservation RELEASED and the units are added back to stock

// const = a name for a value that is never reassigned
const orderInclude = {
  items: {
    // select = Prisma: return only these columns
    select: {
      id: true,
      variantId: true,
      productName: true,
      variantName: true,
      unitPrice: true,
      quantity: true,
      // select = Prisma: return only these columns
      variant: { select: { product: { select: { slug: true, images: true } } } },
    },
  },
  // select = Prisma: return only these columns
  coupon: { select: { code: true } },
  // select = Prisma: return only these columns
  // take = Prisma: at most N rows (LIMIT)
  reservations: { select: { expiresAt: true }, take: 1 },
};

// function = a named, reusable block of code
// { a, b } = destructuring: take properties a and b out of an object
// ...rest = collect the remaining items/properties
function toOrderResponse({ items, coupon, reservations, ...order }) {
  // return = give this value back and stop the function here
  return {
    // ...x = spread: copy all items/properties of x into here
    ...order,
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    couponCode: coupon?.code ?? null,
    invoiceLabel: formatInvoiceNumber(order.invoiceNumber, order.invoiceIssuedAt), // "INV-2026-00042" or null
    // Unpaid orders must be paid before this time, or they are cancelled automatically.
    // a ? b : c = ternary: if a then b else c
    // === = strictly equal (same value AND same type)
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    paymentDeadline: order.status === 'PENDING' ? (reservations[0]?.expiresAt ?? null) : null,
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    // { a, b } = destructuring: take properties a and b out of an object
    // ...rest = collect the remaining items/properties
    items: items.map(({ variant, ...item }) => ({
      // ...x = spread: copy all items/properties of x into here
      ...item,
      productSlug: variant.product.slug,
      // a ?? b = a, unless a is null/undefined, then b
      image: variant.product.images[0] ?? null,
      lineTotal: item.unitPrice * item.quantity,
    })),
  };
}

// ------------------------------------------------------------------ Checkout

// What "Place order" does: create the order (stock held), then open a Stripe payment page for it.
// requestOrigin: the browser's Origin header, used (if allowed) as Stripe's return address.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function checkout(userId, input, requestOrigin) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  const order = await createOrder(userId, input);
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // findUniqueOrThrow = like findUnique, but throws if the row is missing
  // where = Prisma filter: which rows
  // select = Prisma: return only these columns
  const { email } = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });

  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const session = await createCheckoutSession(order, email, storeOrigin(requestOrigin));
    // await = wait for a Promise (async result) before continuing
    // prisma.order = the Order table (model in prisma/schema.prisma)
    // update = change one row found by a unique field (UPDATE)
    // where = Prisma filter: which rows
    // data = Prisma: the values to write
    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    // return = give this value back and stop the function here
    return { order, checkoutUrl: session.url };
  } catch (err) {
    // No payment page means the customer can't pay, so don't keep their stock locked.
    // console.log / warn / error = print to the server log
    console.error('[checkout] Stripe session failed', err);
    // await = wait for a Promise (async result) before continuing
    await releaseOrder(order.id);
    // throw = stop here with an error
    // new = create an object from a class (e.g. new Date())
    // HttpError = an error with an HTTP status; the error handler sends it as JSON
    throw new HttpError(502, 'The payment service is unavailable. Please try again in a moment.');
  }
}

// "Pay now" on an unpaid order.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getPaymentUrl(userId, orderId) {
  // await = wait for a Promise (async result) before continuing
  await assertCanShop(userId);
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // findFirst = read the first row that matches (null if none)
  const order = await prisma.order.findFirst({
    // where = Prisma filter: which rows
    where: { id: orderId, userId },
    // select = Prisma: return only these columns
    select: { status: true, stripeSessionId: true },
  });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!order) throw notFound('Order not found');
  // if (...) = run the next part only when the condition is true
  // !== = not strictly equal
  // a || b = OR: a if it is truthy, else b
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (order.status !== 'PENDING' || !order.stripeSessionId) throw badRequest('This order is not waiting for payment');
  // return = give this value back and stop the function here
  return getCheckoutUrl(order.stripeSessionId);
}

// ------------------------------------------------------------------ Place an order

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
// { a, b } = destructuring: take properties a and b out of an object
export async function createOrder(userId, { couponCode, addressId }) {
  // await = wait for a Promise (async result) before continuing
  await assertCanShop(userId); // a blocked customer may still hold a valid access token for a few minutes
  // The delivery address must be one of THIS user's saved addresses (filtering by userId too:
  // another customer's address id is simply "not found").
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.address = the Address table (model in prisma/schema.prisma)
  // findFirst = read the first row that matches (null if none)
  // where = Prisma filter: which rows
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (!address) throw badRequest('Choose one of your saved delivery addresses');
  // Snapshot: a plain copy stored on the order. Editing or deleting the address later
  // doesn't change where this order was shipped.
  // const = a name for a value that is never reassigned
  const shippingAddress = {
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };

  // A customer has at most one unpaid order. Placing a new one cancels the old one,
  // which gives its held stock back. (Like going back to the cart from the payment page.)
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // findMany = read many rows (SELECT ... WHERE)
  // where = Prisma filter: which rows
  // select = Prisma: return only these columns
  const pending = await prisma.order.findMany({ where: { userId, status: 'PENDING' }, select: { id: true } });
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  for (const order of pending) await releaseOrder(order.id);

  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  const cart = await getCart(userId);
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (cart.items.length === 0) throw badRequest('Your cart is empty');
  // if (...) = run the next part only when the condition is true
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (cart.hasIssues) throw badRequest('Some items in your cart are unavailable. Please update your cart.');

  // The coupon is checked again here. The cart preview was only a preview.
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // await = wait for a Promise (async result) before continuing
  const coupon = couponCode ? await findCoupon(couponCode) : null;
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  const discount = coupon ? calculateDiscount(coupon, cart.subtotal) : 0;
  // const = a name for a value that is never reassigned
  // new = create an object from a class (e.g. new Date())
  // Date = a point in time (Date.now() = milliseconds since 1970)
  const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

  // Everything below happens in ONE transaction: either all of it succeeds, or none of it
  // does. If the 3rd item is sold out, the stock taken for items 1 and 2 is put back too.
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  const order = await prisma.$transaction(
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    async (tx) => {
      // const = a name for a value that is never reassigned
      for (const item of cart.items) {
        // THE anti-overselling line. "Take N units only if at least N are left" runs as one
        // atomic UPDATE in the database. If two customers race for the last unit, the database
        // runs their updates one after the other: the first one matches, the second matches
        // 0 rows. Checking stock first and updating it afterwards would NOT be safe: both
        // customers could read "1 left" before either of them updates it.
        // const = a name for a value that is never reassigned
        // { a, b } = destructuring: take properties a and b out of an object
        // await = wait for a Promise (async result) before continuing
        // tx.productVariant = the ProductVariant table (model in prisma/schema.prisma)
        // updateMany = change every row that matches; returns { count }
        const { count } = await tx.productVariant.updateMany({
          // where = Prisma filter: which rows
          // gte = greater than or equal (>=)
          where: { id: item.variantId, stock: { gte: item.quantity } },
          // data = Prisma: the values to write
          // decrement = Prisma: subtract from the number in the database
          data: { stock: { decrement: item.quantity } },
        });
        // if (...) = run the next part only when the condition is true
        // === = strictly equal (same value AND same type)
        if (count === 0) {
          // throw = stop here with an error
          // conflict = HttpError 409: clashes with existing data (e.g. email taken)
          // `text ${x}` = a template string: text with values inserted
          throw conflict(`Sorry, "${item.productName} (${item.variantName})" just sold out. Please update your cart.`);
        }
      }

      // if (...) = run the next part only when the condition is true
      if (coupon) {
        // Same idea for limited coupons: count a use only if one is still left.
        // Raw SQL because it compares two columns ("usedCount" < "maxUses").
        // const = a name for a value that is never reassigned
        // await = wait for a Promise (async result) before continuing
        // prisma.$executeRaw = run a hand-written SQL command
        // `text ${x}` = a template string: text with values inserted
        const used = await tx.$executeRaw`
          UPDATE "Coupon" SET "usedCount" = "usedCount" + 1
          WHERE "id" = ${coupon.id} AND ("maxUses" IS NULL OR "usedCount" < "maxUses")`;
        // if (...) = run the next part only when the condition is true
        // === = strictly equal (same value AND same type)
        // throw = stop here with an error
        // badRequest = HttpError 400: the request is invalid
        if (used === 0) throw badRequest('This coupon is no longer available');
      }

      // return = give this value back and stop the function here
      // tx.order = the Order table (model in prisma/schema.prisma)
      // create = insert one new row (INSERT)
      return tx.order.create({
        // data = Prisma: the values to write
        data: {
          userId,
          subtotal: cart.subtotal,
          discount,
          total: cart.subtotal - discount,
          // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
          couponId: coupon?.id,
          shippingAddress,
          // Snapshot: copy names and prices into the order. If the product is renamed or
          // repriced tomorrow, this order still shows what the customer actually paid.
          items: {
            // .map = make a new array by transforming each item
            // => = an arrow function (a short function)
            create: cart.items.map((i) => ({
              variantId: i.variantId,
              productName: i.productName,
              variantName: i.variantName,
              unitPrice: i.unitPrice,
              quantity: i.quantity,
            })),
          },
          reservations: {
            // .map = make a new array by transforming each item
            // => = an arrow function (a short function)
            create: cart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity, expiresAt })),
          },
        },
        // include = Prisma: also load the related rows (a JOIN)
        include: orderInclude,
      });
    },
    { timeout: 15_000 }, // the database is in the cloud, so allow for network delay
  );

  // The cart is NOT emptied here. It's emptied when payment succeeds (Step 3), so a
  // customer who closes the payment page still has their cart.
  // return = give this value back and stop the function here
  return toOrderResponse(order);
}

// ------------------------------------------------------------------ Give stock back

// Cancels an unpaid order and returns its stock and coupon use.
// Safe to call twice, or from two places at once (the expiry job and the user):
// only the call that actually flips PENDING -> CANCELLED does the rest.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function releaseOrder(orderId) {
  // return = give this value back and stop the function here
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  return prisma.$transaction(
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    async (tx) => {
      // const = a name for a value that is never reassigned
      // { a, b } = destructuring: take properties a and b out of an object
      // await = wait for a Promise (async result) before continuing
      // tx.order = the Order table (model in prisma/schema.prisma)
      // updateMany = change every row that matches; returns { count }
      const { count } = await tx.order.updateMany({
        // where = Prisma filter: which rows
        where: { id: orderId, status: 'PENDING' },
        // data = Prisma: the values to write
        data: { status: 'CANCELLED' },
      });
      // if (...) = run the next part only when the condition is true
      // === = strictly equal (same value AND same type)
      // return = give this value back and stop the function here
      if (count === 0) return false; // already paid or already cancelled: nothing to give back

      // const = a name for a value that is never reassigned
      // await = wait for a Promise (async result) before continuing
      // tx.stockReservation = the StockReservation table (model in prisma/schema.prisma)
      // findMany = read many rows (SELECT ... WHERE)
      // where = Prisma filter: which rows
      const reservations = await tx.stockReservation.findMany({ where: { orderId, status: 'ACTIVE' } });
      // const = a name for a value that is never reassigned
      for (const r of reservations) {
        // await = wait for a Promise (async result) before continuing
        // tx.productVariant = the ProductVariant table (model in prisma/schema.prisma)
        // update = change one row found by a unique field (UPDATE)
        // where = Prisma filter: which rows
        // data = Prisma: the values to write
        // increment = Prisma: add to the number in the database (safe with many users)
        await tx.productVariant.update({ where: { id: r.variantId }, data: { stock: { increment: r.quantity } } });
      }
      // await = wait for a Promise (async result) before continuing
      // tx.stockReservation = the StockReservation table (model in prisma/schema.prisma)
      // updateMany = change every row that matches; returns { count }
      // where = Prisma filter: which rows
      // data = Prisma: the values to write
      await tx.stockReservation.updateMany({ where: { orderId, status: 'ACTIVE' }, data: { status: 'RELEASED' } });

      // const = a name for a value that is never reassigned
      // await = wait for a Promise (async result) before continuing
      // tx.order = the Order table (model in prisma/schema.prisma)
      // findUniqueOrThrow = like findUnique, but throws if the row is missing
      // where = Prisma filter: which rows
      // select = Prisma: return only these columns
      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, select: { couponId: true } });
      // if (...) = run the next part only when the condition is true
      if (order.couponId) {
        // await = wait for a Promise (async result) before continuing
        // tx.coupon = the Coupon table (model in prisma/schema.prisma)
        // update = change one row found by a unique field (UPDATE)
        // where = Prisma filter: which rows
        // data = Prisma: the values to write
        // decrement = Prisma: subtract from the number in the database
        await tx.coupon.update({ where: { id: order.couponId }, data: { usedCount: { decrement: 1 } } });
      }
      // return = give this value back and stop the function here
      return true;
    },
    { timeout: 15_000 },
  );
}

// ------------------------------------------------------------------ Payment confirmed

// Called by the Stripe webhook when payment succeeded. Returns what happened, for logging.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function markOrderPaid(orderId, paymentIntentId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  const result = await prisma.$transaction(
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    async (tx) => {
      // PENDING -> PAID, and only from PENDING. If Stripe sends the same event twice,
      // the second time matches 0 rows and nothing happens again.
      // const = a name for a value that is never reassigned
      // { a, b } = destructuring: take properties a and b out of an object
      // await = wait for a Promise (async result) before continuing
      // tx.order = the Order table (model in prisma/schema.prisma)
      // updateMany = change every row that matches; returns { count }
      const { count } = await tx.order.updateMany({
        // where = Prisma filter: which rows
        where: { id: orderId, status: 'PENDING' },
        // data = Prisma: the values to write
        data: { status: 'PAID', stripePaymentIntentId: paymentIntentId },
      });
      // if (...) = run the next part only when the condition is true
      // === = strictly equal (same value AND same type)
      if (count === 0) {
        // const = a name for a value that is never reassigned
        // await = wait for a Promise (async result) before continuing
        // tx.order = the Order table (model in prisma/schema.prisma)
        // findUnique = read one row by a unique field (id, email); null if missing
        // where = Prisma filter: which rows
        // select = Prisma: return only these columns
        const order = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
        // return = give this value back and stop the function here
        // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
        // a ?? b = a, unless a is null/undefined, then b
        return order?.status ?? 'MISSING';
      }

      // The held stock is now sold for good.
      // await = wait for a Promise (async result) before continuing
      // tx.stockReservation = the StockReservation table (model in prisma/schema.prisma)
      // updateMany = change every row that matches; returns { count }
      // where = Prisma filter: which rows
      // data = Prisma: the values to write
      await tx.stockReservation.updateMany({ where: { orderId, status: 'ACTIVE' }, data: { status: 'CONSUMED' } });

      // Invoice number, in the SAME transaction: an order is paid if and only if it has one.
      // const = a name for a value that is never reassigned
      // await = wait for a Promise (async result) before continuing
      const invoiceNumber = await takeNextInvoiceNumber(tx);
      // await = wait for a Promise (async result) before continuing
      // tx.order = the Order table (model in prisma/schema.prisma)
      // update = change one row found by a unique field (UPDATE)
      await tx.order.update({
        // where = Prisma filter: which rows
        where: { id: orderId },
        // data = Prisma: the values to write
        // new = create an object from a class (e.g. new Date())
        // Date = a point in time (Date.now() = milliseconds since 1970)
        data: { invoiceNumber, invoiceIssuedAt: new Date(), invoiceToken: newInvoiceToken() },
      });

      // Empty the cart, but only of what was bought (the customer may have added more since).
      // const = a name for a value that is never reassigned
      // await = wait for a Promise (async result) before continuing
      // tx.order = the Order table (model in prisma/schema.prisma)
      // findUniqueOrThrow = like findUnique, but throws if the row is missing
      // where = Prisma filter: which rows
      // include = Prisma: also load the related rows (a JOIN)
      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
      // await = wait for a Promise (async result) before continuing
      // tx.cartItem = the CartItem table (model in prisma/schema.prisma)
      // deleteMany = remove every row that matches; no error if none
      await tx.cartItem.deleteMany({
        // where = Prisma filter: which rows
        // in = Prisma: the value is one of this list
        // .map = make a new array by transforming each item
        // => = an arrow function (a short function)
        where: { userId: order.userId, variantId: { in: order.items.map((i) => i.variantId) } },
      });
      // return = give this value back and stop the function here
      return 'PAID_NOW';
    },
    { timeout: 15_000 },
  );

  // Rare edge case: the money arrived AFTER the order was cancelled (stock already given back,
  // maybe already sold to someone else). We can't ship it, so give the money back.
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  if (result === 'CANCELLED') {
    // await = wait for a Promise (async result) before continuing
    // stripe.refunds = give money back for a payment
    await stripe.refunds.create(
      { payment_intent: paymentIntentId, reason: 'requested_by_customer' },
      // `text ${x}` = a template string: text with values inserted
      { idempotencyKey: `refund-${orderId}` }, // never refund twice
    );
    // await = wait for a Promise (async result) before continuing
    // prisma.order = the Order table (model in prisma/schema.prisma)
    // update = change one row found by a unique field (UPDATE)
    await prisma.order.update({
      // where = Prisma filter: which rows
      where: { id: orderId },
      // data = Prisma: the values to write
      data: { status: 'REFUNDED', stripePaymentIntentId: paymentIntentId },
    });
    // return = give this value back and stop the function here
    return 'REFUNDED_LATE_PAYMENT';
  }

  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  if (result === 'PAID_NOW') {
    // Side effect AFTER the transaction committed: never email "order confirmed" for a change
    // that might still be rolled back. And only on the first PAID_NOW, so duplicates of the
    // webhook don't send a second email.
    // If the email fails, we log it and still answer Stripe with 200: the payment is recorded,
    // and failing would make Stripe resend an event we'd then skip anyway. (Bigger systems use
    // an "outbox" table plus a retry job so no email is ever lost.)
    // Card brand / last 4 / receipt link for the invoice. If Stripe is briefly unreachable the
    // invoice just says "Card (via Stripe)": the payment itself is already recorded.
    // try / catch = if the code inside fails, run the catch part instead of crashing
    try {
      // await = wait for a Promise (async result) before continuing
      await saveCardDetails(orderId, paymentIntentId);
    } catch (err) {
      // console.log / warn / error = print to the server log
      // `text ${x}` = a template string: text with values inserted
      console.error(`[invoice] could not load card details for ${orderId}`, err);
    }
    // try / catch = if the code inside fails, run the catch part instead of crashing
    try {
      // await = wait for a Promise (async result) before continuing
      await sendOrderConfirmationEmail(orderId);
    } catch (err) {
      // console.log / warn / error = print to the server log
      // `text ${x}` = a template string: text with values inserted
      console.error(`[email] order confirmation failed for ${orderId}`, err);
    }
  }
  // return = give this value back and stop the function here
  return result;
}

// Called every minute by the expiry job: cancels unpaid orders whose time ran out.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
// x = value (in parameters) = the default used when x is not given
// new = create an object from a class (e.g. new Date())
// Date = a point in time (Date.now() = milliseconds since 1970)
export async function expireStaleOrders(now = new Date()) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // findMany = read many rows (SELECT ... WHERE)
  const stale = await prisma.order.findMany({
    // where = Prisma filter: which rows
    // some = Prisma: at least one related row matches
    // lt = less than (<)
    where: { status: 'PENDING', reservations: { some: { status: 'ACTIVE', expiresAt: { lt: now } } } },
    // select = Prisma: return only these columns
    select: { id: true },
  });
  // let = a name whose value can be changed later
  let released = 0;
  // const = a name for a value that is never reassigned
  // if (...) = run the next part only when the condition is true
  // await = wait for a Promise (async result) before continuing
  for (const order of stale) if (await releaseOrder(order.id)) released++;
  // return = give this value back and stop the function here
  return released;
}

// ------------------------------------------------------------------ Customer's orders

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function listMyOrders(userId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // findMany = read many rows (SELECT ... WHERE)
  const orders = await prisma.order.findMany({
    // where = Prisma filter: which rows
    where: { userId },
    // orderBy = Prisma: sort order (asc / desc)
    orderBy: { createdAt: 'desc' },
    // include = Prisma: also load the related rows (a JOIN)
    include: orderInclude,
  });
  // return = give this value back and stop the function here
  // .map = make a new array by transforming each item
  return orders.map(toOrderResponse);
}

// Filtering by userId too means a user can't open someone else's order by guessing its id.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getMyOrder(userId, orderId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // findFirst = read the first row that matches (null if none)
  // where = Prisma filter: which rows
  // include = Prisma: also load the related rows (a JOIN)
  const order = await prisma.order.findFirst({ where: { id: orderId, userId }, include: orderInclude });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!order) throw notFound('Order not found');
  // return = give this value back and stop the function here
  return toOrderResponse(order);
}

// My invoice as a PDF. Filtering by userId too: another customer's order is "not found".
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getMyInvoice(userId, orderId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  const order = await loadInvoiceOrder({ id: orderId, userId });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!order) throw notFound('Order not found');
  // return = give this value back and stop the function here
  return {
    // `text ${x}` = a template string: text with values inserted
    filename: `${formatInvoiceNumber(order.invoiceNumber, order.invoiceIssuedAt)}.pdf`,
    // await = wait for a Promise (async result) before continuing
    pdf: await renderInvoicePdf(order),
  };
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function cancelMyOrder(userId, orderId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  const order = await getMyOrder(userId, orderId);
  // if (...) = run the next part only when the condition is true
  // !== = not strictly equal
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (order.status !== 'PENDING') throw badRequest('Only unpaid orders can be cancelled');
  // await = wait for a Promise (async result) before continuing
  await releaseOrder(orderId);
  // return = give this value back and stop the function here
  return getMyOrder(userId, orderId);
}
