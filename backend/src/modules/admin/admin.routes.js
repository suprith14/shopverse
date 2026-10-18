import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { adminProductsRouter } from './products/products.routes.js';
import { adminOrdersRouter } from './orders/orders.routes.js';
import { adminAnalyticsRouter } from './analytics/analytics.routes.js';
import { adminCustomersRouter } from './customers/customers.routes.js';

// Mounted at /api/admin. Everything an admin can do lives in this folder.
//
// The role check happens ONCE, here, before any admin route runs. A new admin route added
// later is protected automatically: nobody has to remember to add the check.
//   no / bad token   -> 401
//   logged in, not ADMIN -> 403
export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('ADMIN'));

adminRouter.use('/products', adminProductsRouter);
adminRouter.use('/orders', adminOrdersRouter);
adminRouter.use('/analytics', adminAnalyticsRouter);
adminRouter.use('/customers', adminCustomersRouter);
