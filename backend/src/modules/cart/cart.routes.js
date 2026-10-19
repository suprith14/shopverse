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
import { addItemSchema, updateItemSchema, variantIdParams } from './cart.schema.js';
// import = bring in code from another file or package
import * as controller from './cart.controller.js';

// Mounted at /api/cart. Every route needs a logged-in user.
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const cartRouter = Router();

// .use = add middleware (runs for every request) or mount a router under a path
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
cartRouter.use(requireAuth);

// .get(path, ...handlers) = handle GET requests (read) to this path
cartRouter.get('/', controller.getCart);
// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
cartRouter.post('/items', validate(addItemSchema), controller.addItem);
// .patch(path, ...) = handle PATCH requests (change some fields)
cartRouter.patch(
  '/items/:variantId',
  // validate(schema, part) = check req.body/query/params with Zod; result in res.locals
  validate(variantIdParams, 'params'),
  // validate(schema, part) = check req.body/query/params with Zod; result in res.locals
  validate(updateItemSchema),
  controller.updateItem,
);
// .delete(path, ...) = handle DELETE requests (remove)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
cartRouter.delete('/items/:variantId', validate(variantIdParams, 'params'), controller.removeItem);
// .delete(path, ...) = handle DELETE requests (remove)
cartRouter.delete('/', controller.clearCart);
