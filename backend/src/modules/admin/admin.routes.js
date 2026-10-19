// import = bring in code from another file or package
// Router = a group of routes mounted under one path (e.g. /api/cart)
import { Router } from 'express';
// import = bring in code from another file or package
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
// requireRole = middleware: the user must have this role (e.g. ADMIN)
import { requireAuth, requireRole } from '../../middleware/auth.js';
// import = bring in code from another file or package
import { adminProductsRouter } from './products/products.routes.js';
// import = bring in code from another file or package
import { adminOrdersRouter } from './orders/orders.routes.js';
// import = bring in code from another file or package
import { adminAnalyticsRouter } from './analytics/analytics.routes.js';
// import = bring in code from another file or package
import { adminCustomersRouter } from './customers/customers.routes.js';

// Mounted at /api/admin. Everything an admin can do lives in this folder.
//
// The role check happens ONCE, here, before any admin route runs. A new admin route added
// later is protected automatically: nobody has to remember to add the check.
//   no / bad token   -> 401
//   logged in, not ADMIN -> 403
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const adminRouter = Router();

// .use = add middleware (runs for every request) or mount a router under a path
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
// requireRole = middleware: the user must have this role (e.g. ADMIN)
adminRouter.use(requireAuth, requireRole('ADMIN'));

// .use = add middleware (runs for every request) or mount a router under a path
adminRouter.use('/products', adminProductsRouter);
// .use = add middleware (runs for every request) or mount a router under a path
adminRouter.use('/orders', adminOrdersRouter);
// .use = add middleware (runs for every request) or mount a router under a path
adminRouter.use('/analytics', adminAnalyticsRouter);
// .use = add middleware (runs for every request) or mount a router under a path
adminRouter.use('/customers', adminCustomersRouter);
