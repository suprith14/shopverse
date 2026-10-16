import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { notFound } from '../../lib/http-error.js';
import type { ListProductsQuery } from './catalog.schema.js';

export function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
}

// The fields a product card needs. Shared with other modules (e.g. the wishlist)
// so every product card in the app gets the same shape.
export const productSummarySelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  basePrice: true,
  images: true,
  ratingAvg: true,
  ratingCount: true,
  category: { select: { name: true, slug: true } },
  variants: { select: { stock: true } },
} satisfies Prisma.ProductSelect;

type ProductSummaryRow = Prisma.ProductGetPayload<{ select: typeof productSummarySelect }>;

export function toProductSummary({ variants, ...p }: ProductSummaryRow) {
  return { ...p, image: p.images[0] ?? null, inStock: variants.some((v) => v.stock > 0) };
}

const sortOrders: Record<ListProductsQuery['sort'], Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ createdAt: 'desc' }],
  price_asc: [{ basePrice: 'asc' }],
  price_desc: [{ basePrice: 'desc' }],
  rating: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
};

export async function listProducts(query: ListProductsQuery) {
  // Build the WHERE clause only from the filters that were actually sent.
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(query.category && { category: { slug: query.category } }),
    ...(query.brand && { brand: query.brand }),
    ...(query.minRating !== undefined && { ratingAvg: { gte: query.minRating } }),
    ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
      basePrice: { gte: query.minPrice, lte: query.maxPrice },
    }),
    ...(query.q && {
      OR: [
        { name: { contains: query.q, mode: 'insensitive' } },
        { brand: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ],
    }),
  };

  // Offset pagination: skip the previous pages. Count and data run in one transaction.
  const [total, items] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: sortOrders[query.sort],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      select: productSummarySelect,
    }),
  ]);

  return {
    items: items.map(toProductSummary),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

// Distinct brands for the filter sidebar (optionally within one category).
export async function listBrands(categorySlug?: string) {
  const rows = await prisma.product.findMany({
    where: { isActive: true, brand: { not: null }, ...(categorySlug && { category: { slug: categorySlug } }) },
    distinct: ['brand'],
    select: { brand: true },
    orderBy: { brand: 'asc' },
  });
  return rows.map((r) => r.brand as string);
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
      variants: { orderBy: { price: 'asc' } },
    },
  });
  if (!product) throw notFound('Product not found');
  return product;
}
