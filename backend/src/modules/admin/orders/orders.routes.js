// import = bring in code from another file or package
// Router = a group of routes mounted under one path (e.g. /api/cart)
import { Router } from 'express';
// import = bring in code from another file or package
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
import { validate } from '../../../middleware/validate.js';
// import = bring in code from another file or package
import { idParams, listAdminOrdersQuery, refundSchema, updateStatusSchema } from './orders.schema.js';
// import = bring in code from another file or package
import * as controller from './orders.controller.js';

// Mounted at /api/admin/orders (admin only, checked in admin.routes.ts)
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const adminOrdersRouter = Router();

// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminOrdersRouter.get('/', validate(listAdminOrdersQuery, 'query'), controller.listOrders);
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminOrdersRouter.get('/:id', validate(idParams, 'params'), controller.getOrder);
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminOrdersRouter.get('/:id/invoice', validate(idParams, 'params'), controller.getInvoice);
// .patch(path, ...) = handle PATCH requests (change some fields)
adminOrdersRouter.patch(
  '/:id/status',
  // validate(schema, part) = check req.body/query/params with Zod; result in res.locals
  validate(idParams, 'params'),
  // validate(schema, part) = check req.body/query/params with Zod; result in res.locals
  validate(updateStatusSchema),
  controller.updateStatus,
);
// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminOrdersRouter.post('/:id/refund', validate(idParams, 'params'), validate(refundSchema), controller.refundOrder);
