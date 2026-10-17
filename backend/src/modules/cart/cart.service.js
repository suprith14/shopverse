import { prisma } from '../../lib/prisma.js';
import { badRequest, notFound } from '../../lib/http-error.js';
import { MAX_QUANTITY_PER_ITEM } from './cart.schema.js';

// The cart lives in the database (one CartItem row per user + variant), not in the browser.
// So it follows the user across devices: add on your phone, check out on your laptop.

// Loads the cart with CURRENT prices and stock. Prices are never stored in the cart:
// if a product's price changes, the cart shows the new price (like Amazon/Flipkart do).
export async function getCart(userId) {
  const rows = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: {
      variant: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          product: { select: { id: true, name: true, slug: true, brand: true, images: true, isActive: true } },
        },
      },
    },
  });

  const items = rows.map((row) => {
    const { variant } = row;
    // Stock may have dropped since the item was added (someone else bought it).
    // We keep the item but flag it, so the user can fix it before checkout.
    const available = variant.product.isActive ? variant.stock : 0;
    return {
      variantId: variant.id,
      variantName: variant.name,
      productId: variant.product.id,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      brand: variant.product.brand,
      image: variant.product.images[0] ?? null,
      unitPrice: variant.price,
      quantity: row.quantity,
      lineTotal: variant.price * row.quantity,
      stock: available,
      issue: available === 0 ? 'OUT_OF_STOCK' : row.quantity > available ? 'NOT_ENOUGH_STOCK' : null,
    };
  });

  return {
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    // Only items that can actually be bought count toward the subtotal.
    subtotal: items.filter((i) => !i.issue).reduce((sum, i) => sum + i.lineTotal, 0),
    hasIssues: items.some((i) => i.issue),
  };
}

// Throws if `quantity` of this variant can't be put in the cart.
async function assertCanBuy(variantId, quantity) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { stock: true, product: { select: { isActive: true } } },
  });
  if (!variant || !variant.product.isActive) throw notFound('Product not found');
  if (variant.stock === 0) throw badRequest('This item is out of stock');
  if (quantity > variant.stock) throw badRequest(`Only ${variant.stock} left in stock`);
  if (quantity > MAX_QUANTITY_PER_ITEM) throw badRequest(`You can buy at most ${MAX_QUANTITY_PER_ITEM} of this item`);
}

// "Add to cart" on an item already in the cart increases its quantity instead of adding
// a second row. The @@unique([userId, variantId]) rule in the schema guarantees this.
export async function addItem(userId, { variantId, quantity }) {
  const existing = await prisma.cartItem.findUnique({
    where: { userId_variantId: { userId, variantId } },
  });
  const newQuantity = (existing?.quantity ?? 0) + quantity;
  await assertCanBuy(variantId, newQuantity);

  await prisma.cartItem.upsert({
    where: { userId_variantId: { userId, variantId } },
    create: { userId, variantId, quantity: newQuantity },
    update: { quantity: newQuantity },
  });
  return getCart(userId);
}

export async function updateQuantity(userId, variantId, quantity) {
  const existing = await prisma.cartItem.findUnique({
    where: { userId_variantId: { userId, variantId } },
  });
  if (!existing) throw notFound('Item is not in your cart');
  await assertCanBuy(variantId, quantity);

  await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity } });
  return getCart(userId);
}

export async function removeItem(userId, variantId) {
  // deleteMany doesn't throw if the item is already gone, so removing twice is harmless.
  await prisma.cartItem.deleteMany({ where: { userId, variantId } });
  return getCart(userId);
}

export async function clearCart(userId) {
  await prisma.cartItem.deleteMany({ where: { userId } });
  return getCart(userId);
}
