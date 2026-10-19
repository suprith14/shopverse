// import = bring in code from another file or package
import { prisma } from '../../../lib/prisma.js';
// import = bring in code from another file or package
import { stripe } from '../../../lib/stripe.js';
// import = bring in code from another file or package
// badRequest = HttpError 400: the request is invalid
// notFound = HttpError 404: doesn't exist
import { badRequest, notFound } from '../../../lib/http-error.js';
// import = bring in code from another file or package
import { formatInvoiceNumber, loadInvoiceOrder, renderInvoicePdf } from '../../orders/invoice.js';

// The order state machine, admin part:
//   PAID -> SHIPPED -> DELIVERED
//   PAID / SHIPPED / DELIVERED -> REFUNDED
// const = a name for a value that is never reassigned
const ALLOWED_FROM = {
  SHIPPED: 'PAID',
  DELIVERED: 'SHIPPED',
};
// const = a name for a value that is never reassigned
const REFUNDABLE = ['PAID', 'SHIPPED', 'DELIVERED'];

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function listOrders(query) {
  // const = a name for a value that is never reassigned
  // ?.() = call only if the function exists
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  const q = query.q?.replace(/^#/, ''); // "#RHXB9NEJ" -> "RHXB9NEJ"
  // const = a name for a value that is never reassigned
  const where = {
    // ...x = spread: copy all items/properties of x into here
    // a && b = AND; in JSX: show b only when a is true
    ...(query.status && { status: query.status }),
    // ...x = spread: copy all items/properties of x into here
    // a && b = AND; in JSX: show b only when a is true
    ...(q && {
      // OR = Prisma: any of these conditions
      OR: [
        // The short order number customers see is the last 8 characters of the id.
        // .toLowerCase = the text in small letters
        { id: { endsWith: q.toLowerCase() } },
        // contains = Prisma: text includes this (SQL LIKE %x%)
        // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
        { user: { email: { contains: q, mode: 'insensitive' } } },
        // contains = Prisma: text includes this (SQL LIKE %x%)
        // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
        { user: { name: { contains: q, mode: 'insensitive' } } },
      ],
    }),
  };

  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  const [total, orders] = await prisma.$transaction([
    // prisma.order = the Order table (model in prisma/schema.prisma)
    // count = how many rows match
    // where = Prisma filter: which rows
    prisma.order.count({ where }),
    // prisma.order = the Order table (model in prisma/schema.prisma)
    // findMany = read many rows (SELECT ... WHERE)
    prisma.order.findMany({
      // where = Prisma filter: which rows
      where,
      // orderBy = Prisma: sort order (asc / desc)
      orderBy: { createdAt: 'desc' },
      // skip = Prisma: skip the first N rows (OFFSET, for pages)
      skip: (query.page - 1) * query.limit,
      // take = Prisma: at most N rows (LIMIT)
      take: query.limit,
      // include = Prisma: also load the related rows (a JOIN)
      include: {
        // select = Prisma: return only these columns
        user: { select: { name: true, email: true } },
        // _count = Prisma: count rows (or related rows)
        // select = Prisma: return only these columns
        _count: { select: { items: true } },
      },
    }),
  ]);

  // return = give this value back and stop the function here
  // Math = number helpers (min, max, round, floor, ceil...)
  return { items: orders, page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) };
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getOrder(id) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  const order = await prisma.order.findUnique({
    // where = Prisma filter: which rows
    where: { id },
    // include = Prisma: also load the related rows (a JOIN)
    include: {
      // select = Prisma: return only these columns
      user: { select: { id: true, name: true, email: true } },
      // select = Prisma: return only these columns
      coupon: { select: { code: true } },
      items: {
        // include = Prisma: also load the related rows (a JOIN)
        // select = Prisma: return only these columns
        include: { variant: { select: { sku: true, product: { select: { id: true, slug: true, images: true } } } } },
      },
      // select = Prisma: return only these columns
      reservations: { select: { status: true, expiresAt: true } },
    },
  });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!order) throw notFound('Order not found');
  // return = give this value back and stop the function here
  // ...x = spread: copy all items/properties of x into here
  return { ...order, invoiceLabel: formatInvoiceNumber(order.invoiceNumber, order.invoiceIssuedAt) };
}

// Any order's invoice (admins aren't limited to their own orders).
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getInvoice(id) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  const order = await loadInvoiceOrder({ id });
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

// Mark shipped / delivered. Conditional update: only moves forward from the right state,
// so two admins clicking at once, or a click on an out-of-date screen, can't skip or repeat a step.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function updateStatus(id, to) {
  // const = a name for a value that is never reassigned
  // obj[key] = read the property whose name is stored in key
  const from = ALLOWED_FROM[to];
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // updateMany = change every row that matches; returns { count }
  // where = Prisma filter: which rows
  // data = Prisma: the values to write
  const { count } = await prisma.order.updateMany({ where: { id, status: from }, data: { status: to } });
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  if (count === 0) {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // prisma.order = the Order table (model in prisma/schema.prisma)
    // findUnique = read one row by a unique field (id, email); null if missing
    // where = Prisma filter: which rows
    // select = Prisma: return only these columns
    const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // throw = stop here with an error
    // notFound = HttpError 404: doesn't exist
    if (!order) throw notFound('Order not found');
    // throw = stop here with an error
    // badRequest = HttpError 400: the request is invalid
    // `text ${x}` = a template string: text with values inserted
    throw badRequest(`Can't mark as ${to}: the order is ${order.status} (must be ${from})`);
  }
  // return = give this value back and stop the function here
  return getOrder(id);
}

// Refund the customer through Stripe, optionally putting the items back on sale.
//
// Order of operations matters when two systems are involved (Stripe and our database):
//   1. Ask Stripe to refund, with an idempotency key.
//   2. Then mark the order REFUNDED (+ restock) in one transaction.
// If step 2 fails, the admin just clicks again: the idempotency key makes Stripe return the
// SAME refund instead of paying the customer twice, and step 2 runs again.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function refundOrder(id, restock) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  // include = Prisma: also load the related rows (a JOIN)
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!order) throw notFound('Order not found');
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // .includes = true if the array/string contains the value
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  // `text ${x}` = a template string: text with values inserted
  if (!REFUNDABLE.includes(order.status)) throw badRequest(`Can't refund an order that is ${order.status}`);
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (!order.stripePaymentIntentId) throw badRequest('This order has no payment to refund');

  // await = wait for a Promise (async result) before continuing
  // stripe.refunds = give money back for a payment
  // `text ${x}` = a template string: text with values inserted
  await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId }, { idempotencyKey: `refund-${id}` });

  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  await prisma.$transaction(async (tx) => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    // tx.order = the Order table (model in prisma/schema.prisma)
    // updateMany = change every row that matches; returns { count }
    const { count } = await tx.order.updateMany({
      // where = Prisma filter: which rows
      // in = Prisma: the value is one of this list
      where: { id, status: { in: REFUNDABLE } },
      // data = Prisma: the values to write
      data: { status: 'REFUNDED' },
    });
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    // return = give this value back and stop the function here
    if (count === 0) return; // someone else already refunded it: don't restock twice
    // if (...) = run the next part only when the condition is true
    if (restock) {
      // const = a name for a value that is never reassigned
      for (const item of order.items) {
        // await = wait for a Promise (async result) before continuing
        // tx.productVariant = the ProductVariant table (model in prisma/schema.prisma)
        // update = change one row found by a unique field (UPDATE)
        await tx.productVariant.update({
          // where = Prisma filter: which rows
          where: { id: item.variantId },
          // data = Prisma: the values to write
          // increment = Prisma: add to the number in the database (safe with many users)
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  });
  // return = give this value back and stop the function here
  return getOrder(id);
}
