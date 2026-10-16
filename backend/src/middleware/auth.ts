import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
import { verifyAccessToken } from '../modules/auth/auth.tokens.js';
import { forbidden, unauthorized } from '../lib/http-error.js';
import { recordActivity } from '../lib/activity.js';

export interface AuthUser {
  id: string;
  role: Role;
}

// Reads "Authorization: Bearer <accessToken>" and attaches the user to res.locals.user.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(unauthorized());

  try {
    const payload = verifyAccessToken(header.slice('Bearer '.length));
    res.locals.user = { id: payload.sub, role: payload.role } satisfies AuthUser;
    recordActivity(payload.sub); // "last seen" for the admin dashboard (throttled, never blocks the request)
    next();
  } catch {
    // Expired or tampered token. The frontend reacts to 401 by calling /auth/refresh.
    next(unauthorized('Invalid or expired token'));
  }
}

// Use after requireAuth: requireRole('ADMIN')
export function requireRole(role: Role) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as AuthUser | undefined;
    if (!user) return next(unauthorized());
    if (user.role !== role) return next(forbidden());
    next();
  };
}
