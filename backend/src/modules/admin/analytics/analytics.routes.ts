import { Router } from 'express';
import { validate } from '../../../middleware/validate.js';
import { periodQuery, topProductsQuery } from './analytics.schema.js';
import * as controller from './analytics.controller.js';

// Mounted at /api/admin/analytics (admin only, checked in admin.routes.ts).
// Each dashboard widget has its own endpoint, so widgets load in parallel and one slow query
// doesn't hold up the whole dashboard.
export const adminAnalyticsRouter = Router();

adminAnalyticsRouter.get('/summary', validate(periodQuery, 'query'), controller.summary);
adminAnalyticsRouter.get('/sales', validate(periodQuery, 'query'), controller.sales);
adminAnalyticsRouter.get('/top-products', validate(topProductsQuery, 'query'), controller.topProducts);
adminAnalyticsRouter.get('/sales-by-category', validate(periodQuery, 'query'), controller.salesByCategory);
adminAnalyticsRouter.get('/orders-by-status', controller.ordersByStatus);
adminAnalyticsRouter.get('/low-stock', controller.lowStock);
