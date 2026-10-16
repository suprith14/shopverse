import type { Request, Response } from 'express';
import type { AuthUser } from '../../middleware/auth.js';
import * as reviewsService from './reviews.service.js';

const userId = (res: Response) => (res.locals.user as AuthUser).id;

export async function listReviews(_req: Request, res: Response) {
  res.json(await reviewsService.listReviews(res.locals.params.productId, res.locals.query));
}

export async function getMyReviewStatus(_req: Request, res: Response) {
  res.json(await reviewsService.getMyReviewStatus(userId(res), res.locals.params.productId));
}

export async function upsertMyReview(_req: Request, res: Response) {
  res.json({ review: await reviewsService.upsertMyReview(userId(res), res.locals.params.productId, res.locals.body) });
}

export async function deleteMyReview(_req: Request, res: Response) {
  await reviewsService.deleteMyReview(userId(res), res.locals.params.productId);
  res.status(204).end();
}
