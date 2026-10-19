import { prisma } from '../../lib/prisma.js';
import { forbidden, notFound } from '../../lib/http-error.js';

// Orders in these states mean the customer really paid for the product.
const PURCHASED_STATUSES = ['PAID', 'SHIPPED', 'DELIVERED'];

// "Demo Customer" -> "Demo C." Public pages show a short name, never the email.
function displayName(name) {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

async function assertProductExists(productId) {
  const product = await prisma.product.findFirst({ where: { id: productId, isActive: true }, select: { id: true } });
  if (!product) throw notFound('Product not found');
}

// ------------------------------------------------------------------ Public: read reviews

export async function listReviews(productId, { page, limit }) {
  await assertProductExists(productId);

  const [total, rows, byRating, product] = await prisma.$transaction([
    prisma.review.count({ where: { productId } }),
    prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { name: true } } },
    }),
    // How many 5-star, 4-star... reviews: the bars in "4.3 out of 5" summaries.
    prisma.review.groupBy({ by: ['rating'], where: { productId }, _count: { _all: true }, orderBy: { rating: 'asc' } }),
    prisma.product.findUniqueOrThrow({ where: { id: productId }, select: { ratingAvg: true, ratingCount: true } }),
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of byRating) distribution[row.rating] = row._count._all;

  return {
    ratingAvg: product.ratingAvg,
    ratingCount: product.ratingCount,
    distribution,
    items: rows.map(({ user, userId: _userId, ...review }) => ({
      ...review,
      author: displayName(user.name),
      verifiedPurchase: true,
    })),
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

// ------------------------------------------------------------------ Logged in: my review

async function hasPurchased(userId, productId) {
  const item = await prisma.orderItem.findFirst({
    where: { variant: { productId }, order: { userId, status: { in: [...PURCHASED_STATUSES] } } },
    select: { id: true },
  });
  return !!item;
}

// Tells the product page what to show: a "Write a review" form, "Edit your review", or why not.
export async function getMyReviewStatus(userId, productId) {
  await assertProductExists(productId);
  const [review, purchased] = await Promise.all([
    prisma.review.findUnique({ where: { userId_productId: { userId, productId } } }),
    hasPurchased(userId, productId),
  ]);
  return {
    canReview: purchased,
    reason: purchased ? null : 'Only customers who bought this product can review it.',
    review,
  };
}

// Recalculates the product's stored average and count from its reviews.
// Runs inside the same transaction as the review change, after locking the product row,
// so two people reviewing the same product at the same moment can't overwrite each other's stats.
async function refreshRatingStats(tx, productId) {
  const stats = await tx.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: { _all: true } });
  await tx.product.update({
    where: { id: productId },
    data: {
      ratingAvg: Math.round((stats._avg.rating ?? 0) * 10) / 10, // 4.333 -> 4.3
      ratingCount: stats._count._all,
    },
  });
}

// Row lock: other transactions that also want to lock this product wait until we commit.
// That makes "change a review + recalculate the average" happen one at a time per product.
async function lockProduct(tx, productId) {
  await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${productId} FOR UPDATE`;
}

// Create or edit: one review per user per product (@@unique([userId, productId])).
export async function upsertMyReview(userId, productId, input) {
  await assertProductExists(productId);
  // Checked on the server: hiding the form on the frontend is not protection.
  if (!(await hasPurchased(userId, productId))) {
    throw forbidden('Only customers who bought this product can review it.');
  }

  return prisma.$transaction(
    async (tx) => {
      await lockProduct(tx, productId);
      const review = await tx.review.upsert({
        where: { userId_productId: { userId, productId } },
        create: { userId, productId, ...input },
        update: input,
      });
      await refreshRatingStats(tx, productId);
      return review;
    },
    { timeout: 15_000 },
  );
}

export async function deleteMyReview(userId, productId) {
  await prisma.$transaction(
    async (tx) => {
      await lockProduct(tx, productId);
      const { count } = await tx.review.deleteMany({ where: { userId, productId } });
      if (count === 0) throw notFound('You have not reviewed this product');
      await refreshRatingStats(tx, productId);
    },
    { timeout: 15_000 },
  );
}
