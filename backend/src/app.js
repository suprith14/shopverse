// import = bring in code from another file or package
// express = the web framework: receives HTTP requests and sends responses
import express from 'express';
// import = bring in code from another file or package
// cors = which other websites may call this API from a browser
import cors from 'cors';
// import = bring in code from another file or package
// helmet = adds security headers to every response
import helmet from 'helmet';
// import = bring in code from another file or package
// cookieParser = reads cookies into req.cookies
import cookieParser from 'cookie-parser';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from './config/env.js';
// import = bring in code from another file or package
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
// import = bring in code from another file or package
import { authRouter } from './modules/auth/auth.routes.js';
// import = bring in code from another file or package
import { catalogRouter } from './modules/catalog/catalog.routes.js';
// import = bring in code from another file or package
import { cartRouter } from './modules/cart/cart.routes.js';
// import = bring in code from another file or package
import { wishlistRouter } from './modules/wishlist/wishlist.routes.js';
// import = bring in code from another file or package
import { couponsRouter } from './modules/coupons/coupons.routes.js';
// import = bring in code from another file or package
import { ordersRouter } from './modules/orders/orders.routes.js';
// import = bring in code from another file or package
import { reviewsRouter } from './modules/reviews/reviews.routes.js';
// import = bring in code from another file or package
import { adminRouter } from './modules/admin/admin.routes.js';
// import = bring in code from another file or package
import { profileRouter } from './modules/profile/profile.routes.js';
// import = bring in code from another file or package
import { invoicesRouter } from './modules/invoices/invoices.routes.js';
// import = bring in code from another file or package
import { guideRouter } from './modules/guide/guide.routes.js';
// import = bring in code from another file or package
import { handleStripeWebhook } from './modules/webhooks/stripe-webhook.js';

// Builds the Express app. Kept separate from server.ts so tests can import the app
// without starting a real HTTP server.
// export = other files can import this
// function = a named, reusable block of code
export function createApp() {
  // const = a name for a value that is never reassigned
  // express = the web framework: receives HTTP requests and sends responses
  const app = express();

  // Real visitor IP behind proxies (see TRUST_PROXY_HOPS in config/env.ts). Used by per-IP rate limits.
  // app.set = an Express setting ('trust proxy' = believe Render's proxy about the client IP)
  // env = the checked settings from .env (config/env.js)
  app.set('trust proxy', env.TRUST_PROXY_HOPS);
  // .use = add middleware (runs for every request) or mount a router under a path
  // helmet = adds security headers to every response
  app.use(helmet()); // sets secure HTTP headers
  // .use = add middleware (runs for every request) or mount a router under a path
  // cors = which other websites may call this API from a browser
  // env = the checked settings from .env (config/env.js)
  app.use(cors({ origin: env.CLIENT_URL, credentials: true })); // credentials: allow the refresh cookie
  // Stripe webhooks need the raw body to verify the signature, so this route is registered
  // BEFORE express.json() turns the body into an object.
  // .post(path, ...) = handle POST requests (create / do something)
  // express = the web framework: receives HTTP requests and sends responses
  // express.raw = keep the body as raw bytes (Stripe needs them to check the signature)
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

  // .use = add middleware (runs for every request) or mount a router under a path
  // express = the web framework: receives HTTP requests and sends responses
  // express.json = middleware: read JSON request bodies into req.body
  app.use(express.json({ limit: '1mb' }));
  // .use = add middleware (runs for every request) or mount a router under a path
  // cookieParser = reads cookies into req.cookies
  app.use(cookieParser());

  // .get(path, ...handlers) = handle GET requests (read) to this path
  // => = an arrow function (a short function)
  // res.json = send this object as JSON (status 200 unless set)
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // One router per feature module.
  // .use = add middleware (runs for every request) or mount a router under a path
  app.use('/api/auth', authRouter);
  // .use = add middleware (runs for every request) or mount a router under a path
  app.use('/api/catalog', catalogRouter);
  // .use = add middleware (runs for every request) or mount a router under a path
  app.use('/api/cart', cartRouter);
  // .use = add middleware (runs for every request) or mount a router under a path
  app.use('/api/wishlist', wishlistRouter);
  // .use = add middleware (runs for every request) or mount a router under a path
  app.use('/api/coupons', couponsRouter);
  // .use = add middleware (runs for every request) or mount a router under a path
  app.use('/api/orders', ordersRouter);
  // .use = add middleware (runs for every request) or mount a router under a path
  app.use('/api/reviews', reviewsRouter);
  // .use = add middleware (runs for every request) or mount a router under a path
  app.use('/api/profile', profileRouter);
  // .use = add middleware (runs for every request) or mount a router under a path
  app.use('/api/invoices', invoicesRouter); // public invoice verification (QR code)
  // .use = add middleware (runs for every request) or mount a router under a path
  app.use('/api/guide', guideRouter); // password-protected project guide (My account)
  // .use = add middleware (runs for every request) or mount a router under a path
  app.use('/api/admin', adminRouter); // everything admin-only, see modules/admin/

  // .use = add middleware (runs for every request) or mount a router under a path
  app.use(notFoundHandler);
  // .use = add middleware (runs for every request) or mount a router under a path
  app.use(errorHandler);
  // return = give this value back and stop the function here
  return app;
}
