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
import { productIdParams } from './wishlist.schema.js';
// import = bring in code from another file or package
import * as controller from './wishlist.controller.js';

// Mounted at /api/wishlist. Every route needs a logged-in user.
// PUT (not POST) for adding: PUT means "make it so", and doing it twice has the same result.
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const wishlistRouter = Router();

// .use = add middleware (runs for every request) or mount a router under a path
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
wishlistRouter.use(requireAuth);

// .get(path, ...handlers) = handle GET requests (read) to this path
wishlistRouter.get('/', controller.getWishlist);
// .put(path, ...) = handle PUT requests (set to this value; repeat-safe)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
wishlistRouter.put('/:productId', validate(productIdParams, 'params'), controller.addProduct);
// .delete(path, ...) = handle DELETE requests (remove)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
wishlistRouter.delete('/:productId', validate(productIdParams, 'params'), controller.removeProduct);
