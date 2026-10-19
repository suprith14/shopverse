import * as reviewsService from './reviews.service.js';

const userId = (res) => res.locals.user.id;

export async function listReviews(_req, res) {
  res.json(await reviewsService.listReviews(res.locals.params.productId, res.locals.query));
}

export async function getMyReviewStatus(_req, res) {
  res.json(await reviewsService.getMyReviewStatus(userId(res), res.locals.params.productId));
}

export async function upsertMyReview(_req, res) {
  res.json({ review: await reviewsService.upsertMyReview(userId(res), res.locals.params.productId, res.locals.body) });
}

export async function deleteMyReview(_req, res) {
  await reviewsService.deleteMyReview(userId(res), res.locals.params.productId);
  res.status(204).end();
}
