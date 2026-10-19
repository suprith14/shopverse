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
import { couponCodeQuery } from './coupons.schema.js';
// import = bring in code from another file or package
import * as controller from './coupons.controller.js';

// Mounted at /api/coupons. Needs login because the discount is calculated on the user's cart.
// GET, because a preview only reads data and changes nothing.
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const couponsRouter = Router();

// .get(path, ...handlers) = handle GET requests (read) to this path
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
couponsRouter.get('/preview', requireAuth, validate(couponCodeQuery, 'query'), controller.previewCoupon);
