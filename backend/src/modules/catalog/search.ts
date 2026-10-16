import { prisma } from '../../lib/prisma.js';

// PostgreSQL full-text search over Product."searchVector" (see migration add_product_search).

// "Running SHOES!!" -> ["running", "shoes"]. Only letters and digits survive, so user input
// can never inject tsquery operators (&, |, !, :*) or break the query.
function toTerms(text: string) {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    // Drop 1-letter words: as a prefix, "c" would match every word starting with c.
    // Numbers are kept ("5" in "galaxy 5" matters).
    .filter((t) => t.length > 1 || /\d/.test(t))
    .slice(0, 8); // nobody needs more than 8 words; keeps queries cheap
}

// Builds a tsquery string like "running:* & shoes:*".
//  - :* is a PREFIX match, so "runn" already finds "running": results appear while typing.
//  - to_tsquery('english', ...) then stems each word ("running" -> "run", "shoes" -> "shoe"),
//    the same way the product text was stemmed, so the two can match.
function toTsQuery(terms: string[], operator: '&' | '|') {
  return terms.map((t) => `${t}:*`).join(` ${operator} `);
}

async function rankedMatches(tsquery: string, limit: number) {
  // ts_rank scores how well a product matches: more matching words, and matches in the
  // name (weight A) score higher than matches in the description (weight C).
  return prisma.$queryRaw<{ id: string; rank: number }[]>`
    SELECT p.id, ts_rank(p."searchVector", q) AS rank
    FROM "Product" p, to_tsquery('english', ${tsquery}) q
    WHERE p."isActive" AND p."searchVector" @@ q
    ORDER BY rank DESC, p."createdAt" DESC
    LIMIT ${limit}`;
}

export type MatchMode = 'all' | 'any';

// Products matching the search text, best match first.
// First every word must match ("all"). If that finds nothing, fall back to products matching
// ANY of the words, so a slightly-off search still shows something useful.
export async function searchProducts(text: string, limit = 1000) {
  const terms = toTerms(text);
  if (terms.length === 0) return null;

  let mode: MatchMode = 'all';
  let rows = await rankedMatches(toTsQuery(terms, '&'), limit);
  if (rows.length === 0 && terms.length > 1) {
    mode = 'any';
    rows = await rankedMatches(toTsQuery(terms, '|'), limit);
  }
  return { mode, rank: new Map(rows.map((r) => [r.id, Number(r.rank)])) };
}

// Search-as-you-type suggestions: a few top products plus matching brands and categories.
export async function suggest(text: string) {
  const terms = toTerms(text);
  if (terms.length === 0) return { products: [], brands: [], categories: [] };

  const lastWord = terms.at(-1)!;
  const [matches, brands, categories] = await Promise.all([
    searchProducts(text, 5),
    prisma.product.findMany({
      where: { isActive: true, brand: { startsWith: lastWord, mode: 'insensitive' } },
      distinct: ['brand'],
      select: { brand: true },
      take: 3,
    }),
    prisma.category.findMany({
      where: { name: { startsWith: lastWord, mode: 'insensitive' } },
      select: { name: true, slug: true },
      take: 3,
    }),
  ]);

  const ids = [...(matches?.rank.keys() ?? [])];
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, slug: true, basePrice: true, images: true, brand: true },
  });
  products.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)); // keep relevance order

  return {
    products: products.map(({ images, ...p }) => ({ ...p, image: images[0] ?? null })),
    brands: brands.map((b) => b.brand!),
    categories,
  };
}
