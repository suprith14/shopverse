// import = bring in code from another file or package
// Router = a group of routes mounted under one path (e.g. /api/cart)
import { Router } from 'express';
// import = bring in code from another file or package
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
import { validate } from '../../middleware/validate.js';
// import = bring in code from another file or package
import { listProductsQuery, productSlugParams, suggestQuery } from './catalog.schema.js';
// import = bring in code from another file or package
import * as controller from './catalog.controller.js';

// Mounted at /api/catalog. All public: no login needed to browse.
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const catalogRouter = Router();

// .get(path, ...handlers) = handle GET requests (read) to this path
catalogRouter.get('/categories', controller.listCategories);
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
catalogRouter.get('/products', validate(listProductsQuery, 'query'), controller.listProducts);
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
catalogRouter.get('/suggest', validate(suggestQuery, 'query'), controller.suggestions);
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
catalogRouter.get('/products/:slug', validate(productSlugParams, 'params'), controller.getProduct);
