// import = bring in code from another file or package
// Router = a group of routes mounted under one path (e.g. /api/cart)
import { Router } from 'express';
// import = bring in code from another file or package
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
import { validate } from '../../../middleware/validate.js';
// import = bring in code from another file or package
import {
  createProductSchema,
  idParams,
  listAdminProductsQuery,
  stockAdjustmentSchema,
  updateProductSchema,
  updateVariantSchema,
  variantIdParams,
  variantSchema,
} from './products.schema.js';
// import = bring in code from another file or package
import * as controller from './products.controller.js';

// Mounted at /api/admin/products (admin only, checked in admin.routes.ts)
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const adminProductsRouter = Router();

// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminProductsRouter.get('/', validate(listAdminProductsQuery, 'query'), controller.listProducts);
// .get(path, ...handlers) = handle GET requests (read) to this path
adminProductsRouter.get('/categories', controller.listCategories);
// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminProductsRouter.post('/', validate(createProductSchema), controller.createProduct);
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminProductsRouter.get('/:id', validate(idParams, 'params'), controller.getProduct);
// .patch(path, ...) = handle PATCH requests (change some fields)
adminProductsRouter.patch(
  '/:id',
  // validate(schema, part) = check req.body/query/params with Zod; result in res.locals
  validate(idParams, 'params'),
  // validate(schema, part) = check req.body/query/params with Zod; result in res.locals
  validate(updateProductSchema),
  controller.updateProduct,
);

// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminProductsRouter.post('/:id/variants', validate(idParams, 'params'), validate(variantSchema), controller.addVariant);
// .patch(path, ...) = handle PATCH requests (change some fields)
adminProductsRouter.patch(
  '/variants/:variantId',
  // validate(schema, part) = check req.body/query/params with Zod; result in res.locals
  validate(variantIdParams, 'params'),
  // validate(schema, part) = check req.body/query/params with Zod; result in res.locals
  validate(updateVariantSchema),
  controller.updateVariant,
);
// .delete(path, ...) = handle DELETE requests (remove)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminProductsRouter.delete('/variants/:variantId', validate(variantIdParams, 'params'), controller.deleteVariant);
// .post(path, ...) = handle POST requests (create / do something)
adminProductsRouter.post(
  '/variants/:variantId/stock',
  // validate(schema, part) = check req.body/query/params with Zod; result in res.locals
  validate(variantIdParams, 'params'),
  // validate(schema, part) = check req.body/query/params with Zod; result in res.locals
  validate(stockAdjustmentSchema),
  controller.adjustStock,
);
