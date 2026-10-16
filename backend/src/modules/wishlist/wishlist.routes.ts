import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { productIdParams } from './wishlist.schema.js';
import * as controller from './wishlist.controller.js';

// Mounted at /api/wishlist. Every route needs a logged-in user.
// PUT (not POST) for adding: PUT means "make it so", and doing it twice has the same result.
export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

wishlistRouter.get('/', controller.getWishlist);
wishlistRouter.put('/:productId', validate(productIdParams, 'params'), controller.addProduct);
wishlistRouter.delete('/:productId', validate(productIdParams, 'params'), controller.removeProduct);
