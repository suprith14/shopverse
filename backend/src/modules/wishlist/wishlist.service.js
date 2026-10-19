// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
// notFound = HttpError 404: doesn't exist
import { notFound } from '../../lib/http-error.js';
// import = bring in code from another file or package
import { productSummarySelect, toProductSummary } from '../catalog/catalog.service.js';

// A wishlist saves PRODUCTS, not variants: you like "Air Stride Runner", and pick the
// size later when you buy. (The cart saves variants because you buy a specific size.)

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getWishlist(userId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.wishlistItem = the WishlistItem table (model in prisma/schema.prisma)
  // findMany = read many rows (SELECT ... WHERE)
  const rows = await prisma.wishlistItem.findMany({
    // Hide products that were taken off the store since they were saved.
    // where = Prisma filter: which rows
    where: { userId, product: { isActive: true } },
    // orderBy = Prisma: sort order (asc / desc)
    orderBy: { createdAt: 'desc' }, // newest saved first
    // include = Prisma: also load the related rows (a JOIN)
    // select = Prisma: return only these columns
    include: { product: { select: productSummarySelect } },
  });
  // return = give this value back and stop the function here
  // .map = make a new array by transforming each item
  // => = an arrow function (a short function)
  return rows.map((row) => ({ addedAt: row.createdAt, product: toProductSummary(row.product) }));
}

// Idempotent: saving a product that's already saved does nothing and doesn't fail.
// So a double-click, or a retried request after a network blip, is harmless.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function addProduct(userId, productId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.product = the Product table (model in prisma/schema.prisma)
  // findFirst = read the first row that matches (null if none)
  // where = Prisma filter: which rows
  // select = Prisma: return only these columns
  const product = await prisma.product.findFirst({ where: { id: productId, isActive: true }, select: { id: true } });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!product) throw notFound('Product not found');

  // await = wait for a Promise (async result) before continuing
  // prisma.wishlistItem = the WishlistItem table (model in prisma/schema.prisma)
  // upsert = update the row if it exists, otherwise create it
  await prisma.wishlistItem.upsert({
    // where = Prisma filter: which rows
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {}, // already saved: nothing to change
  });
  // return = give this value back and stop the function here
  return getWishlist(userId);
}

// Also idempotent: removing something that isn't saved is not an error.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function removeProduct(userId, productId) {
  // await = wait for a Promise (async result) before continuing
  // prisma.wishlistItem = the WishlistItem table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  // where = Prisma filter: which rows
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  // return = give this value back and stop the function here
  return getWishlist(userId);
}
