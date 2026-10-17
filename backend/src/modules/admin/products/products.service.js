import { Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma.js';
import { badRequest, conflict, notFound } from '../../../lib/http-error.js';

// A variant at or below this stock shows up as "low stock".
export const LOW_STOCK_THRESHOLD = 5;

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// "Air Stride Runner" -> "air-stride-runner", or "air-stride-runner-2" if that's taken.
async function uniqueSlug(name) {
  const base = slugify(name) || 'product';
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    if (!(await prisma.product.findUnique({ where: { slug }, select: { id: true } }))) return slug;
  }
}

// Product.basePrice = cheapest variant price. It's stored (denormalised) so the shop can
// filter and sort by price cheaply, so it must be recalculated whenever a variant price changes.
async function refreshBasePrice(tx, productId) {
  const { _min } = await tx.productVariant.aggregate({ where: { productId }, _min: { price: true } });
  await tx.product.update({ where: { id: productId }, data: { basePrice: _min.price ?? 0 } });
}

// SKUs are unique across the whole store. Turn the database's error into a clear message.
function rethrowSkuConflict(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    throw conflict('A variant with this SKU already exists');
  }
  throw err;
}

const adminProductInclude = {
  category: { select: { id: true, name: true, slug: true } },
  variants: { orderBy: { price: 'asc' } },
};

// ------------------------------------------------------------------ Read

export async function listProducts(query) {
  const where = {
    // Unlike the shop, admins also see hidden products.
    ...(query.status === 'active' && { isActive: true }),
    ...(query.status === 'hidden' && { isActive: false }),
    ...(query.category && { category: { slug: query.category } }),
    ...(query.lowStock && { variants: { some: { stock: { lte: LOW_STOCK_THRESHOLD } } } }),
    ...(query.q && {
      OR: [
        { name: { contains: query.q, mode: 'insensitive' } },
        { brand: { contains: query.q, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: query.q, mode: 'insensitive' } } } },
      ],
    }),
  };

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' }, // recently edited first
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: adminProductInclude,
    }),
  ]);

  return {
    items: products.map((p) => ({
      ...p,
      totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
      lowStock: p.variants.some((v) => v.stock <= LOW_STOCK_THRESHOLD),
    })),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function getProduct(id) {
  const product = await prisma.product.findUnique({ where: { id }, include: adminProductInclude });
  if (!product) throw notFound('Product not found');
  return product;
}

// ------------------------------------------------------------------ Create / edit products

export async function createProduct({ variants, ...input }) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
  if (!category) throw badRequest('Category not found');

  try {
    const product = await prisma.product.create({
      data: {
        ...input,
        attributes: input.attributes,
        slug: await uniqueSlug(input.name),
        basePrice: Math.min(...variants.map((v) => v.price)),
        variants: { create: variants },
      },
      include: adminProductInclude,
    });
    return product;
  } catch (err) {
    rethrowSkuConflict(err);
  }
}

// The slug is NOT changed when the name changes: links customers shared, bookmarks and
// Google results would all break. (Big stores keep old URLs working with redirects.)
export async function updateProduct(id, input) {
  await getProduct(id);
  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
    if (!category) throw badRequest('Category not found');
  }
  return prisma.product.update({
    where: { id },
    data: { ...input, attributes: input.attributes },
    include: adminProductInclude,
  });
}

// There's no "delete product": past orders point at its variants, and order history must
// stay intact. Admins HIDE products instead (isActive = false): gone from the shop, kept in the
// database. This is called a "soft delete". Use updateProduct({ isActive: false }).

// ------------------------------------------------------------------ Variants

export async function addVariant(productId, input) {
  await getProduct(productId);
  try {
    await prisma.$transaction(async (tx) => {
      await tx.productVariant.create({ data: { ...input, productId } });
      await refreshBasePrice(tx, productId);
    });
  } catch (err) {
    rethrowSkuConflict(err);
  }
  return getProduct(productId);
}

export async function updateVariant(variantId, input) {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, select: { productId: true } });
  if (!variant) throw notFound('Variant not found');

  // Changing the price here does NOT change past orders: they keep their snapshot price.
  await prisma.$transaction(async (tx) => {
    await tx.productVariant.update({ where: { id: variantId }, data: input });
    await refreshBasePrice(tx, variant.productId);
  });
  return getProduct(variant.productId);
}

// Only variants that were never ordered can be deleted (order history points at them).
export async function deleteVariant(variantId) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { productId: true, _count: { select: { orderItems: true } } },
  });
  if (!variant) throw notFound('Variant not found');
  if (variant._count.orderItems > 0) {
    throw conflict("This variant has been ordered before, so it can't be deleted. Set its stock to 0 instead.");
  }
  const siblings = await prisma.productVariant.count({ where: { productId: variant.productId } });
  if (siblings === 1) throw badRequest('A product needs at least one variant. Hide the product instead.');

  await prisma.$transaction(async (tx) => {
    await tx.productVariant.delete({ where: { id: variantId } }); // also removes it from carts (cascade)
    await refreshBasePrice(tx, variant.productId);
  });
  return getProduct(variant.productId);
}

// "Received 10 more" (+10) or "2 were damaged" (-2).
// Atomic like checkout: the database adds to whatever stock is at that instant, and a
// decrease only happens if enough stock is left. So an admin restocking at the same moment
// a customer checks out can't lose or invent units.
export async function adjustStock(variantId, delta) {
  const { count } = await prisma.productVariant.updateMany({
    where: { id: variantId, ...(delta < 0 && { stock: { gte: -delta } }) },
    data: { stock: { increment: delta } },
  });
  if (count === 0) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, select: { stock: true } });
    if (!variant) throw notFound('Variant not found');
    throw badRequest(`Can't remove ${-delta}: only ${variant.stock} in stock`);
  }
  const variant = await prisma.productVariant.findUniqueOrThrow({
    where: { id: variantId },
    select: { productId: true },
  });
  return getProduct(variant.productId);
}

export function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } });
}
