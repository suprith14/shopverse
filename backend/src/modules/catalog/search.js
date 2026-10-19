// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';

// PostgreSQL full-text search over Product."searchVector" (see migration add_product_search).

// "Running SHOES!!" -> ["running", "shoes"]. Only letters and digits survive, so user input
// can never inject tsquery operators (&, |, !, :*) or break the query.
// function = a named, reusable block of code
function toTerms(text) {
  // return = give this value back and stop the function here
  return (
    text
      // .toLowerCase = the text in small letters
      .toLowerCase()
      // .split = cut a string into an array
      .split(/[^\p{L}\p{N}]+/u)
      // Drop 1-letter words: as a prefix, "c" would match every word starting with c.
      // Numbers are kept ("5" in "galaxy 5" matters).
      // .filter = keep only the items that pass a test
      // => = an arrow function (a short function)
      // a || b = OR: a if it is truthy, else b
      .filter((t) => t.length > 1 || /\d/.test(t))
      // .slice = a copy of part of an array/string
      .slice(0, 8)
  ); // nobody needs more than 8 words; keeps queries cheap
}

// Builds a tsquery string like "running:* & shoes:*".
//  - :* is a PREFIX match, so "runn" already finds "running": results appear while typing.
//  - to_tsquery('english', ...) then stems each word ("running" -> "run", "shoes" -> "shoe"),
//    the same way the product text was stemmed, so the two can match.
// function = a named, reusable block of code
function toTsQuery(terms, operator) {
  // return = give this value back and stop the function here
  // .map = make a new array by transforming each item
  // => = an arrow function (a short function)
  // `text ${x}` = a template string: text with values inserted
  // .join = turn an array into one string with a separator
  return terms.map((t) => `${t}:*`).join(` ${operator} `);
}

// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function rankedMatches(tsquery, limit) {
  // ts_rank scores how well a product matches: more matching words, and matches in the
  // name (weight A) score higher than matches in the description (weight C).
  // return = give this value back and stop the function here
  // prisma.$queryRaw = run hand-written SQL (values are escaped safely)
  // `text ${x}` = a template string: text with values inserted
  return prisma.$queryRaw`
    SELECT p.id, ts_rank(p."searchVector", q) AS rank
    FROM "Product" p, to_tsquery('english', ${tsquery}) q
    WHERE p."isActive" AND p."searchVector" @@ q
    ORDER BY rank DESC, p."createdAt" DESC
    LIMIT ${limit}`;
}

// Products matching the search text, best match first.
// First every word must match ("all"). If that finds nothing, fall back to products matching
// ANY of the words, so a slightly-off search still shows something useful.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
// x = value (in parameters) = the default used when x is not given
export async function searchProducts(text, limit = 1000) {
  // const = a name for a value that is never reassigned
  const terms = toTerms(text);
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  if (terms.length === 0) return null;

  // let = a name whose value can be changed later
  let mode = 'all';
  // let = a name whose value can be changed later
  // await = wait for a Promise (async result) before continuing
  let rows = await rankedMatches(toTsQuery(terms, '&'), limit);
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // a && b = AND; in JSX: show b only when a is true
  if (rows.length === 0 && terms.length > 1) {
    mode = 'any';
    // await = wait for a Promise (async result) before continuing
    rows = await rankedMatches(toTsQuery(terms, '|'), limit);
  }
  // return = give this value back and stop the function here
  // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
  // new = create an object from a class (e.g. new Date())
  // Map = key -> value lookup table
  // .map = make a new array by transforming each item
  // => = an arrow function (a short function)
  return { mode, rank: new Map(rows.map((r) => [r.id, Number(r.rank)])) };
}

// Search-as-you-type suggestions: a few top products plus matching brands and categories.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function suggest(text) {
  // const = a name for a value that is never reassigned
  const terms = toTerms(text);
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  if (terms.length === 0) return { products: [], brands: [], categories: [] };

  // const = a name for a value that is never reassigned
  const lastWord = terms.at(-1);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // await = wait for a Promise (async result) before continuing
  // Promise = a value that arrives later; Promise.all waits for several at once
  const [matches, brands, categories] = await Promise.all([
    searchProducts(text, 5),
    // prisma.product = the Product table (model in prisma/schema.prisma)
    // findMany = read many rows (SELECT ... WHERE)
    prisma.product.findMany({
      // where = Prisma filter: which rows
      // startsWith = Prisma: text begins with this
      // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
      where: { isActive: true, brand: { startsWith: lastWord, mode: 'insensitive' } },
      // distinct = Prisma: drop duplicate rows by these columns
      distinct: ['brand'],
      // select = Prisma: return only these columns
      select: { brand: true },
      // take = Prisma: at most N rows (LIMIT)
      take: 3,
    }),
    // prisma.category = the Category table (model in prisma/schema.prisma)
    // findMany = read many rows (SELECT ... WHERE)
    prisma.category.findMany({
      // where = Prisma filter: which rows
      // startsWith = Prisma: text begins with this
      // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
      where: { name: { startsWith: lastWord, mode: 'insensitive' } },
      // select = Prisma: return only these columns
      select: { name: true, slug: true },
      // take = Prisma: at most N rows (LIMIT)
      take: 3,
    }),
  ]);

  // const = a name for a value that is never reassigned
  // ...x = spread: copy all items/properties of x into here
  // ?.() = call only if the function exists
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // Object.keys = the property names of an object
  // a ?? b = a, unless a is null/undefined, then b
  const ids = [...(matches?.rank.keys() ?? [])];
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.product = the Product table (model in prisma/schema.prisma)
  // findMany = read many rows (SELECT ... WHERE)
  const products = await prisma.product.findMany({
    // where = Prisma filter: which rows
    // in = Prisma: the value is one of this list
    where: { id: { in: ids } },
    // select = Prisma: return only these columns
    select: { id: true, name: true, slug: true, basePrice: true, images: true, brand: true },
  });
  // .sort = put the items in order (changes the array)
  // => = an arrow function (a short function)
  products.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)); // keep relevance order

  // return = give this value back and stop the function here
  return {
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    // { a, b } = destructuring: take properties a and b out of an object
    // ...rest = collect the remaining items/properties
    // ...x = spread: copy all items/properties of x into here
    // a ?? b = a, unless a is null/undefined, then b
    products: products.map(({ images, ...p }) => ({ ...p, image: images[0] ?? null })),
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    brands: brands.map((b) => b.brand),
    categories,
  };
}
