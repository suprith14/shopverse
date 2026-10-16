import { Router } from 'express';
import { validate } from '../../../middleware/validate.js';
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
import * as controller from './products.controller.js';

// Mounted at /api/admin/products (admin only, checked in admin.routes.ts)
export const adminProductsRouter = Router();

adminProductsRouter.get('/', validate(listAdminProductsQuery, 'query'), controller.listProducts);
adminProductsRouter.get('/categories', controller.listCategories);
adminProductsRouter.post('/', validate(createProductSchema), controller.createProduct);
adminProductsRouter.get('/:id', validate(idParams, 'params'), controller.getProduct);
adminProductsRouter.patch('/:id', validate(idParams, 'params'), validate(updateProductSchema), controller.updateProduct);

adminProductsRouter.post('/:id/variants', validate(idParams, 'params'), validate(variantSchema), controller.addVariant);
adminProductsRouter.patch('/variants/:variantId', validate(variantIdParams, 'params'), validate(updateVariantSchema), controller.updateVariant);
adminProductsRouter.delete('/variants/:variantId', validate(variantIdParams, 'params'), controller.deleteVariant);
adminProductsRouter.post('/variants/:variantId/stock', validate(variantIdParams, 'params'), validate(stockAdjustmentSchema), controller.adjustStock);
