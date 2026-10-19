// import = bring in code from another file or package
// Router = a group of routes mounted under one path (e.g. /api/cart)
import { Router } from 'express';
// import = bring in code from another file or package
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
import { validate } from '../../middleware/validate.js';
// import = bring in code from another file or package
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
import { requireAuth } from '../../middleware/auth.js';
// import = bring in code from another file or package
import { listReviewsQuery, productIdParams, reviewSchema } from './reviews.schema.js';
// import = bring in code from another file or package
import * as controller from './reviews.controller.js';

// Mounted at /api/reviews
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const reviewsRouter = Router();

// const = a name for a value that is never reassigned
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
const params = validate(productIdParams, 'params');

// Public: anyone can read reviews.
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
reviewsRouter.get('/product/:productId', params, validate(listReviewsQuery, 'query'), controller.listReviews);

// Logged in: my review for this product (status, create/edit, delete).
// .get(path, ...handlers) = handle GET requests (read) to this path
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
reviewsRouter.get('/product/:productId/mine', requireAuth, params, controller.getMyReviewStatus);
// .put(path, ...) = handle PUT requests (set to this value; repeat-safe)
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
reviewsRouter.put('/product/:productId/mine', requireAuth, params, validate(reviewSchema), controller.upsertMyReview);
// .delete(path, ...) = handle DELETE requests (remove)
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
reviewsRouter.delete('/product/:productId/mine', requireAuth, params, controller.deleteMyReview);
