import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { couponCodeQuery } from './coupons.schema.js';
import * as controller from './coupons.controller.js';

// Mounted at /api/coupons. Needs login because the discount is calculated on the user's cart.
// GET, because a preview only reads data and changes nothing.
export const couponsRouter = Router();

couponsRouter.get('/preview', requireAuth, validate(couponCodeQuery, 'query'), controller.previewCoupon);
