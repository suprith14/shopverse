import { Router } from 'express';
import { validate } from '../../../middleware/validate.js';
import { idParams, listAdminOrdersQuery, refundSchema, updateStatusSchema } from './orders.schema.js';
import * as controller from './orders.controller.js';

// Mounted at /api/admin/orders (admin only, checked in admin.routes.ts)
export const adminOrdersRouter = Router();

adminOrdersRouter.get('/', validate(listAdminOrdersQuery, 'query'), controller.listOrders);
adminOrdersRouter.get('/:id', validate(idParams, 'params'), controller.getOrder);
adminOrdersRouter.patch('/:id/status', validate(idParams, 'params'), validate(updateStatusSchema), controller.updateStatus);
adminOrdersRouter.post('/:id/refund', validate(idParams, 'params'), validate(refundSchema), controller.refundOrder);
