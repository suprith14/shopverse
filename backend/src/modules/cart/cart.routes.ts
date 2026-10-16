import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { addItemSchema, updateItemSchema, variantIdParams } from './cart.schema.js';
import * as controller from './cart.controller.js';

// Mounted at /api/cart. Every route needs a logged-in user.
export const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.get('/', controller.getCart);
cartRouter.post('/items', validate(addItemSchema), controller.addItem);
cartRouter.patch('/items/:variantId', validate(variantIdParams, 'params'), validate(updateItemSchema), controller.updateItem);
cartRouter.delete('/items/:variantId', validate(variantIdParams, 'params'), controller.removeItem);
cartRouter.delete('/', controller.clearCart);
