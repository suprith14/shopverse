import { HttpError } from '../lib/http-error.js';
import { isConnectionError } from '../lib/prisma.js';

// Same error shape as the shop API, so the admin app handles both the same way:
// { error: { message, details? } }
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }
  // A body that isn't valid JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Invalid JSON' } });
  }
  // The database still wasn't reachable after the retries (lib/prisma.js): that's "temporarily
  // unavailable" (503), not a bug in our code (500). Retry-After tells clients when to try again.
  if (isConnectionError(err)) {
    console.error('[db] database unreachable after retries:', err.message.split('\n').filter(Boolean).pop());
    res.set('Retry-After', '10');
    return res.status(503).json({ error: { message: 'The content service is starting up. Please try again shortly.' } });
  }
  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.path} not found` } });
}
