import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { listReviewsQuery, productIdParams, reviewSchema } from './reviews.schema.js';
import * as controller from './reviews.controller.js';

// Mounted at /api/reviews
export const reviewsRouter = Router();

const params = validate(productIdParams, 'params');

// Public: anyone can read reviews.
reviewsRouter.get('/product/:productId', params, validate(listReviewsQuery, 'query'), controller.listReviews);

// Logged in: my review for this product (status, create/edit, delete).
reviewsRouter.get('/product/:productId/mine', requireAuth, params, controller.getMyReviewStatus);
reviewsRouter.put('/product/:productId/mine', requireAuth, params, validate(reviewSchema), controller.upsertMyReview);
reviewsRouter.delete('/product/:productId/mine', requireAuth, params, controller.deleteMyReview);
