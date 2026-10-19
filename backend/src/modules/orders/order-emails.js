// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
import { sendEmail } from '../../lib/email.js';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from '../../config/env.js';
// import = bring in code from another file or package
import { formatInvoiceNumber, loadInvoiceOrder, renderInvoicePdf } from './invoice.js';

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// `text ${x}` = a template string: text with values inserted
// .toFixed(n) = number as text with n decimals
const money = (cents) => `$${(cents / 100).toFixed(2)}`;

// Product names go into HTML, so escape them (a product called "<script>" must show as text).
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// "Thanks for your order" email, sent once when an order becomes PAID.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function sendOrderConfirmationEmail(orderId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // findUniqueOrThrow = like findUnique, but throws if the row is missing
  const order = await prisma.order.findUniqueOrThrow({
    // where = Prisma filter: which rows
    where: { id: orderId },
    // include = Prisma: also load the related rows (a JOIN)
    // select = Prisma: return only these columns
    include: { items: true, user: { select: { name: true, email: true } }, coupon: { select: { code: true } } },
  });

  // const = a name for a value that is never reassigned
  // .slice = a copy of part of an array/string
  // .toUpperCase = the text in capital letters
  const orderNumber = order.id.slice(-8).toUpperCase(); // same short number the website shows
  // const = a name for a value that is never reassigned
  // `text ${x}` = a template string: text with values inserted
  // env = the checked settings from .env (config/env.js)
  const orderUrl = `${env.CLIENT_URL}/orders/${order.id}`;

  // const = a name for a value that is never reassigned
  const rows = order.items
    // .map = make a new array by transforming each item
    .map(
      // => = an arrow function (a short function)
      // `text ${x}` = a template string: text with values inserted
      (i) => `<tr>
        <td style="padding:8px 0">${escapeHtml(i.productName)} <span style="color:#64748b">(${escapeHtml(i.variantName)}) × ${i.quantity}</span></td>
        <td style="padding:8px 0;text-align:right">${money(i.unitPrice * i.quantity)}</td>
      </tr>`,
    )
    // .join = turn an array into one string with a separator
    .join('');

  // const = a name for a value that is never reassigned
  const discountRow =
    // a ? b : c = ternary: if a then b else c
    order.discount > 0
      // `text ${x}` = a template string: text with values inserted
      // a ? b : c = ternary: if a then b else c
      ? `<tr><td style="padding:4px 0;color:#15803d">Discount${order.coupon ? ` (${escapeHtml(order.coupon.code)})` : ''}</td>
         <td style="padding:4px 0;text-align:right;color:#15803d">−${money(order.discount)}</td></tr>`
      : '';

  // Emails use inline styles and tables: many email apps (Gmail, Outlook) ignore <style> tags and modern CSS.
  // const = a name for a value that is never reassigned
  // `text ${x}` = a template string: text with values inserted
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <h1 style="color:#4f46e5;font-size:22px">ShopVerse</h1>
    <h2 style="font-size:18px">Thanks for your order, ${escapeHtml(order.user.name)}!</h2>
    <p>We've received your payment. Here's your receipt for order <b>#${orderNumber}</b>.</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">${rows}</table>
    <table style="width:100%;margin-top:8px">
      <tr><td style="padding:4px 0;color:#475569">Subtotal</td><td style="padding:4px 0;text-align:right">${money(order.subtotal)}</td></tr>
      ${discountRow}
      <tr><td style="padding:8px 0;font-weight:bold">Total paid</td><td style="padding:8px 0;text-align:right;font-weight:bold">${money(order.total)}</td></tr>
    </table>
    <p style="margin-top:24px">
      <a href="${orderUrl}" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">View your order</a>
    </p>
    <p style="color:#94a3b8;font-size:12px;margin-top:32px">ShopVerse is a portfolio project. Payments run in Stripe test mode.</p>
  </div>`;

  // const = a name for a value that is never reassigned
  const text = [
    // `text ${x}` = a template string: text with values inserted
    `Thanks for your order, ${order.user.name}!`,
    // `text ${x}` = a template string: text with values inserted
    `Order #${orderNumber}`,
    '',
    // ...x = spread: copy all items/properties of x into here
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    // `text ${x}` = a template string: text with values inserted
    ...order.items.map((i) => `${i.productName} (${i.variantName}) x${i.quantity}  ${money(i.unitPrice * i.quantity)}`),
    '',
    // `text ${x}` = a template string: text with values inserted
    `Subtotal: ${money(order.subtotal)}`,
    // ...x = spread: copy all items/properties of x into here
    // a ? b : c = ternary: if a then b else c
    // `text ${x}` = a template string: text with values inserted
    ...(order.discount > 0 ? [`Discount: -${money(order.discount)}`] : []),
    // `text ${x}` = a template string: text with values inserted
    `Total paid: ${money(order.total)}`,
    '',
    // `text ${x}` = a template string: text with values inserted
    `View your order: ${orderUrl}`,
  // .join = turn an array into one string with a separator
  ].join('\n');

  // The invoice PDF goes along as an attachment. If drawing it fails, the confirmation is still sent.
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // => = an arrow function (a short function)
  const invoiceOrder = await loadInvoiceOrder({ id: orderId }).catch(() => null);
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  const attachments = invoiceOrder
    ? [
        {
          // `text ${x}` = a template string: text with values inserted
          filename: `${formatInvoiceNumber(invoiceOrder.invoiceNumber, invoiceOrder.invoiceIssuedAt)}.pdf`,
          // await = wait for a Promise (async result) before continuing
          content: await renderInvoicePdf(invoiceOrder),
        },
      ]
    : undefined;

  // await = wait for a Promise (async result) before continuing
  // `text ${x}` = a template string: text with values inserted
  await sendEmail({ to: order.user.email, subject: `Order confirmed #${orderNumber}`, html, text, attachments });
}
