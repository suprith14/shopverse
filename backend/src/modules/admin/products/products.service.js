// import = bring in code from another file or package
import { Prisma } from '@prisma/client';
// import = bring in code from another file or package
import { prisma } from '../../../lib/prisma.js';
// import = bring in code from another file or package
// badRequest = HttpError 400: the request is invalid
// conflict = HttpError 409: clashes with existing data (e.g. email taken)
// notFound = HttpError 404: doesn't exist
import { badRequest, conflict, notFound } from '../../../lib/http-error.js';

// A variant at or below this stock shows up as "low stock".
// export = other files can import this
// const = a name for a value that is never reassigned
export const LOW_STOCK_THRESHOLD = 5;

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const slugify = (s) =>
  s
    // .toLowerCase = the text in small letters
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// "Air Stride Runner" -> "air-stride-runner", or "air-stride-runner-2" if that's taken.
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function uniqueSlug(name) {
  // const = a name for a value that is never reassigned
  // a || b = OR: a if it is truthy, else b
  const base = slugify(name) || 'product';
  // let = a name whose value can be changed later
  for (let n = 1; ; n++) {
    // const = a name for a value that is never reassigned
    // a ? b : c = ternary: if a then b else c
    // === = strictly equal (same value AND same type)
    // `text ${x}` = a template string: text with values inserted
    const slug = n === 1 ? base : `${base}-${n}`;
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // await = wait for a Promise (async result) before continuing
    // prisma.product = the Product table (model in prisma/schema.prisma)
    // findUnique = read one row by a unique field (id, email); null if missing
    // where = Prisma filter: which rows
    // select = Prisma: return only these columns
    // return = give this value back and stop the function here
    if (!(await prisma.product.findUnique({ where: { slug }, select: { id: true } }))) return slug;
  }
}

// Product.basePrice = cheapest variant price. It's stored (denormalised) so the shop can
// filter and sort by price cheaply, so it must be recalculated whenever a variant price changes.
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function refreshBasePrice(tx, productId) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // await = wait for a Promise (async result) before continuing
  // tx.productVariant = the ProductVariant table (model in prisma/schema.prisma)
  // aggregate = sums/averages/counts over rows
  // where = Prisma filter: which rows
  const { _min } = await tx.productVariant.aggregate({ where: { productId }, _min: { price: true } });
  // await = wait for a Promise (async result) before continuing
  // tx.product = the Product table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  // where = Prisma filter: which rows
  // data = Prisma: the values to write
  // a ?? b = a, unless a is null/undefined, then b
  await tx.product.update({ where: { id: productId }, data: { basePrice: _min.price ?? 0 } });
}

// SKUs are unique across the whole store. Turn the database's error into a clear message.
// function = a named, reusable block of code
function rethrowSkuConflict(err) {
  // if (...) = run the next part only when the condition is true
  // a && b = AND; in JSX: show b only when a is true
  // === = strictly equal (same value AND same type)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    // throw = stop here with an error
    // conflict = HttpError 409: clashes with existing data (e.g. email taken)
    throw conflict('A variant with this SKU already exists');
  }
  // throw = stop here with an error
  throw err;
}

// const = a name for a value that is never reassigned
const adminProductInclude = {
  // select = Prisma: return only these columns
  category: { select: { id: true, name: true, slug: true } },
  // orderBy = Prisma: sort order (asc / desc)
  variants: { orderBy: { price: 'asc' } },
};

// ------------------------------------------------------------------ Read

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function listProducts(query) {
  // const = a name for a value that is never reassigned
  const where = {
    // Unlike the shop, admins also see hidden products.
    // ...x = spread: copy all items/properties of x into here
    // === = strictly equal (same value AND same type)
    // a && b = AND; in JSX: show b only when a is true
    ...(query.status === 'active' && { isActive: true }),
    // ...x = spread: copy all items/properties of x into here
    // === = strictly equal (same value AND same type)
    // a && b = AND; in JSX: show b only when a is true
    ...(query.status === 'hidden' && { isActive: false }),
    // ...x = spread: copy all items/properties of x into here
    // a && b = AND; in JSX: show b only when a is true
    ...(query.category && { category: { slug: query.category } }),
    // ...x = spread: copy all items/properties of x into here
    // a && b = AND; in JSX: show b only when a is true
    // some = Prisma: at least one related row matches
    // lte = less than or equal (<=)
    ...(query.lowStock && { variants: { some: { stock: { lte: LOW_STOCK_THRESHOLD } } } }),
    // ...x = spread: copy all items/properties of x into here
    // a && b = AND; in JSX: show b only when a is true
    ...(query.q && {
      // OR = Prisma: any of these conditions
      OR: [
        // contains = Prisma: text includes this (SQL LIKE %x%)
        // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
        { name: { contains: query.q, mode: 'insensitive' } },
        // contains = Prisma: text includes this (SQL LIKE %x%)
        // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
        { brand: { contains: query.q, mode: 'insensitive' } },
        // some = Prisma: at least one related row matches
        // contains = Prisma: text includes this (SQL LIKE %x%)
        // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
        { variants: { some: { sku: { contains: query.q, mode: 'insensitive' } } } },
      ],
    }),
  };

  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  const [total, products] = await prisma.$transaction([
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
      orderBy: { updatedAt: 'desc' }, // recently edited first
      // skip = Prisma: skip the first N rows (OFFSET, for pages)
      skip: (query.page - 1) * query.limit,
      // take = Prisma: at most N rows (LIMIT)
      take: query.limit,
      // include = Prisma: also load the related rows (a JOIN)
      include: adminProductInclude,
    }),
  ]);

  // return = give this value back and stop the function here
  return {
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    items: products.map((p) => ({
      // ...x = spread: copy all items/properties of x into here
      ...p,
      // .reduce = combine all items into one value (e.g. a sum)
      // => = an arrow function (a short function)
      totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
      // .some = true if at least one item passes the test
      // => = an arrow function (a short function)
      lowStock: p.variants.some((v) => v.stock <= LOW_STOCK_THRESHOLD),
    })),
    page: query.page,
    limit: query.limit,
    total,
    // Math = number helpers (min, max, round, floor, ceil...)
    totalPages: Math.ceil(total / query.limit),
  };
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getProduct(id) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.product = the Product table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  // include = Prisma: also load the related rows (a JOIN)
  const product = await prisma.product.findUnique({ where: { id }, include: adminProductInclude });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!product) throw notFound('Product not found');
  // return = give this value back and stop the function here
  return product;
}

// ------------------------------------------------------------------ Create / edit products

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
// { a, b } = destructuring: take properties a and b out of an object
// ...rest = collect the remaining items/properties
export async function createProduct({ variants, ...input }) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.category = the Category table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  // select = Prisma: return only these columns
  const category = await prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (!category) throw badRequest('Category not found');

  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // prisma.product = the Product table (model in prisma/schema.prisma)
    // create = insert one new row (INSERT)
    const product = await prisma.product.create({
      // data = Prisma: the values to write
      data: {
        // ...x = spread: copy all items/properties of x into here
        ...input,
        attributes: input.attributes,
        // await = wait for a Promise (async result) before continuing
        slug: await uniqueSlug(input.name),
        // Math = number helpers (min, max, round, floor, ceil...)
        // ...x = spread: copy all items/properties of x into here
        // .map = make a new array by transforming each item
        // => = an arrow function (a short function)
        basePrice: Math.min(...variants.map((v) => v.price)),
        variants: { create: variants },
      },
      // include = Prisma: also load the related rows (a JOIN)
      include: adminProductInclude,
    });
    // return = give this value back and stop the function here
    return product;
  } catch (err) {
    rethrowSkuConflict(err);
  }
}

// The slug is NOT changed when the name changes: links customers shared, bookmarks and
// Google results would all break. (Big stores keep old URLs working with redirects.)
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function updateProduct(id, input) {
  // await = wait for a Promise (async result) before continuing
  await getProduct(id);
  // if (...) = run the next part only when the condition is true
  if (input.categoryId) {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // prisma.category = the Category table (model in prisma/schema.prisma)
    // findUnique = read one row by a unique field (id, email); null if missing
    // where = Prisma filter: which rows
    // select = Prisma: return only these columns
    const category = await prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // throw = stop here with an error
    // badRequest = HttpError 400: the request is invalid
    if (!category) throw badRequest('Category not found');
  }
  // return = give this value back and stop the function here
  // prisma.product = the Product table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  return prisma.product.update({
    // where = Prisma filter: which rows
    where: { id },
    // data = Prisma: the values to write
    // ...x = spread: copy all items/properties of x into here
    data: { ...input, attributes: input.attributes },
    // include = Prisma: also load the related rows (a JOIN)
    include: adminProductInclude,
  });
}

// There's no "delete product": past orders point at its variants, and order history must
// stay intact. Admins HIDE products instead (isActive = false): gone from the shop, kept in the
// database. This is called a "soft delete". Use updateProduct({ isActive: false }).

// ------------------------------------------------------------------ Variants

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function addVariant(productId, input) {
  // await = wait for a Promise (async result) before continuing
  await getProduct(productId);
  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // await = wait for a Promise (async result) before continuing
    // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    await prisma.$transaction(async (tx) => {
      // await = wait for a Promise (async result) before continuing
      // tx.productVariant = the ProductVariant table (model in prisma/schema.prisma)
      // create = insert one new row (INSERT)
      // data = Prisma: the values to write
      // ...x = spread: copy all items/properties of x into here
      await tx.productVariant.create({ data: { ...input, productId } });
      // await = wait for a Promise (async result) before continuing
      await refreshBasePrice(tx, productId);
    });
  } catch (err) {
    rethrowSkuConflict(err);
  }
  // return = give this value back and stop the function here
  return getProduct(productId);
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function updateVariant(variantId, input) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.productVariant = the ProductVariant table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  // select = Prisma: return only these columns
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, select: { productId: true } });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!variant) throw notFound('Variant not found');

  // Changing the price here does NOT change past orders: they keep their snapshot price.
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  await prisma.$transaction(async (tx) => {
    // await = wait for a Promise (async result) before continuing
    // tx.productVariant = the ProductVariant table (model in prisma/schema.prisma)
    // update = change one row found by a unique field (UPDATE)
    // where = Prisma filter: which rows
    // data = Prisma: the values to write
    await tx.productVariant.update({ where: { id: variantId }, data: input });
    // await = wait for a Promise (async result) before continuing
    await refreshBasePrice(tx, variant.productId);
  });
  // return = give this value back and stop the function here
  return getProduct(variant.productId);
}

// Only variants that were never ordered can be deleted (order history points at them).
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function deleteVariant(variantId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.productVariant = the ProductVariant table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  const variant = await prisma.productVariant.findUnique({
    // where = Prisma filter: which rows
    where: { id: variantId },
    // select = Prisma: return only these columns
    // _count = Prisma: count rows (or related rows)
    select: { productId: true, _count: { select: { orderItems: true } } },
  });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!variant) throw notFound('Variant not found');
  // if (...) = run the next part only when the condition is true
  if (variant._count.orderItems > 0) {
    // throw = stop here with an error
    // conflict = HttpError 409: clashes with existing data (e.g. email taken)
    throw conflict("This variant has been ordered before, so it can't be deleted. Set its stock to 0 instead.");
  }
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.productVariant = the ProductVariant table (model in prisma/schema.prisma)
  // count = how many rows match
  // where = Prisma filter: which rows
  const siblings = await prisma.productVariant.count({ where: { productId: variant.productId } });
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (siblings === 1) throw badRequest('A product needs at least one variant. Hide the product instead.');

  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  await prisma.$transaction(async (tx) => {
    // await = wait for a Promise (async result) before continuing
    // tx.productVariant = the ProductVariant table (model in prisma/schema.prisma)
    // delete = remove one row by a unique field (DELETE)
    // where = Prisma filter: which rows
    await tx.productVariant.delete({ where: { id: variantId } }); // also removes it from carts (cascade)
    // await = wait for a Promise (async result) before continuing
    await refreshBasePrice(tx, variant.productId);
  });
  // return = give this value back and stop the function here
  return getProduct(variant.productId);
}

// "Received 10 more" (+10) or "2 were damaged" (-2).
// Atomic like checkout: the database adds to whatever stock is at that instant, and a
// decrease only happens if enough stock is left. So an admin restocking at the same moment
// a customer checks out can't lose or invent units.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function adjustStock(variantId, delta) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // await = wait for a Promise (async result) before continuing
  // prisma.productVariant = the ProductVariant table (model in prisma/schema.prisma)
  // updateMany = change every row that matches; returns { count }
  const { count } = await prisma.productVariant.updateMany({
    // where = Prisma filter: which rows
    // ...x = spread: copy all items/properties of x into here
    // a && b = AND; in JSX: show b only when a is true
    // gte = greater than or equal (>=)
    where: { id: variantId, ...(delta < 0 && { stock: { gte: -delta } }) },
    // data = Prisma: the values to write
    // increment = Prisma: add to the number in the database (safe with many users)
    data: { stock: { increment: delta } },
  });
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  if (count === 0) {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // prisma.productVariant = the ProductVariant table (model in prisma/schema.prisma)
    // findUnique = read one row by a unique field (id, email); null if missing
    // where = Prisma filter: which rows
    // select = Prisma: return only these columns
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, select: { stock: true } });
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // throw = stop here with an error
    // notFound = HttpError 404: doesn't exist
    if (!variant) throw notFound('Variant not found');
    // throw = stop here with an error
    // badRequest = HttpError 400: the request is invalid
    // `text ${x}` = a template string: text with values inserted
    throw badRequest(`Can't remove ${-delta}: only ${variant.stock} in stock`);
  }
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.productVariant = the ProductVariant table (model in prisma/schema.prisma)
  // findUniqueOrThrow = like findUnique, but throws if the row is missing
  const variant = await prisma.productVariant.findUniqueOrThrow({
    // where = Prisma filter: which rows
    where: { id: variantId },
    // select = Prisma: return only these columns
    select: { productId: true },
  });
  // return = give this value back and stop the function here
  return getProduct(variant.productId);
}

// export = other files can import this
// function = a named, reusable block of code
export function listCategories() {
  // return = give this value back and stop the function here
  // prisma.category = the Category table (model in prisma/schema.prisma)
  // findMany = read many rows (SELECT ... WHERE)
  // orderBy = Prisma: sort order (asc / desc)
  // select = Prisma: return only these columns
  return prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } });
}
