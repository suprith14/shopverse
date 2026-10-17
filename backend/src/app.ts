import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { catalogRouter } from './modules/catalog/catalog.routes.js';
import { cartRouter } from './modules/cart/cart.routes.js';
import { wishlistRouter } from './modules/wishlist/wishlist.routes.js';
import { couponsRouter } from './modules/coupons/coupons.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { reviewsRouter } from './modules/reviews/reviews.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { profileRouter } from './modules/profile/profile.routes.js';
import { invoicesRouter } from './modules/invoices/invoices.routes.js';
import { handleStripeWebhook } from './modules/webhooks/stripe-webhook.js';

// Builds the Express app. Kept separate from server.ts so tests can import the app
// without starting a real HTTP server.
export function createApp() {
  const app = express();

  // Real visitor IP behind proxies (see TRUST_PROXY_HOPS in config/env.ts). Used by per-IP rate limits.
  app.set('trust proxy', env.TRUST_PROXY_HOPS);
  app.use(helmet()); // sets secure HTTP headers
  app.use(cors({ origin: env.CLIENT_URL, credentials: true })); // credentials: allow the refresh cookie
  // Stripe webhooks need the raw body to verify the signature, so this route is registered
  // BEFORE express.json() turns the body into an object.
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // One router per feature module.
  app.use('/api/auth', authRouter);
  app.use('/api/catalog', catalogRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/coupons', couponsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/invoices', invoicesRouter); // public invoice verification (QR code)
  app.use('/api/admin', adminRouter); // everything admin-only, see modules/admin/

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
