// import = bring in code from another file or package
// randomBytes = cryptographically secure random bytes (for tokens)
import { randomBytes } from 'node:crypto';
// import = bring in code from another file or package
// PDFDocument = pdfkit: draws a PDF page by page
import PDFDocument from 'pdfkit';
// import = bring in code from another file or package
// QRCode = draws a QR code image
import QRCode from 'qrcode';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from '../../config/env.js';
// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
import { stripe } from '../../lib/stripe.js';
// import = bring in code from another file or package
// badRequest = HttpError 400: the request is invalid
import { badRequest } from '../../lib/http-error.js';

// ------------------------------------------------------------------ Invoice numbers

// 42 issued in 2026 -> "INV-2026-00042". The year makes numbers easier to read; the number
// itself keeps counting across years (one gapless series).
// export = other files can import this
// function = a named, reusable block of code
export function formatInvoiceNumber(n, issuedAt) {
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  if (n === null) return null;
  // return = give this value back and stop the function here
  // `text ${x}` = a template string: text with values inserted
  // a ?? b = a, unless a is null/undefined, then b
  // new = create an object from a class (e.g. new Date())
  // Date = a point in time (Date.now() = milliseconds since 1970)
  // .padStart = pad a string at the start to a length
  return `INV-${(issuedAt ?? new Date()).getUTCFullYear()}-${String(n).padStart(5, '0')}`;
}

// The secret behind an invoice's verify link: 24 random bytes = 48 hex characters (~190 bits),
// impossible to guess or enumerate (unlike invoice numbers).
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// randomBytes = cryptographically secure random bytes (for tokens)
export const newInvoiceToken = () => randomBytes(24).toString('hex');

// Takes the next invoice number. MUST run inside the transaction that marks the order paid:
// the UPDATE locks the counter row (simultaneous payments wait their turn: no duplicates) and a
// rolled-back transaction undoes the +1 (no gaps).
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function takeNextInvoiceNumber(tx) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.$queryRaw = run hand-written SQL (values are escaped safely)
  // `text ${x}` = a template string: text with values inserted
  const rows = await tx.$queryRaw`
    UPDATE "InvoiceCounter" SET value = value + 1 WHERE id = 'invoice' RETURNING value`;
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  if (rows[0]) return rows[0].value;
  // First invoice ever on a database without the counter row.
  // await = wait for a Promise (async result) before continuing
  // tx.invoiceCounter = the InvoiceCounter table (model in prisma/schema.prisma)
  // create = insert one new row (INSERT)
  // data = Prisma: the values to write
  await tx.invoiceCounter.create({ data: { id: 'invoice', value: 1 } });
  // return = give this value back and stop the function here
  return 1;
}

// ------------------------------------------------------------------ Card details from Stripe

// After payment, copy what the invoice needs from Stripe: card brand, last 4 digits and the
// hosted receipt link. Asked once, then stored, so downloads never depend on Stripe.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function saveCardDetails(orderId, paymentIntentId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // stripe.paymentIntents = one payment attempt and its status
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] });
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // === = strictly equal (same value AND same type)
  const charge = typeof intent.latest_charge === 'object' ? intent.latest_charge : null;
  // const = a name for a value that is never reassigned
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  const card = charge?.payment_method_details?.card;
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  await prisma.order.update({
    // where = Prisma filter: which rows
    where: { id: orderId },
    // data = Prisma: the values to write
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    data: { cardBrand: card?.brand ?? null, cardLast4: card?.last4 ?? null, receiptUrl: charge?.receipt_url ?? null },
  });
}

// ------------------------------------------------------------------ The PDF

// export = other files can import this
// const = a name for a value that is never reassigned
export const invoiceInclude = {
  items: true,
  // select = Prisma: return only these columns
  user: { select: { name: true, email: true } },
  // select = Prisma: return only these columns
  coupon: { select: { code: true } },
};

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// `text ${x}` = a template string: text with values inserted
// .toFixed(n) = number as text with n decimals
const money = (cents) => `$${(cents / 100).toFixed(2)}`;
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const day = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

// Loads an order for its invoice, or explains why there isn't one yet.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function loadInvoiceOrder(where) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // findFirst = read the first row that matches (null if none)
  // where = Prisma filter: which rows
  // include = Prisma: also load the related rows (a JOIN)
  const order = await prisma.order.findFirst({ where, include: invoiceInclude });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  if (!order) return null;
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (order.invoiceNumber === null) throw badRequest('The invoice is available once the order is paid');
  // return = give this value back and stop the function here
  return order;
}

// The public page a verification QR code / link opens (store frontend: /verify/:token).
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// `text ${x}` = a template string: text with values inserted
// env = the checked settings from .env (config/env.js)
export const verifyUrl = (token) => `${env.CLIENT_URL}/verify/${token}`;

// Draws the invoice and returns it as a PDF file in memory (also used as an email attachment).
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function renderInvoicePdf(order) {
  // Error correction "M" (~15%): still scans if the printout is slightly smudged or folded.
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  const qr = order.invoiceToken
    // await = wait for a Promise (async result) before continuing
    // QRCode = draws a QR code image
    // QRCode.toBuffer = draw the QR code as PNG bytes
    ? await QRCode.toBuffer(verifyUrl(order.invoiceToken), { errorCorrectionLevel: 'M', margin: 1, width: 300 })
    : null;

  // const = a name for a value that is never reassigned
  // new = create an object from a class (e.g. new Date())
  // PDFDocument = pdfkit: draws a PDF page by page
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    // `text ${x}` = a template string: text with values inserted
    info: { Title: `Invoice ${formatInvoiceNumber(order.invoiceNumber, order.invoiceIssuedAt)}` },
  });
  // const = a name for a value that is never reassigned
  const chunks = [];
  // doc.on = react to PDF events (data chunks, end)
  // => = an arrow function (a short function)
  doc.on('data', (c) => chunks.push(c));
  // const = a name for a value that is never reassigned
  // new = create an object from a class (e.g. new Date())
  // Promise = a value that arrives later; Promise.all waits for several at once
  // => = an arrow function (a short function)
  // doc.on = react to PDF events (data chunks, end)
  // Buffer = raw bytes in Node (files, hashes, images)
  const done = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  // const = a name for a value that is never reassigned
  const left = 50;
  // const = a name for a value that is never reassigned
  const right = 545; // A4 width 595 - margin 50
  // const = a name for a value that is never reassigned
  const grey = '#64748b';

  // Header
  // doc.fillColor = colour for what follows
  doc.fillColor('#4f46e5').font('Helvetica-Bold').fontSize(22).text('ShopVerse', left, 50);
  doc
    // doc.fillColor = colour for what follows
    .fillColor('#0f172a')
    .fontSize(18)
    .text('INVOICE', left, 50, { width: right - left, align: 'right' });
  doc
    // doc.font = font for what follows
    .font('Helvetica')
    .fontSize(10)
    .fillColor(grey)
    // a ?? b = a, unless a is null/undefined, then b
    .text(formatInvoiceNumber(order.invoiceNumber, order.invoiceIssuedAt) ?? '', left, 75, {
      width: right - left,
      align: 'right',
    })
    // `text ${x}` = a template string: text with values inserted
    // a ?? b = a, unless a is null/undefined, then b
    .text(`Issued ${day(order.invoiceIssuedAt ?? order.createdAt)}`, { width: right - left, align: 'right' })
    // `text ${x}` = a template string: text with values inserted
    // .slice = a copy of part of an array/string
    // .toUpperCase = the text in capital letters
    .text(`Order #${order.id.slice(-8).toUpperCase()}, placed ${day(order.createdAt)}`, {
      width: right - left,
      align: 'right',
    });

  // Bill to / Ship to
  // const = a name for a value that is never reassigned
  const top = 135;
  // doc.fillColor = colour for what follows
  doc.fillColor(grey).fontSize(9).text('BILLED TO', left, top).text('SHIP TO', 300, top);
  doc
    // doc.fillColor = colour for what follows
    .fillColor('#0f172a')
    .fontSize(10)
    .text(order.user.name, left, top + 14)
    .text(order.user.email);
  // const = a name for a value that is never reassigned
  const ship = order.shippingAddress;
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  const shipLines = ship
    ? [
        ship.fullName,
        ship.line1,
        ship.line2,
        // `text ${x}` = a template string: text with values inserted
        `${ship.city}, ${ship.state} ${ship.postalCode}`,
        ship.country,
        ship.phone,
      // .filter = keep only the items that pass a test
      ].filter(Boolean)
    : ['No delivery address recorded'];
  // doc.text = write text on the PDF
  // .join = turn an array into one string with a separator
  doc.text(shipLines.join('\n'), 300, top + 14);

  // Items table
  // let = a name whose value can be changed later
  let y = 245;
  // doc.moveTo = start a line here
  doc.moveTo(left, y).lineTo(right, y).strokeColor('#e2e8f0').stroke();
  y += 8;
  doc
    // doc.fillColor = colour for what follows
    .fillColor(grey)
    .fontSize(9)
    .text('ITEM', left, y)
    .text('QTY', 340, y, { width: 40, align: 'right' })
    .text('UNIT PRICE', 390, y, { width: 70, align: 'right' })
    .text('AMOUNT', 470, y, { width: 75, align: 'right' });
  y += 18;
  // doc.fillColor = colour for what follows
  doc.fillColor('#0f172a').fontSize(10);
  // const = a name for a value that is never reassigned
  for (const item of order.items) {
    // Names and prices are the snapshot from when the order was placed.
    // doc.text = write text on the PDF
    // `text ${x}` = a template string: text with values inserted
    doc.text(`${item.productName} (${item.variantName})`, left, y, { width: 280 });
    // const = a name for a value that is never reassigned
    // doc.heightOfString = how tall this text will be
    // `text ${x}` = a template string: text with values inserted
    const rowHeight = doc.heightOfString(`${item.productName} (${item.variantName})`, { width: 280 });
    doc
      // doc.text = write text on the PDF
      .text(String(item.quantity), 340, y, { width: 40, align: 'right' })
      // doc.text = write text on the PDF
      .text(money(item.unitPrice), 390, y, { width: 70, align: 'right' })
      // doc.text = write text on the PDF
      .text(money(item.unitPrice * item.quantity), 470, y, { width: 75, align: 'right' });
    // Math = number helpers (min, max, round, floor, ceil...)
    y += Math.max(rowHeight, 14) + 8;
  }
  // doc.moveTo = start a line here
  doc.moveTo(left, y).lineTo(right, y).strokeColor('#e2e8f0').stroke();

  // Totals
  y += 12;
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // x = value (in parameters) = the default used when x is not given
  const total = (label, value, bold = false) => {
    doc
      // doc.font = font for what follows
      // a ? b : c = ternary: if a then b else c
      .font(bold ? 'Helvetica-Bold' : 'Helvetica')
      // a ? b : c = ternary: if a then b else c
      .fontSize(bold ? 12 : 10)
      .text(label, 340, y, { width: 120, align: 'right' })
      .text(value, 470, y, { width: 75, align: 'right' });
    // a ? b : c = ternary: if a then b else c
    y += bold ? 20 : 16;
  };
  total('Subtotal', money(order.subtotal));
  // if (...) = run the next part only when the condition is true
  if (order.discount > 0)
    // `text ${x}` = a template string: text with values inserted
    // a ? b : c = ternary: if a then b else c
    total(`Discount${order.coupon ? ` (${order.coupon.code})` : ''}`, `-${money(order.discount)}`);
  total('Total paid', money(order.total), true);

  // Payment
  y += 14;
  // doc.font = font for what follows
  doc.font('Helvetica').fontSize(9).fillColor(grey).text('PAYMENT', left, y);
  // const = a name for a value that is never reassigned
  const method =
    // a ? b : c = ternary: if a then b else c
    // a && b = AND; in JSX: show b only when a is true
    order.cardBrand && order.cardLast4
      // `text ${x}` = a template string: text with values inserted
      // .toUpperCase = the text in capital letters
      // .slice = a copy of part of an array/string
      ? `${order.cardBrand.charAt(0).toUpperCase()}${order.cardBrand.slice(1)} card ending ${order.cardLast4}`
      : 'Card (via Stripe)';
  doc
    // doc.fillColor = colour for what follows
    .fillColor('#0f172a')
    .fontSize(10)
    .text(method, left, y + 14);
  // if (...) = run the next part only when the condition is true
  // doc.fillColor = colour for what follows
  // `text ${x}` = a template string: text with values inserted
  if (order.stripePaymentIntentId) doc.fillColor(grey).fontSize(8).text(`Reference: ${order.stripePaymentIntentId}`);

  // Verify + view links: a QR code AND the same links as text (a picture alone helps nobody
  // using a screen reader, or reading the PDF on the only device they have).
  // The domain is printed in full so people can see where the QR leads before trusting it.
  // if (...) = run the next part only when the condition is true
  // a && b = AND; in JSX: show b only when a is true
  if (qr && order.invoiceToken) {
    // const = a name for a value that is never reassigned
    // Math = number helpers (min, max, round, floor, ceil...)
    // doc.y = the current vertical position on the page
    const boxTop = Math.max(doc.y + 24, 600);
    // doc.image = place an image on the PDF
    doc.image(qr, left, boxTop, { width: 96 });
    doc
      // doc.fillColor = colour for what follows
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Scan to verify this invoice', left + 112, boxTop + 4);
    doc
      // doc.font = font for what follows
      .font('Helvetica')
      .fontSize(8)
      .fillColor(grey)
      .text(
        'Confirms it was issued by ShopVerse. Shows only the invoice number, date, total and status.',
        left + 112,
        // doc.y = the current vertical position on the page
        doc.y + 2,
        { width: 380 },
      )
      .fillColor('#4f46e5')
      .text(verifyUrl(order.invoiceToken), { width: 380, link: verifyUrl(order.invoiceToken) })
      .moveDown(0.6)
      .fillColor(grey)
      .text('View your order (login required):', { width: 380 })
      .fillColor('#4f46e5')
      // `text ${x}` = a template string: text with values inserted
      // env = the checked settings from .env (config/env.js)
      .text(`${env.CLIENT_URL}/orders/${order.id}`, { width: 380, link: `${env.CLIENT_URL}/orders/${order.id}` });
  }

  // Refunded orders keep their invoice (the number is never reused), clearly marked.
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
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
    // doc.fillColor = colour for what follows
    .fillColor(grey)
    .font('Helvetica')
    .fontSize(8)
    .text(
      'ShopVerse is a portfolio project. Payments are processed by Stripe in test mode; no real money was charged.',
      left,
      770,
      { width: right - left, align: 'center' },
    );

  // doc.end = finish the PDF
  doc.end();
  // return = give this value back and stop the function here
  return done;
}
