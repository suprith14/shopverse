// import = bring in code from another file or package
// Router = a group of routes mounted under one path (e.g. /api/cart)
import { Router } from 'express';
// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';
// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
// notFound = HttpError 404: doesn't exist
import { notFound } from '../../lib/http-error.js';
// import = bring in code from another file or package
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
import { validate } from '../../middleware/validate.js';
// import = bring in code from another file or package
import { formatInvoiceNumber } from '../orders/invoice.js';

// Mounted at /api/invoices. PUBLIC (no login): anyone holding an invoice, a tax officer, an
// accountant, the customer's employer, can check it's genuine by scanning its QR code.
//
// Because it's public, it reveals as little as possible: no name, email, address or items.
// Just enough to match the paper: number, date, total and whether it was refunded.
// The token is 48 random hex characters, so unknown tokens can't be guessed or enumerated
// (that's also why no rate limiting is needed here, unlike a login form).
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const invoicesRouter = Router();

// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
// z.string = must be text
// .regex = must match this pattern
const tokenParams = z.object({ token: z.string().regex(/^[a-f0-9]{48}$/, 'Not a valid invoice code') });

// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
// => = an arrow function (a short function)
// async = this function works with await and returns a Promise
invoicesRouter.get('/verify/:token', validate(tokenParams, 'params'), async (_req, res) => {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  const order = await prisma.order.findUnique({
    // where = Prisma filter: which rows
    // res.locals = data for this one request (the validated input, the logged-in user)
    where: { invoiceToken: res.locals.params.token },
    // select = Prisma: return only these columns
    select: { invoiceNumber: true, invoiceIssuedAt: true, total: true, status: true },
  });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // a || b = OR: a if it is truthy, else b
  // === = strictly equal (same value AND same type)
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!order || order.invoiceNumber === null) throw notFound('No ShopVerse invoice matches this code');

  // res.set = set a response header
  res.set('Cache-Control', 'no-store'); // the status can change (refund): always ask fresh
  // res.json = send this object as JSON (status 200 unless set)
  res.json({
    invoice: {
      number: formatInvoiceNumber(order.invoiceNumber, order.invoiceIssuedAt),
      issuedAt: order.invoiceIssuedAt,
      total: order.total, // cents
      currency: 'USD',
      // a ? b : c = ternary: if a then b else c
      // === = strictly equal (same value AND same type)
      status: order.status === 'REFUNDED' ? 'REFUNDED' : 'PAID',
    },
  });
});
