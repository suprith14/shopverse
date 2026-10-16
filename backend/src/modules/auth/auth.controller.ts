import type { Request, Response, CookieOptions } from 'express';
import { isProd } from '../../config/env.js';
import { unauthorized } from '../../lib/http-error.js';
import type { AuthUser } from '../../middleware/auth.js';
import { REFRESH_TOKEN_TTL_MS } from './auth.tokens.js';
import * as authService from './auth.service.js';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions: CookieOptions = {
  httpOnly: true, // not readable from JavaScript
  secure: isProd, // HTTPS only in production
  // Frontend and API on different domains in production need 'none' (+ secure) for the cookie to be sent.
  sameSite: isProd ? 'none' : 'lax',
  path: '/api/auth', // only sent to auth endpoints, not with every request
  maxAge: REFRESH_TOKEN_TTL_MS,
};

// Controllers only deal with HTTP: read validated input, call the service, shape the response.
// The refresh token goes into a cookie; only the user + access token go in the JSON body.

export async function register(_req: Request, res: Response) {
  const { refreshToken, ...result } = await authService.register(res.locals.body);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions).status(201).json(result);
}

export async function login(_req: Request, res: Response) {
  const { refreshToken, ...result } = await authService.login(res.locals.body);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions).json(result);
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw unauthorized('No refresh token');

  try {
    const { refreshToken, ...result } = await authService.refresh(token);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions).json(result);
  } catch (err) {
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined });
    throw err;
  }
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.cookies?.[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined }).status(204).end();
}

export async function me(_req: Request, res: Response) {
  const user = res.locals.user as AuthUser;
  res.json({ user: await authService.getMe(user.id) });
}
