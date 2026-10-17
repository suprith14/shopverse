import { randomBytes } from 'node:crypto';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { stripe } from '../../lib/stripe.js';
import { badRequest } from '../../lib/http-error.js';

// ------------------------------------------------------------------ Invoice numbers

// 42 issued in 2026 -> "INV-2026-00042". The year makes numbers easier to read; the number
// itself keeps counting across years (one gapless series).
export function formatInvoiceNumber(n, issuedAt) {
  if (n === null) return null;
  return `INV-${(issuedAt ?? new Date()).getUTCFullYear()}-${String(n).padStart(5, '0')}`;
}

// The secret behind an invoice's verify link: 24 random bytes = 48 hex characters (~190 bits),
// impossible to guess or enumerate (unlike invoice numbers).
export const newInvoiceToken = () => randomBytes(24).toString('hex');

// Takes the next invoice number. MUST run inside the transaction that marks the order paid:
// the UPDATE locks the counter row (simultaneous payments wait their turn: no duplicates) and a
// rolled-back transaction undoes the +1 (no gaps).
export async function takeNextInvoiceNumber(tx) {
  const rows = await tx.$queryRaw`
    UPDATE "InvoiceCounter" SET value = value + 1 WHERE id = 'invoice' RETURNING value`;
  if (rows[0]) return rows[0].value;
  // First invoice ever on a database without the counter row.
  await tx.invoiceCounter.create({ data: { id: 'invoice', value: 1 } });
  return 1;
}

// ------------------------------------------------------------------ Card details from Stripe

// After payment, copy what the invoice needs from Stripe: card brand, last 4 digits and the
// hosted receipt link. Asked once, then stored, so downloads never depend on Stripe.
export async function saveCardDetails(orderId, paymentIntentId) {
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
};

const money = (cents) => `$${(cents / 100).toFixed(2)}`;
const day = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

// Loads an order for its invoice, or explains why there isn't one yet.
export async function loadInvoiceOrder(where) {
  const order = await prisma.order.findFirst({ where, include: invoiceInclude });
  if (!order) return null;
  if (order.invoiceNumber === null) throw badRequest('The invoice is available once the order is paid');
  return order;
}

// The public page a verification QR code / link opens (store frontend: /verify/:token).
export const verifyUrl = (token) => `${env.CLIENT_URL}/verify/${token}`;

// Draws the invoice and returns it as a PDF file in memory (also used as an email attachment).
export async function renderInvoicePdf(order) {
  // Error correction "M" (~15%): still scans if the printout is slightly smudged or folded.
  const qr = order.invoiceToken
    ? await QRCode.toBuffer(verifyUrl(order.invoiceToken), { errorCorrectionLevel: 'M', margin: 1, width: 300 })
    : null;

  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: { Title: `Invoice ${formatInvoiceNumber(order.invoiceNumber, order.invoiceIssuedAt)}` },
  });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const left = 50;
  const right = 545; // A4 width 595 - margin 50
  const grey = '#64748b';

  // Header
  doc.fillColor('#4f46e5').font('Helvetica-Bold').fontSize(22).text('ShopVerse', left, 50);
  doc
    .fillColor('#0f172a')
    .fontSize(18)
    .text('INVOICE', left, 50, { width: right - left, align: 'right' });
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(grey)
    .text(formatInvoiceNumber(order.invoiceNumber, order.invoiceIssuedAt) ?? '', left, 75, {
      width: right - left,
      align: 'right',
    })
    .text(`Issued ${day(order.invoiceIssuedAt ?? order.createdAt)}`, { width: right - left, align: 'right' })
    .text(`Order #${order.id.slice(-8).toUpperCase()}, placed ${day(order.createdAt)}`, {
      width: right - left,
      align: 'right',
    });

  // Bill to / Ship to
  const top = 135;
  doc.fillColor(grey).fontSize(9).text('BILLED TO', left, top).text('SHIP TO', 300, top);
  doc
    .fillColor('#0f172a')
    .fontSize(10)
    .text(order.user.name, left, top + 14)
    .text(order.user.email);
  const ship = order.shippingAddress;
  const shipLines = ship
    ? [
        ship.fullName,
        ship.line1,
        ship.line2,
        `${ship.city}, ${ship.state} ${ship.postalCode}`,
        ship.country,
        ship.phone,
      ].filter(Boolean)
    : ['No delivery address recorded'];
  doc.text(shipLines.join('\n'), 300, top + 14);

  // Items table
  let y = 245;
  doc.moveTo(left, y).lineTo(right, y).strokeColor('#e2e8f0').stroke();
  y += 8;
  doc
    .fillColor(grey)
    .fontSize(9)
    .text('ITEM', left, y)
    .text('QTY', 340, y, { width: 40, align: 'right' })
    .text('UNIT PRICE', 390, y, { width: 70, align: 'right' })
    .text('AMOUNT', 470, y, { width: 75, align: 'right' });
  y += 18;
  doc.fillColor('#0f172a').fontSize(10);
  for (const item of order.items) {
    // Names and prices are the snapshot from when the order was placed.
    doc.text(`${item.productName} (${item.variantName})`, left, y, { width: 280 });
    const rowHeight = doc.heightOfString(`${item.productName} (${item.variantName})`, { width: 280 });
    doc
      .text(String(item.quantity), 340, y, { width: 40, align: 'right' })
      .text(money(item.unitPrice), 390, y, { width: 70, align: 'right' })
      .text(money(item.unitPrice * item.quantity), 470, y, { width: 75, align: 'right' });
    y += Math.max(rowHeight, 14) + 8;
  }
  doc.moveTo(left, y).lineTo(right, y).strokeColor('#e2e8f0').stroke();

  // Totals
  y += 12;
  const total = (label, value, bold = false) => {
    doc
      .font(bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(bold ? 12 : 10)
      .text(label, 340, y, { width: 120, align: 'right' })
      .text(value, 470, y, { width: 75, align: 'right' });
    y += bold ? 20 : 16;
  };
  total('Subtotal', money(order.subtotal));
  if (order.discount > 0)
    total(`Discount${order.coupon ? ` (${order.coupon.code})` : ''}`, `-${money(order.discount)}`);
  total('Total paid', money(order.total), true);

  // Payment
  y += 14;
  doc.font('Helvetica').fontSize(9).fillColor(grey).text('PAYMENT', left, y);
  const method =
    order.cardBrand && order.cardLast4
      ? `${order.cardBrand.charAt(0).toUpperCase()}${order.cardBrand.slice(1)} card ending ${order.cardLast4}`
      : 'Card (via Stripe)';
  doc
    .fillColor('#0f172a')
    .fontSize(10)
    .text(method, left, y + 14);
  if (order.stripePaymentIntentId) doc.fillColor(grey).fontSize(8).text(`Reference: ${order.stripePaymentIntentId}`);

  // Verify + view links: a QR code AND the same links as text (a picture alone helps nobody
  // using a screen reader, or reading the PDF on the only device they have).
  // The domain is printed in full so people can see where the QR leads before trusting it.
  if (qr && order.invoiceToken) {
    const boxTop = Math.max(doc.y + 24, 600);
    doc.image(qr, left, boxTop, { width: 96 });
    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Scan to verify this invoice', left + 112, boxTop + 4);
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(grey)
      .text(
        'Confirms it was issued by ShopVerse. Shows only the invoice number, date, total and status.',
        left + 112,
        doc.y + 2,
        { width: 380 },
      )
      .fillColor('#4f46e5')
      .text(verifyUrl(order.invoiceToken), { width: 380, link: verifyUrl(order.invoiceToken) })
      .moveDown(0.6)
      .fillColor(grey)
      .text('View your order (login required):', { width: 380 })
      .fillColor('#4f46e5')
      .text(`${env.CLIENT_URL}/orders/${order.id}`, { width: 380, link: `${env.CLIENT_URL}/orders/${order.id}` });
  }

  // Refunded orders keep their invoice (the number is never reused), clearly marked.
  if (order.status === 'REFUNDED') {
    doc
      .save()
      .rotate(-20, { origin: [300, 420] })
      .fillColor('#dc2626')
      .opacity(0.25)
      .font('Helvetica-Bold')
      .fontSize(64)
      .text('REFUNDED', 120, 400)
      .restore();
  }

  doc
    .fillColor(grey)
    .font('Helvetica')
    .fontSize(8)
    .text(
      'ShopVerse is a portfolio project. Payments are processed by Stripe in test mode; no real money was charged.',
      left,
      770,
      { width: right - left, align: 'center' },
    );

  doc.end();
  return done;
}
