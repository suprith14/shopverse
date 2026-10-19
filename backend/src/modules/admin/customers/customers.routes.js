// import = bring in code from another file or package
// Router = a group of routes mounted under one path (e.g. /api/cart)
import { Router } from 'express';
// import = bring in code from another file or package
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
import { validate } from '../../../middleware/validate.js';
// import = bring in code from another file or package
import { blockSchema, idParams, listCustomersQuery } from './customers.schema.js';
// import = bring in code from another file or package
import * as controller from './customers.controller.js';

// Mounted at /api/admin/customers (admin only, checked in admin.routes.js)
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const adminCustomersRouter = Router();

// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminCustomersRouter.get('/', validate(listCustomersQuery, 'query'), controller.listCustomers);
// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminCustomersRouter.post('/:id/block', validate(idParams, 'params'), validate(blockSchema), controller.blockCustomer);
// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminCustomersRouter.post('/:id/unblock', validate(idParams, 'params'), controller.unblockCustomer);
// .delete(path, ...) = handle DELETE requests (remove)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminCustomersRouter.delete('/:id', validate(idParams, 'params'), controller.deleteCustomer);
