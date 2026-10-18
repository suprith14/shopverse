import { HttpError } from '../lib/http-error.js';

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
  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.path} not found` } });
}
