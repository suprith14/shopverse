import express from 'express';
import helmet from 'helmet';
import { contentRouter } from './content/content.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

// Builds the Express app (kept apart from server.js so tests can use it without a port).
// Every URL starts with /cms, so the store and admin can forward /cms/* to this service
// (Vite proxy on the laptop, Vercel rewrites live) the same way they forward /api/* to the shop API.
// No CORS setup is needed for that reason: the browser only ever talks to its own site.
export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));

  app.get('/cms/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/cms', contentRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
