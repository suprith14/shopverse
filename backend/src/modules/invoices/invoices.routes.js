import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { notFound } from '../../lib/http-error.js';
import { validate } from '../../middleware/validate.js';
import { formatInvoiceNumber } from '../orders/invoice.js';

// Mounted at /api/invoices. PUBLIC (no login): anyone holding an invoice, a tax officer, an
// accountant, the customer's employer, can check it's genuine by scanning its QR code.
//
// Because it's public, it reveals as little as possible: no name, email, address or items.
// Just enough to match the paper: number, date, total and whether it was refunded.
// The token is 48 random hex characters, so unknown tokens can't be guessed or enumerated
// (that's also why no rate limiting is needed here, unlike a login form).
export const invoicesRouter = Router();

const tokenParams = z.object({ token: z.string().regex(/^[a-f0-9]{48}$/, 'Not a valid invoice code') });

invoicesRouter.get('/verify/:token', validate(tokenParams, 'params'), async (_req, res) => {
  const order = await prisma.order.findUnique({
    where: { invoiceToken: res.locals.params.token },
    select: { invoiceNumber: true, invoiceIssuedAt: true, total: true, status: true },
  });
  if (!order || order.invoiceNumber === null) throw notFound('No ShopVerse invoice matches this code');

  res.set('Cache-Control', 'no-store'); // the status can change (refund): always ask fresh
  res.json({
    invoice: {
      number: formatInvoiceNumber(order.invoiceNumber, order.invoiceIssuedAt),
      issuedAt: order.invoiceIssuedAt,
      total: order.total, // cents
      currency: 'USD',
      status: order.status === 'REFUNDED' ? 'REFUNDED' : 'PAID',
    },
  });
});
