import { prisma } from '../../lib/prisma.js';
import { notFound } from '../../lib/http-error.js';
import { productSummarySelect, toProductSummary } from '../catalog/catalog.service.js';

// A wishlist saves PRODUCTS, not variants: you like "Air Stride Runner", and pick the
// size later when you buy. (The cart saves variants because you buy a specific size.)

export async function getWishlist(userId) {
  const rows = await prisma.wishlistItem.findMany({
    // Hide products that were taken off the store since they were saved.
    where: { userId, product: { isActive: true } },
    orderBy: { createdAt: 'desc' }, // newest saved first
    include: { product: { select: productSummarySelect } },
  });
  return rows.map((row) => ({ addedAt: row.createdAt, product: toProductSummary(row.product) }));
}

// Idempotent: saving a product that's already saved does nothing and doesn't fail.
// So a double-click, or a retried request after a network blip, is harmless.
export async function addProduct(userId, productId) {
  const product = await prisma.product.findFirst({ where: { id: productId, isActive: true }, select: { id: true } });
  if (!product) throw notFound('Product not found');

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {}, // already saved: nothing to change
  });
  return getWishlist(userId);
}

// Also idempotent: removing something that isn't saved is not an error.
export async function removeProduct(userId, productId) {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  return getWishlist(userId);
}
