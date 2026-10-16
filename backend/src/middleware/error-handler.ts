import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { HttpError } from '../lib/http-error.js';

// Central error handler: every thrown error ends up here and becomes a consistent
// JSON shape: { error: { message, details? } }.
// Express 5 forwards errors from async handlers automatically, so no try/catch is needed in controllers.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }

  // Unique constraint violation, e.g. registering an email that already exists.
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    return res.status(409).json({ error: { message: 'Resource already exists' } });
  }

  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.path} not found` } });
}
