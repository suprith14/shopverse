import PDFDocument from 'pdfkit';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { stripe } from '../../lib/stripe.js';
import { badRequest } from '../../lib/http-error.js';

// ------------------------------------------------------------------ Invoice numbers

// 42 issued in 2026 -> "INV-2026-00042". The year makes numbers easier to read; the number
// itself keeps counting across years (one gapless series).
export function formatInvoiceNumber(n: number | null, issuedAt: Date | null) {
  if (n === null) return null;
  return `INV-${(issuedAt ?? new Date()).getUTCFullYear()}-${String(n).padStart(5, '0')}`;
}

// Takes the next invoice number. MUST run inside the transaction that marks the order paid:
// the UPDATE locks the counter row (simultaneous payments wait their turn: no duplicates) and a
// rolled-back transaction undoes the +1 (no gaps).
export async function takeNextInvoiceNumber(tx: Prisma.TransactionClient) {
  const rows = await tx.$queryRaw<{ value: number }[]>`
    UPDATE "InvoiceCounter" SET value = value + 1 WHERE id = 'invoice' RETURNING value`;
  if (rows[0]) return rows[0].value;
  // First invoice ever on a database without the counter row.
  await tx.invoiceCounter.create({ data: { id: 'invoice', value: 1 } });
  return 1;
}

// ------------------------------------------------------------------ Card details from Stripe

// After payment, copy what the invoice needs from Stripe: card brand, last 4 digits and the
// hosted receipt link. Asked once, then stored, so downloads never depend on Stripe.
export async function saveCardDetails(orderId: string, paymentIntentId: string) {
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] });
  const charge = typeof intent.latest_charge === 'object' ? intent.latest_charge : null;
  const card = charge?.payment_method_details?.card;
  await prisma.order.update({
    where: { id: orderId },
    data: { cardBrand: card?.brand ?? null, cardLast4: card?.last4 ?? null, receiptUrl: charge?.receipt_url ?? null },
  });
}

// ------------------------------------------------------------------ The PDF

export const invoiceInclude = {
  items: true,
  user: { select: { name: true, email: true } },
  coupon: { select: { code: true } },
} satisfies Prisma.OrderInclude;

type InvoiceOrder = Prisma.OrderGetPayload<{ include: typeof invoiceInclude }>;

interface ShippingAddress {
  fullName: string; phone: string; line1: string; line2: string | null;
  city: string; state: string; postalCode: string; country: string;
}

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const day = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

// Loads an order for its invoice, or explains why there isn't one yet.
export async function loadInvoiceOrder(where: Prisma.OrderWhereInput) {
  const order = await prisma.order.findFirst({ where, include: invoiceInclude });
  if (!order) return null;
  if (order.invoiceNumber === null) throw badRequest('The invoice is available once the order is paid');
  return order;
}

// Draws the invoice and returns it as a PDF file in memory (also used as an email attachment).
export function renderInvoicePdf(order: InvoiceOrder): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `Invoice ${formatInvoiceNumber(order.invoiceNumber, order.invoiceIssuedAt)}` } });
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const left = 50;
  const right = 545; // A4 width 595 - margin 50
  const grey = '#64748b';

  // Header
  doc.fillColor('#4f46e5').font('Helvetica-Bold').fontSize(22).text('ShopVerse', left, 50);
  doc.fillColor('#0f172a').fontSize(18).text('INVOICE', left, 50, { width: right - left, align: 'right' });
  doc.font('Helvetica').fontSize(10).fillColor(grey)
    .text(formatInvoiceNumber(order.invoiceNumber, order.invoiceIssuedAt) ?? '', left, 75, { width: right - left, align: 'right' })
    .text(`Issued ${day(order.invoiceIssuedAt ?? order.createdAt)}`, { width: right - left, align: 'right' })
    .text(`Order #${order.id.slice(-8).toUpperCase()}, placed ${day(order.createdAt)}`, { width: right - left, align: 'right' });

  // Bill to / Ship to
  const top = 135;
  doc.fillColor(grey).fontSize(9).text('BILLED TO', left, top).text('SHIP TO', 300, top);
  doc.fillColor('#0f172a').fontSize(10).text(order.user.name, left, top + 14).text(order.user.email);
  const ship = order.shippingAddress as ShippingAddress | null;
  const shipLines = ship
    ? [ship.fullName, ship.line1, ship.line2, `${ship.city}, ${ship.state} ${ship.postalCode}`, ship.country, ship.phone].filter(Boolean)
    : ['No delivery address recorded'];
  doc.text(shipLines.join('\n'), 300, top + 14);

  // Items table
  let y = 245;
  doc.moveTo(left, y).lineTo(right, y).strokeColor('#e2e8f0').stroke();
  y += 8;
  doc.fillColor(grey).fontSize(9)
    .text('ITEM', left, y).text('QTY', 340, y, { width: 40, align: 'right' })
    .text('UNIT PRICE', 390, y, { width: 70, align: 'right' }).text('AMOUNT', 470, y, { width: 75, align: 'right' });
  y += 18;
  doc.fillColor('#0f172a').fontSize(10);
  for (const item of order.items) {
    // Names and prices are the snapshot from when the order was placed.
    doc.text(`${item.productName} (${item.variantName})`, left, y, { width: 280 });
    const rowHeight = doc.heightOfString(`${item.productName} (${item.variantName})`, { width: 280 });
    doc.text(String(item.quantity), 340, y, { width: 40, align: 'right' })
      .text(money(item.unitPrice), 390, y, { width: 70, align: 'right' })
      .text(money(item.unitPrice * item.quantity), 470, y, { width: 75, align: 'right' });
    y += Math.max(rowHeight, 14) + 8;
  }
  doc.moveTo(left, y).lineTo(right, y).strokeColor('#e2e8f0').stroke();

  // Totals
  y += 12;
  const total = (label: string, value: string, bold = false) => {
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 12 : 10)
      .text(label, 340, y, { width: 120, align: 'right' }).text(value, 470, y, { width: 75, align: 'right' });
    y += bold ? 20 : 16;
  };
  total('Subtotal', money(order.subtotal));
  if (order.discount > 0) total(`Discount${order.coupon ? ` (${order.coupon.code})` : ''}`, `-${money(order.discount)}`);
  total('Total paid', money(order.total), true);

  // Payment
  y += 14;
  doc.font('Helvetica').fontSize(9).fillColor(grey).text('PAYMENT', left, y);
  const method = order.cardBrand && order.cardLast4
    ? `${order.cardBrand.charAt(0).toUpperCase()}${order.cardBrand.slice(1)} card ending ${order.cardLast4}`
    : 'Card (via Stripe)';
  doc.fillColor('#0f172a').fontSize(10).text(method, left, y + 14);
  if (order.stripePaymentIntentId) doc.fillColor(grey).fontSize(8).text(`Reference: ${order.stripePaymentIntentId}`);

  // Refunded orders keep their invoice (the number is never reused), clearly marked.
  if (order.status === 'REFUNDED') {
    doc.save().rotate(-20, { origin: [300, 420] }).fillColor('#dc2626').opacity(0.25).font('Helvetica-Bold').fontSize(64)
      .text('REFUNDED', 120, 400).restore();
  }

  doc.fillColor(grey).font('Helvetica').fontSize(8)
    .text('ShopVerse is a portfolio project. Payments are processed by Stripe in test mode; no real money was charged.', left, 770, { width: right - left, align: 'center' });

  doc.end();
  return done;
}
