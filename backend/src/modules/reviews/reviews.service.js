// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
// forbidden = HttpError 403: logged in, but not allowed
// notFound = HttpError 404: doesn't exist
import { forbidden, notFound } from '../../lib/http-error.js';

// Orders in these states mean the customer really paid for the product.
// const = a name for a value that is never reassigned
const PURCHASED_STATUSES = ['PAID', 'SHIPPED', 'DELIVERED'];

// "Demo Customer" -> "Demo C." Public pages show a short name, never the email.
// function = a named, reusable block of code
function displayName(name) {
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // ...rest = collect the remaining items/properties
  // .trim = remove spaces at both ends
  // .split = cut a string into an array
  const [first, ...rest] = name.trim().split(/\s+/);
  // const = a name for a value that is never reassigned
  const last = rest.at(-1);
  // return = give this value back and stop the function here
  // a ? b : c = ternary: if a then b else c
  // `text ${x}` = a template string: text with values inserted
  // .toUpperCase = the text in capital letters
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function assertProductExists(productId) {
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
}

// ------------------------------------------------------------------ Public: read reviews

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
// { a, b } = destructuring: take properties a and b out of an object
export async function listReviews(productId, { page, limit }) {
  // await = wait for a Promise (async result) before continuing
  await assertProductExists(productId);

  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  const [total, rows, byRating, product] = await prisma.$transaction([
    // prisma.review = the Review table (model in prisma/schema.prisma)
    // count = how many rows match
    // where = Prisma filter: which rows
    prisma.review.count({ where: { productId } }),
    // prisma.review = the Review table (model in prisma/schema.prisma)
    // findMany = read many rows (SELECT ... WHERE)
    prisma.review.findMany({
      // where = Prisma filter: which rows
      where: { productId },
      // orderBy = Prisma: sort order (asc / desc)
      orderBy: { createdAt: 'desc' },
      // skip = Prisma: skip the first N rows (OFFSET, for pages)
      skip: (page - 1) * limit,
      // take = Prisma: at most N rows (LIMIT)
      take: limit,
      // include = Prisma: also load the related rows (a JOIN)
      // select = Prisma: return only these columns
      include: { user: { select: { name: true } } },
    }),
    // How many 5-star, 4-star... reviews: the bars in "4.3 out of 5" summaries.
    // prisma.review = the Review table (model in prisma/schema.prisma)
    // groupBy = totals per group (GROUP BY)
    // by = Prisma groupBy: the columns to group on
    // where = Prisma filter: which rows
    // _count = Prisma: count rows (or related rows)
    // orderBy = Prisma: sort order (asc / desc)
    prisma.review.groupBy({ by: ['rating'], where: { productId }, _count: { _all: true }, orderBy: { rating: 'asc' } }),
    // prisma.product = the Product table (model in prisma/schema.prisma)
    // findUniqueOrThrow = like findUnique, but throws if the row is missing
    // where = Prisma filter: which rows
    // select = Prisma: return only these columns
    prisma.product.findUniqueOrThrow({ where: { id: productId }, select: { ratingAvg: true, ratingCount: true } }),
  ]);

  // const = a name for a value that is never reassigned
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  // const = a name for a value that is never reassigned
  // obj[key] = read the property whose name is stored in key
  for (const row of byRating) distribution[row.rating] = row._count._all;

  // return = give this value back and stop the function here
  return {
    ratingAvg: product.ratingAvg,
    ratingCount: product.ratingCount,
    distribution,
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    // { a, b } = destructuring: take properties a and b out of an object
    // ...rest = collect the remaining items/properties
    items: rows.map(({ user, userId: _userId, ...review }) => ({
      // ...x = spread: copy all items/properties of x into here
      ...review,
      author: displayName(user.name),
      verifiedPurchase: true,
    })),
    page,
    // Math = number helpers (min, max, round, floor, ceil...)
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

// ------------------------------------------------------------------ Logged in: my review

// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function hasPurchased(userId, productId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.orderItem = the OrderItem table (model in prisma/schema.prisma)
  // findFirst = read the first row that matches (null if none)
  const item = await prisma.orderItem.findFirst({
    // where = Prisma filter: which rows
    // in = Prisma: the value is one of this list
    // ...x = spread: copy all items/properties of x into here
    where: { variant: { productId }, order: { userId, status: { in: [...PURCHASED_STATUSES] } } },
    // select = Prisma: return only these columns
    select: { id: true },
  });
  // return = give this value back and stop the function here
  // !!x = turn any value into true/false
  // ! = NOT: flips true/false
  return !!item;
}

// Tells the product page what to show: a "Write a review" form, "Edit your review", or why not.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getMyReviewStatus(userId, productId) {
  // await = wait for a Promise (async result) before continuing
  await assertProductExists(productId);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // await = wait for a Promise (async result) before continuing
  // Promise = a value that arrives later; Promise.all waits for several at once
  const [review, purchased] = await Promise.all([
    // prisma.review = the Review table (model in prisma/schema.prisma)
    // findUnique = read one row by a unique field (id, email); null if missing
    // where = Prisma filter: which rows
    prisma.review.findUnique({ where: { userId_productId: { userId, productId } } }),
    hasPurchased(userId, productId),
  ]);
  // return = give this value back and stop the function here
  return {
    canReview: purchased,
    // a ? b : c = ternary: if a then b else c
    reason: purchased ? null : 'Only customers who bought this product can review it.',
    review,
  };
}

// Recalculates the product's stored average and count from its reviews.
// Runs inside the same transaction as the review change, after locking the product row,
// so two people reviewing the same product at the same moment can't overwrite each other's stats.
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function refreshRatingStats(tx, productId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // tx.review = the Review table (model in prisma/schema.prisma)
  // aggregate = sums/averages/counts over rows
  // where = Prisma filter: which rows
  // _avg = Prisma: average of a column
  // _count = Prisma: count rows (or related rows)
  const stats = await tx.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: { _all: true } });
  // await = wait for a Promise (async result) before continuing
  // tx.product = the Product table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  await tx.product.update({
    // where = Prisma filter: which rows
    where: { id: productId },
    // data = Prisma: the values to write
    data: {
      // Math = number helpers (min, max, round, floor, ceil...)
      // a ?? b = a, unless a is null/undefined, then b
      ratingAvg: Math.round((stats._avg.rating ?? 0) * 10) / 10, // 4.333 -> 4.3
      ratingCount: stats._count._all,
    },
  });
}

// Row lock: other transactions that also want to lock this product wait until we commit.
// That makes "change a review + recalculate the average" happen one at a time per product.
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function lockProduct(tx, productId) {
  // await = wait for a Promise (async result) before continuing
  // prisma.$queryRaw = run hand-written SQL (values are escaped safely)
  // `text ${x}` = a template string: text with values inserted
  await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${productId} FOR UPDATE`;
}

// Create or edit: one review per user per product (@@unique([userId, productId])).
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function upsertMyReview(userId, productId, input) {
  // await = wait for a Promise (async result) before continuing
  await assertProductExists(productId);
  // Checked on the server: hiding the form on the frontend is not protection.
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // await = wait for a Promise (async result) before continuing
  if (!(await hasPurchased(userId, productId))) {
    // throw = stop here with an error
    // forbidden = HttpError 403: logged in, but not allowed
    throw forbidden('Only customers who bought this product can review it.');
  }

  // return = give this value back and stop the function here
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  return prisma.$transaction(
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    async (tx) => {
      // await = wait for a Promise (async result) before continuing
      await lockProduct(tx, productId);
      // const = a name for a value that is never reassigned
      // await = wait for a Promise (async result) before continuing
      // tx.review = the Review table (model in prisma/schema.prisma)
      // upsert = update the row if it exists, otherwise create it
      const review = await tx.review.upsert({
        // where = Prisma filter: which rows
        where: { userId_productId: { userId, productId } },
        // ...x = spread: copy all items/properties of x into here
        create: { userId, productId, ...input },
        update: input,
      });
      // await = wait for a Promise (async result) before continuing
      await refreshRatingStats(tx, productId);
      // return = give this value back and stop the function here
      return review;
    },
    { timeout: 15_000 },
  );
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function deleteMyReview(userId, productId) {
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  await prisma.$transaction(
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    async (tx) => {
      // await = wait for a Promise (async result) before continuing
      await lockProduct(tx, productId);
      // const = a name for a value that is never reassigned
      // { a, b } = destructuring: take properties a and b out of an object
      // await = wait for a Promise (async result) before continuing
      // tx.review = the Review table (model in prisma/schema.prisma)
      // deleteMany = remove every row that matches; no error if none
      // where = Prisma filter: which rows
      const { count } = await tx.review.deleteMany({ where: { userId, productId } });
      // if (...) = run the next part only when the condition is true
      // === = strictly equal (same value AND same type)
      // throw = stop here with an error
      // notFound = HttpError 404: doesn't exist
      if (count === 0) throw notFound('You have not reviewed this product');
      // await = wait for a Promise (async result) before continuing
      await refreshRatingStats(tx, productId);
    },
    { timeout: 15_000 },
  );
}
