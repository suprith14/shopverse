import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { notFound } from '../../lib/http-error.js';
import type { ListProductsQuery } from './catalog.schema.js';
import { searchProducts } from './search.js';

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

type Sort = NonNullable<ListProductsQuery['sort']>;

const sortOrders: Record<Exclude<Sort, 'relevance'>, Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ createdAt: 'desc' }],
  price_asc: [{ basePrice: 'asc' }],
  price_desc: [{ basePrice: 'desc' }],
  rating: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
};

type FacetName = 'category' | 'brand' | 'rating';

// Builds the WHERE clause from the filters that were actually sent.
// `skip` leaves one filter out: needed for facet counts (see below).
function buildWhere(query: ListProductsQuery, searchIds: string[] | null, skip?: FacetName): Prisma.ProductWhereInput {
  return {
    isActive: true,
    ...(searchIds && { id: { in: searchIds } }),
    ...(query.category && skip !== 'category' && { category: { slug: query.category } }),
    ...(query.brand && skip !== 'brand' && { brand: query.brand }),
    ...(query.minRating !== undefined && skip !== 'rating' && { ratingAvg: { gte: query.minRating } }),
    ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
      basePrice: { gte: query.minPrice, lte: query.maxPrice },
    }),
  };
}

export async function listProducts(query: ListProductsQuery) {
  // 1. Text search (if any): which products match, and how well.
  const search = query.q ? await searchProducts(query.q) : null;
  const searchIds = search ? [...search.rank.keys()] : null;

  // Default sort: best match when searching, newest otherwise.
  const sort: Sort = query.sort ?? (search ? 'relevance' : 'newest');
  const where = buildWhere(query, searchIds);
  const skip = (query.page - 1) * query.limit;

  // 2. One page of products, in the requested order.
  let total: number;
  let items: ProductSummaryRow[];
  if (sort === 'relevance' && search) {
    // The database gave us the ranking, so: find which matches pass the other filters,
    // order them by rank, cut out the requested page, then load just that page.
    const passing = await prisma.product.findMany({ where, select: { id: true } });
    const ordered = passing.map((p) => p.id).sort((a, b) => search.rank.get(b)! - search.rank.get(a)!);
    const pageIds = ordered.slice(skip, skip + query.limit);
    total = ordered.length;
    items = await prisma.product.findMany({ where: { id: { in: pageIds } }, select: productSummarySelect });
    items.sort((a, b) => pageIds.indexOf(a.id) - pageIds.indexOf(b.id));
  } else {
    [total, items] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: sortOrders[sort === 'relevance' ? 'newest' : sort],
        skip,
        take: query.limit,
        select: productSummarySelect,
      }),
    ]);
  }

  return {
    items: items.map(toProductSummary),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
    sort,
    // 'all' = every word matched, 'any' = no product had all the words, showing partial matches.
    matchMode: search?.mode ?? null,
    facets: await getFacets(query, searchIds),
  };
}

// Facets: the counts next to each filter option, e.g. "Nike (3)".
// Each facet ignores ITS OWN filter but applies all the others. So after picking "Nike",
// the brand list still shows Adidas (2), and clicking it switches brand, instead of
// everything else showing (0). Amazon and Flipkart filters work the same way.
async function getFacets(query: ListProductsQuery, searchIds: string[] | null) {
  const ratingWhere = buildWhere(query, searchIds, 'rating');
  const [categoryRows, categories, brandRows, ...ratingCounts] = await prisma.$transaction([
    prisma.product.groupBy({
      by: ['categoryId'],
      where: buildWhere(query, searchIds, 'category'),
      _count: { _all: true },
      orderBy: { categoryId: 'asc' },
    }),
    prisma.category.findMany({ select: { id: true, slug: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.product.groupBy({
      by: ['brand'],
      where: { ...buildWhere(query, searchIds, 'brand'), brand: { not: null } },
      _count: { _all: true },
      orderBy: { brand: 'asc' },
    }),
    ...[4, 3, 2].map((min) => prisma.product.count({ where: { ...ratingWhere, ratingAvg: { gte: min } } })),
  ]);

  const countByCategory = new Map(categoryRows.map((r) => [r.categoryId, r._count._all]));
  return {
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, count: countByCategory.get(c.id) ?? 0 })),
    brands: brandRows.map((r) => ({ value: r.brand!, count: r._count._all })),
    ratings: [4, 3, 2].map((min, i) => ({ min, count: ratingCounts[i] as number })),
  };
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
