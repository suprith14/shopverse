import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../../config/env.js';

// Two-token strategy:
// - Access token: short-lived JWT (15 min), sent in the Authorization header. Stateless:
//   the server verifies its signature without a DB lookup.
// - Refresh token: long-lived random string (7 days) in an httpOnly cookie, so JavaScript
//   (and therefore XSS) can't read it. Stored hashed in the DB so it can be revoked.

export const ACCESS_TOKEN_TTL = '15m';
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface AccessPayload {
  sub: string; // user id
  role: Role;
}

export function signAccessToken(userId: string, role: Role) {
  return jwt.sign({ role }, env.JWT_ACCESS_SECRET, { subject: userId, expiresIn: ACCESS_TOKEN_TTL });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
}

export function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
