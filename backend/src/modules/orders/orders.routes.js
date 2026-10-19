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
import { createOrderSchema, orderIdParams } from './orders.schema.js';
// import = bring in code from another file or package
import * as controller from './orders.controller.js';

// Mounted at /api/orders. Every route needs a logged-in user.
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const ordersRouter = Router();

// .use = add middleware (runs for every request) or mount a router under a path
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
ordersRouter.use(requireAuth);

// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
ordersRouter.post('/', validate(createOrderSchema), controller.checkout);
// .get(path, ...handlers) = handle GET requests (read) to this path
ordersRouter.get('/', controller.listMyOrders);
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
ordersRouter.get('/:id', validate(orderIdParams, 'params'), controller.getMyOrder);
// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
ordersRouter.post('/:id/pay', validate(orderIdParams, 'params'), controller.getPaymentUrl);
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
ordersRouter.get('/:id/invoice', validate(orderIdParams, 'params'), controller.getMyInvoice);
// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
ordersRouter.post('/:id/cancel', validate(orderIdParams, 'params'), controller.cancelMyOrder);
