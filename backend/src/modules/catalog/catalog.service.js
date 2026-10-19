// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
// notFound = HttpError 404: doesn't exist
import { notFound } from '../../lib/http-error.js';
// import = bring in code from another file or package
import { searchProducts } from './search.js';

// export = other files can import this
// function = a named, reusable block of code
export function listCategories() {
  // return = give this value back and stop the function here
  // prisma.category = the Category table (model in prisma/schema.prisma)
  // findMany = read many rows (SELECT ... WHERE)
  return prisma.category.findMany({
    // orderBy = Prisma: sort order (asc / desc)
    orderBy: { name: 'asc' },
    // include = Prisma: also load the related rows (a JOIN)
    // _count = Prisma: count rows (or related rows)
    // select = Prisma: return only these columns
    // where = Prisma filter: which rows
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
}

// The fields a product card needs. Shared with other modules (e.g. the wishlist)
// so every product card in the app gets the same shape.
// export = other files can import this
// const = a name for a value that is never reassigned
export const productSummarySelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  basePrice: true,
  images: true,
  ratingAvg: true,
  ratingCount: true,
  // select = Prisma: return only these columns
  category: { select: { name: true, slug: true } },
  // select = Prisma: return only these columns
  variants: { select: { stock: true } },
};

// export = other files can import this
// function = a named, reusable block of code
// { a, b } = destructuring: take properties a and b out of an object
// ...rest = collect the remaining items/properties
export function toProductSummary({ variants, ...p }) {
  // return = give this value back and stop the function here
  // ...x = spread: copy all items/properties of x into here
  // a ?? b = a, unless a is null/undefined, then b
  // .some = true if at least one item passes the test
  // => = an arrow function (a short function)
  return { ...p, image: p.images[0] ?? null, inStock: variants.some((v) => v.stock > 0) };
}

// const = a name for a value that is never reassigned
const sortOrders = {
  newest: [{ createdAt: 'desc' }],
  price_asc: [{ basePrice: 'asc' }],
  price_desc: [{ basePrice: 'desc' }],
  rating: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
};

// Builds the WHERE clause from the filters that were actually sent.
// `skip` leaves one filter out: needed for facet counts (see below).
// function = a named, reusable block of code
function buildWhere(query, searchIds, skip) {
  // return = give this value back and stop the function here
  return {
    isActive: true,
    // ...x = spread: copy all items/properties of x into here
    // a && b = AND; in JSX: show b only when a is true
    // in = Prisma: the value is one of this list
    ...(searchIds && { id: { in: searchIds } }),
    // ...x = spread: copy all items/properties of x into here
    // !== = not strictly equal
    // a && b = AND; in JSX: show b only when a is true
    ...(query.category && skip !== 'category' && { category: { slug: query.category } }),
    // ...x = spread: copy all items/properties of x into here
    // !== = not strictly equal
    // a && b = AND; in JSX: show b only when a is true
    ...(query.brand && skip !== 'brand' && { brand: query.brand }),
    // ...x = spread: copy all items/properties of x into here
    // !== = not strictly equal
    // a && b = AND; in JSX: show b only when a is true
    // gte = greater than or equal (>=)
    ...(query.minRating !== undefined && skip !== 'rating' && { ratingAvg: { gte: query.minRating } }),
    // ...x = spread: copy all items/properties of x into here
    // !== = not strictly equal
    // a || b = OR: a if it is truthy, else b
    // a && b = AND; in JSX: show b only when a is true
    ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
      // gte = greater than or equal (>=)
      // lte = less than or equal (<=)
      basePrice: { gte: query.minPrice, lte: query.maxPrice },
    }),
  };
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function listProducts(query) {
  // 1. Text search (if any): which products match, and how well.
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // await = wait for a Promise (async result) before continuing
  const search = query.q ? await searchProducts(query.q) : null;
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // ...x = spread: copy all items/properties of x into here
  // Object.keys = the property names of an object
  const searchIds = search ? [...search.rank.keys()] : null;

  // Default sort: best match when searching, newest otherwise.
  // const = a name for a value that is never reassigned
  // .sort = put the items in order (changes the array)
  // a ?? b = a, unless a is null/undefined, then b
  // a ? b : c = ternary: if a then b else c
  const sort = query.sort ?? (search ? 'relevance' : 'newest');
  // const = a name for a value that is never reassigned
  const where = buildWhere(query, searchIds);
  // const = a name for a value that is never reassigned
  const skip = (query.page - 1) * query.limit;

  // 2. One page of products, in the requested order.
  // let = a name whose value can be changed later
  let total;
  // let = a name whose value can be changed later
  let items;
  // if (...) = run the next part only when the condition is true
  // .sort = put the items in order (changes the array)
  // === = strictly equal (same value AND same type)
  // a && b = AND; in JSX: show b only when a is true
  if (sort === 'relevance' && search) {
    // The database gave us the ranking, so: find which matches pass the other filters,
    // order them by rank, cut out the requested page, then load just that page.
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // prisma.product = the Product table (model in prisma/schema.prisma)
    // findMany = read many rows (SELECT ... WHERE)
    // where = Prisma filter: which rows
    // select = Prisma: return only these columns
    const passing = await prisma.product.findMany({ where, select: { id: true } });
    // const = a name for a value that is never reassigned
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    // .sort = put the items in order (changes the array)
    const ordered = passing.map((p) => p.id).sort((a, b) => search.rank.get(b) - search.rank.get(a));
    // const = a name for a value that is never reassigned
    // .slice = a copy of part of an array/string
    const pageIds = ordered.slice(skip, skip + query.limit);
    total = ordered.length;
    // await = wait for a Promise (async result) before continuing
    // prisma.product = the Product table (model in prisma/schema.prisma)
    // findMany = read many rows (SELECT ... WHERE)
    // where = Prisma filter: which rows
    // in = Prisma: the value is one of this list
    // select = Prisma: return only these columns
    items = await prisma.product.findMany({ where: { id: { in: pageIds } }, select: productSummarySelect });
    // .sort = put the items in order (changes the array)
    // => = an arrow function (a short function)
    items.sort((a, b) => pageIds.indexOf(a.id) - pageIds.indexOf(b.id));
  } else {
    // [a, b] = destructuring: take the first and second items of an array
    // await = wait for a Promise (async result) before continuing
    // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
    [total, items] = await prisma.$transaction([
      // prisma.product = the Product table (model in prisma/schema.prisma)
      // count = how many rows match
      // where = Prisma filter: which rows
      prisma.product.count({ where }),
      // prisma.product = the Product table (model in prisma/schema.prisma)
      // findMany = read many rows (SELECT ... WHERE)
      prisma.product.findMany({
        // where = Prisma filter: which rows
        where,
        // orderBy = Prisma: sort order (asc / desc)
        // obj[key] = read the property whose name is stored in key
        // a ? b : c = ternary: if a then b else c
        // .sort = put the items in order (changes the array)
        // === = strictly equal (same value AND same type)
        orderBy: sortOrders[sort === 'relevance' ? 'newest' : sort],
        // skip = Prisma: skip the first N rows (OFFSET, for pages)
        skip,
        // take = Prisma: at most N rows (LIMIT)
        take: query.limit,
        // select = Prisma: return only these columns
        select: productSummarySelect,
      }),
    ]);
  }

  // return = give this value back and stop the function here
  return {
    // .map = make a new array by transforming each item
    items: items.map(toProductSummary),
    page: query.page,
    limit: query.limit,
    total,
    // Math = number helpers (min, max, round, floor, ceil...)
    totalPages: Math.ceil(total / query.limit),
    // .sort = put the items in order (changes the array)
    sort,
    // 'all' = every word matched, 'any' = no product had all the words, showing partial matches.
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    matchMode: search?.mode ?? null,
    // await = wait for a Promise (async result) before continuing
    facets: await getFacets(query, searchIds),
  };
}

// Facets: the counts next to each filter option, e.g. "Nike (3)".
// Each facet ignores ITS OWN filter but applies all the others. So after picking "Nike",
// the brand list still shows Adidas (2), and clicking it switches brand, instead of
// everything else showing (0). Amazon and Flipkart filters work the same way.
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function getFacets(query, searchIds) {
  // const = a name for a value that is never reassigned
  const ratingWhere = buildWhere(query, searchIds, 'rating');
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // ...rest = collect the remaining items/properties
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  const [categoryRows, categories, brandRows, ...ratingCounts] = await prisma.$transaction([
    // prisma.product = the Product table (model in prisma/schema.prisma)
    // groupBy = totals per group (GROUP BY)
    prisma.product.groupBy({
      // by = Prisma groupBy: the columns to group on
      by: ['categoryId'],
      // where = Prisma filter: which rows
      where: buildWhere(query, searchIds, 'category'),
      // _count = Prisma: count rows (or related rows)
      _count: { _all: true },
      // orderBy = Prisma: sort order (asc / desc)
      orderBy: { categoryId: 'asc' },
    }),
    // prisma.category = the Category table (model in prisma/schema.prisma)
    // findMany = read many rows (SELECT ... WHERE)
    // select = Prisma: return only these columns
    // orderBy = Prisma: sort order (asc / desc)
    prisma.category.findMany({ select: { id: true, slug: true, name: true }, orderBy: { name: 'asc' } }),
    // prisma.product = the Product table (model in prisma/schema.prisma)
    // groupBy = totals per group (GROUP BY)
    prisma.product.groupBy({
      // by = Prisma groupBy: the columns to group on
      by: ['brand'],
      // where = Prisma filter: which rows
      // ...x = spread: copy all items/properties of x into here
      // not = Prisma: is not this value
      where: { ...buildWhere(query, searchIds, 'brand'), brand: { not: null } },
      // _count = Prisma: count rows (or related rows)
      _count: { _all: true },
      // orderBy = Prisma: sort order (asc / desc)
      orderBy: { brand: 'asc' },
    }),
    // ...x = spread: copy all items/properties of x into here
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    // prisma.product = the Product table (model in prisma/schema.prisma)
    // count = how many rows match
    // where = Prisma filter: which rows
    // gte = greater than or equal (>=)
    ...[4, 3, 2].map((min) => prisma.product.count({ where: { ...ratingWhere, ratingAvg: { gte: min } } })),
  ]);

  // const = a name for a value that is never reassigned
  // new = create an object from a class (e.g. new Date())
  // Map = key -> value lookup table
  // .map = make a new array by transforming each item
  // => = an arrow function (a short function)
  const countByCategory = new Map(categoryRows.map((r) => [r.categoryId, r._count._all]));
  // return = give this value back and stop the function here
  return {
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    // a ?? b = a, unless a is null/undefined, then b
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, count: countByCategory.get(c.id) ?? 0 })),
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    brands: brandRows.map((r) => ({ value: r.brand, count: r._count._all })),
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    // obj[key] = read the property whose name is stored in key
    ratings: [4, 3, 2].map((min, i) => ({ min, count: ratingCounts[i] })),
  };
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getProductBySlug(slug) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.product = the Product table (model in prisma/schema.prisma)
  // findFirst = read the first row that matches (null if none)
  const product = await prisma.product.findFirst({
    // where = Prisma filter: which rows
    where: { slug, isActive: true },
    // include = Prisma: also load the related rows (a JOIN)
    include: {
      // select = Prisma: return only these columns
      category: { select: { name: true, slug: true } },
      // orderBy = Prisma: sort order (asc / desc)
      variants: { orderBy: { price: 'asc' } },
    },
  });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!product) throw notFound('Product not found');
  // return = give this value back and stop the function here
  return product;
}
