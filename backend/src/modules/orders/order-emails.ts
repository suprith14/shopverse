import { prisma } from '../../lib/prisma.js';
import { sendEmail } from '../../lib/email.js';
import { env } from '../../config/env.js';

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

// Product names go into HTML, so escape them (a product called "<script>" must show as text).
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// "Thanks for your order" email, sent once when an order becomes PAID.
export async function sendOrderConfirmationEmail(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true, user: { select: { name: true, email: true } }, coupon: { select: { code: true } } },
  });

  const orderNumber = order.id.slice(-8).toUpperCase(); // same short number the website shows
  const orderUrl = `${env.CLIENT_URL}/orders/${order.id}`;

  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0">${escapeHtml(i.productName)} <span style="color:#64748b">(${escapeHtml(i.variantName)}) × ${i.quantity}</span></td>
        <td style="padding:8px 0;text-align:right">${money(i.unitPrice * i.quantity)}</td>
      </tr>`,
    )
    .join('');

  const discountRow =
    order.discount > 0
      ? `<tr><td style="padding:4px 0;color:#15803d">Discount${order.coupon ? ` (${escapeHtml(order.coupon.code)})` : ''}</td>
         <td style="padding:4px 0;text-align:right;color:#15803d">−${money(order.discount)}</td></tr>`
      : '';

  // Emails use inline styles and tables: many email apps (Gmail, Outlook) ignore <style> tags and modern CSS.
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

  const text = [
    `Thanks for your order, ${order.user.name}!`,
    `Order #${orderNumber}`,
    '',
    ...order.items.map((i) => `${i.productName} (${i.variantName}) x${i.quantity}  ${money(i.unitPrice * i.quantity)}`),
    '',
    `Subtotal: ${money(order.subtotal)}`,
    ...(order.discount > 0 ? [`Discount: -${money(order.discount)}`] : []),
    `Total paid: ${money(order.total)}`,
    '',
    `View your order: ${orderUrl}`,
  ].join('\n');

  await sendEmail({ to: order.user.email, subject: `Order confirmed #${orderNumber}`, html, text });
}
