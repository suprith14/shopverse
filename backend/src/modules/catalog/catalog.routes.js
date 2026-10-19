import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { listProductsQuery, productSlugParams, suggestQuery } from './catalog.schema.js';
import * as controller from './catalog.controller.js';

// Mounted at /api/catalog. All public: no login needed to browse.
export const catalogRouter = Router();

catalogRouter.get('/categories', controller.listCategories);
catalogRouter.get('/products', validate(listProductsQuery, 'query'), controller.listProducts);
catalogRouter.get('/suggest', validate(suggestQuery, 'query'), controller.suggestions);
catalogRouter.get('/products/:slug', validate(productSlugParams, 'params'), controller.getProduct);
