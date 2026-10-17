import type { Request, Response, CookieOptions } from 'express';
import { isProd } from '../../config/env.js';
import { HttpError, tooManyRequests, unauthorized } from '../../lib/http-error.js';
import { limiters, type RateLimiter } from '../../lib/rate-limiter.js';
import type { AuthUser } from '../../middleware/auth.js';
import { REFRESH_TOKEN_TTL_MS } from './auth.tokens.js';
import * as authService from './auth.service.js';
import { recordActivity } from '../../lib/activity.js';
import { sendPasswordChangedEmail } from './auth-emails.js';
import { requestReset, resetWithCode } from './password-reset.js';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions: CookieOptions = {
  httpOnly: true, // not readable from JavaScript
  secure: isProd, // HTTPS only in production
  // 'lax': the browser only sends the cookie to requests from our own site. That works because
  // the frontends never call the API on another domain: in development Vite forwards /api, and in
  // production Vercel does (a "rewrite"), so the browser always sees one site. It also blocks most
  // CSRF tricks, where another website makes your browser send requests with your cookie.
  sameSite: 'lax',
  path: '/api/auth', // only sent to auth endpoints, not with every request
  maxAge: REFRESH_TOKEN_TTL_MS,
};

// Controllers only deal with HTTP: read validated input, call the service, shape the response.
// The refresh token goes into a cookie; only the user + access token go in the JSON body.

export async function register(_req: Request, res: Response) {
  const { refreshToken, ...result } = await authService.register(res.locals.body);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions).status(201).json(result);
}

// Refuses the request with 429 + Retry-After if ANY of the given limits is reached.
function enforce(res: Response, checks: [RateLimiter, string][]) {
  const waitMs = Math.max(0, ...checks.map(([limiter, key]) => limiter.retryAfterMs(key)));
  if (waitMs > 0) {
    // Logged so blocks are visible, and so you can check in production that req.ip is the
    // visitor's real IP, not a proxy's (see TRUST_PROXY_HOPS). Keys never contain passwords or codes.
    console.warn(`[rate-limit] blocked ip=${res.req.ip} keys=${checks.map(([, key]) => key).join(',')}`);
    res.set('Retry-After', String(Math.ceil(waitMs / 1000))); // standard header, in seconds
    throw tooManyRequests(waitMs);
  }
}

export async function login(req: Request, res: Response) {
  // Unknown emails are counted too, so "never gets locked" can't reveal an email isn't registered.
  const accountKey = `login:${res.locals.body.email}`;
  const ipKey = `login:${req.ip}`;
  enforce(res, [[limiters.loginPerAccount, accountKey], [limiters.loginPerIp, ipKey]]);

  try {
    const { refreshToken, ...result } = await authService.login(res.locals.body);
    limiters.loginPerAccount.reset(accountKey); // correct password: this account starts fresh
    recordActivity(result.user.id);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions).json(result);
  } catch (err) {
    // Only WRONG credentials count (not e.g. a database hiccup).
    if (err instanceof HttpError && err.status === 401) {
      limiters.loginPerAccount.record(accountKey);
      limiters.loginPerIp.record(ipKey);
    }
    throw err;
  }
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw unauthorized('No refresh token');

  try {
    const { refreshToken, ...result } = await authService.refresh(token);
    // Opening the site refreshes the session: that counts as being active.
    recordActivity(result.user.id);
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

// Every session is ended by the change; this device gets a fresh refresh cookie + access token.
export async function changePassword(_req: Request, res: Response) {
  const { refreshToken, ...result } = await authService.changePassword((res.locals.user as AuthUser).id, res.locals.body);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions).json(result);
  // After responding: the notification email must never delay or break the change itself.
  sendPasswordChangedEmail(result.user).catch((err) => console.error('[email] password-changed notice failed', err));
}

// Always the same reply, at the same speed, whether or not the email has an account.
// The work (database + sending the email) runs in the background AFTER replying: otherwise
// real accounts would answer more slowly than unknown ones (a timing leak), and an email
// failure would only ever show up for real accounts.
export function forgotPassword(req: Request, res: Response) {
  // Limit "send me a code" per IP: stops one machine flooding many inboxes through our form.
  enforce(res, [[limiters.resetRequestsPerIp, `reset-request:${req.ip}`]]);
  limiters.resetRequestsPerIp.record(`reset-request:${req.ip}`);
  res.json({ message: 'If an account exists for that email, we sent a 6-digit code. It works for 15 minutes.' });
  requestReset(res.locals.body.email).catch((err) => console.error('[password-reset] could not send code', err));
}

export async function resetPassword(req: Request, res: Response) {
  const { email, code, newPassword } = res.locals.body;
  // Each code allows only 5 tries, but one machine could try codes for MANY accounts: cap wrong codes per IP.
  const ipKey = `reset-fail:${req.ip}`;
  enforce(res, [[limiters.resetFailuresPerIp, ipKey]]);
  const user = await resetWithCode(email, code, newPassword).catch((err) => {
    if (err instanceof HttpError && err.status === 400) limiters.resetFailuresPerIp.record(ipKey);
    throw err;
  });
  const { refreshToken, ...result } = await authService.startSessionAfterReset(user);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions).json(result);
  sendPasswordChangedEmail(result.user).catch((err) => console.error('[email] password-changed notice failed', err));
}

export async function me(_req: Request, res: Response) {
  const user = res.locals.user as AuthUser;
  res.json({ user: await authService.getMe(user.id) });
}
