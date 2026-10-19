import { Router } from 'express';
import { validate } from '../../../middleware/validate.js';
import { blockSchema, idParams, listCustomersQuery } from './customers.schema.js';
import * as controller from './customers.controller.js';

// Mounted at /api/admin/customers (admin only, checked in admin.routes.js)
export const adminCustomersRouter = Router();

adminCustomersRouter.get('/', validate(listCustomersQuery, 'query'), controller.listCustomers);
adminCustomersRouter.post('/:id/block', validate(idParams, 'params'), validate(blockSchema), controller.blockCustomer);
adminCustomersRouter.post('/:id/unblock', validate(idParams, 'params'), controller.unblockCustomer);
adminCustomersRouter.delete('/:id', validate(idParams, 'params'), controller.deleteCustomer);
