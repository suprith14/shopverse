// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
// badRequest = HttpError 400: the request is invalid
// notFound = HttpError 404: doesn't exist
import { badRequest, notFound } from '../../lib/http-error.js';
// import = bring in code from another file or package
import { MAX_QUANTITY_PER_ITEM } from './cart.schema.js';

// The cart lives in the database (one CartItem row per user + variant), not in the browser.
// So it follows the user across devices: add on your phone, check out on your laptop.

// Loads the cart with CURRENT prices and stock. Prices are never stored in the cart:
// if a product's price changes, the cart shows the new price (like Amazon/Flipkart do).
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getCart(userId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.cartItem = the CartItem table (model in prisma/schema.prisma)
  // findMany = read many rows (SELECT ... WHERE)
  const rows = await prisma.cartItem.findMany({
    // where = Prisma filter: which rows
    where: { userId },
    // orderBy = Prisma: sort order (asc / desc)
    orderBy: { createdAt: 'asc' },
    // include = Prisma: also load the related rows (a JOIN)
    include: {
      variant: {
        // select = Prisma: return only these columns
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          // select = Prisma: return only these columns
          product: { select: { id: true, name: true, slug: true, brand: true, images: true, isActive: true } },
        },
      },
    },
  });

  // const = a name for a value that is never reassigned
  // .map = make a new array by transforming each item
  // => = an arrow function (a short function)
  const items = rows.map((row) => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    const { variant } = row;
    // Stock may have dropped since the item was added (someone else bought it).
    // We keep the item but flag it, so the user can fix it before checkout.
    // const = a name for a value that is never reassigned
    // a ? b : c = ternary: if a then b else c
    const available = variant.product.isActive ? variant.stock : 0;
    // return = give this value back and stop the function here
    return {
      variantId: variant.id,
      variantName: variant.name,
      productId: variant.product.id,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      brand: variant.product.brand,
      // a ?? b = a, unless a is null/undefined, then b
      image: variant.product.images[0] ?? null,
      unitPrice: variant.price,
      quantity: row.quantity,
      lineTotal: variant.price * row.quantity,
      stock: available,
      // a ? b : c = ternary: if a then b else c
      // === = strictly equal (same value AND same type)
      issue: available === 0 ? 'OUT_OF_STOCK' : row.quantity > available ? 'NOT_ENOUGH_STOCK' : null,
    };
  });

  // return = give this value back and stop the function here
  return {
    items,
    // .reduce = combine all items into one value (e.g. a sum)
    // => = an arrow function (a short function)
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    // Only items that can actually be bought count toward the subtotal.
    // .filter = keep only the items that pass a test
    // => = an arrow function (a short function)
    // ! = NOT: flips true/false
    // .reduce = combine all items into one value (e.g. a sum)
    subtotal: items.filter((i) => !i.issue).reduce((sum, i) => sum + i.lineTotal, 0),
    // .some = true if at least one item passes the test
    // => = an arrow function (a short function)
    hasIssues: items.some((i) => i.issue),
  };
}

// Throws if `quantity` of this variant can't be put in the cart.
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function assertCanBuy(variantId, quantity) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.productVariant = the ProductVariant table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  const variant = await prisma.productVariant.findUnique({
    // where = Prisma filter: which rows
    where: { id: variantId },
    // select = Prisma: return only these columns
    select: { stock: true, product: { select: { isActive: true } } },
  });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // a || b = OR: a if it is truthy, else b
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!variant || !variant.product.isActive) throw notFound('Product not found');
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (variant.stock === 0) throw badRequest('This item is out of stock');
  // if (...) = run the next part only when the condition is true
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  // `text ${x}` = a template string: text with values inserted
  if (quantity > variant.stock) throw badRequest(`Only ${variant.stock} left in stock`);
  // if (...) = run the next part only when the condition is true
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  // `text ${x}` = a template string: text with values inserted
  if (quantity > MAX_QUANTITY_PER_ITEM) throw badRequest(`You can buy at most ${MAX_QUANTITY_PER_ITEM} of this item`);
}

// "Add to cart" on an item already in the cart increases its quantity instead of adding
// a second row. The @@unique([userId, variantId]) rule in the schema guarantees this.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
// { a, b } = destructuring: take properties a and b out of an object
export async function addItem(userId, { variantId, quantity }) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.cartItem = the CartItem table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  const existing = await prisma.cartItem.findUnique({
    // where = Prisma filter: which rows
    where: { userId_variantId: { userId, variantId } },
  });
  // const = a name for a value that is never reassigned
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // a ?? b = a, unless a is null/undefined, then b
  const newQuantity = (existing?.quantity ?? 0) + quantity;
  // await = wait for a Promise (async result) before continuing
  await assertCanBuy(variantId, newQuantity);

  // await = wait for a Promise (async result) before continuing
  // prisma.cartItem = the CartItem table (model in prisma/schema.prisma)
  // upsert = update the row if it exists, otherwise create it
  await prisma.cartItem.upsert({
    // where = Prisma filter: which rows
    where: { userId_variantId: { userId, variantId } },
    create: { userId, variantId, quantity: newQuantity },
    update: { quantity: newQuantity },
  });
  // return = give this value back and stop the function here
  return getCart(userId);
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function updateQuantity(userId, variantId, quantity) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.cartItem = the CartItem table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  const existing = await prisma.cartItem.findUnique({
    // where = Prisma filter: which rows
    where: { userId_variantId: { userId, variantId } },
  });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!existing) throw notFound('Item is not in your cart');
  // await = wait for a Promise (async result) before continuing
  await assertCanBuy(variantId, quantity);

  // await = wait for a Promise (async result) before continuing
  // prisma.cartItem = the CartItem table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  // where = Prisma filter: which rows
  // data = Prisma: the values to write
  await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity } });
  // return = give this value back and stop the function here
  return getCart(userId);
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function removeItem(userId, variantId) {
  // deleteMany doesn't throw if the item is already gone, so removing twice is harmless.
  // await = wait for a Promise (async result) before continuing
  // prisma.cartItem = the CartItem table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  // where = Prisma filter: which rows
  await prisma.cartItem.deleteMany({ where: { userId, variantId } });
  // return = give this value back and stop the function here
  return getCart(userId);
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function clearCart(userId) {
  // await = wait for a Promise (async result) before continuing
  // prisma.cartItem = the CartItem table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  // where = Prisma filter: which rows
  await prisma.cartItem.deleteMany({ where: { userId } });
  // return = give this value back and stop the function here
  return getCart(userId);
}
