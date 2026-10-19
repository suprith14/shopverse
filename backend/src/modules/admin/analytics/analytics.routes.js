// import = bring in code from another file or package
// Router = a group of routes mounted under one path (e.g. /api/cart)
import { Router } from 'express';
// import = bring in code from another file or package
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
import { validate } from '../../../middleware/validate.js';
// import = bring in code from another file or package
import { periodQuery, topProductsQuery } from './analytics.schema.js';
// import = bring in code from another file or package
import * as controller from './analytics.controller.js';

// Mounted at /api/admin/analytics (admin only, checked in admin.routes.ts).
// Each dashboard widget has its own endpoint, so widgets load in parallel and one slow query
// doesn't hold up the whole dashboard.
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const adminAnalyticsRouter = Router();

// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminAnalyticsRouter.get('/summary', validate(periodQuery, 'query'), controller.summary);
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminAnalyticsRouter.get('/sales', validate(periodQuery, 'query'), controller.sales);
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminAnalyticsRouter.get('/top-products', validate(topProductsQuery, 'query'), controller.topProducts);
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminAnalyticsRouter.get('/sales-by-category', validate(periodQuery, 'query'), controller.salesByCategory);
// .get(path, ...handlers) = handle GET requests (read) to this path
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
adminAnalyticsRouter.get('/customers', validate(periodQuery, 'query'), controller.customers);
// .get(path, ...handlers) = handle GET requests (read) to this path
adminAnalyticsRouter.get('/orders-by-status', controller.ordersByStatus);
// .get(path, ...handlers) = handle GET requests (read) to this path
adminAnalyticsRouter.get('/low-stock', controller.lowStock);
