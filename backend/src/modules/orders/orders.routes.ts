import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { createOrderSchema, orderIdParams } from './orders.schema.js';
import * as controller from './orders.controller.js';

// Mounted at /api/orders. Every route needs a logged-in user.
export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.post('/', validate(createOrderSchema), controller.createOrder);
ordersRouter.get('/', controller.listMyOrders);
ordersRouter.get('/:id', validate(orderIdParams, 'params'), controller.getMyOrder);
ordersRouter.post('/:id/cancel', validate(orderIdParams, 'params'), controller.cancelMyOrder);
