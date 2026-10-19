import { createHash, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { forbidden, notFound, tooManyRequests } from '../../lib/http-error.js';
import { limiters } from '../../lib/rate-limiter.js';

// The project guide (system map, flows, code and data): a self-contained HTML page shown in the
// store under My account. It's served ONLY after the guide password is checked here, on the
// server: hiding it in the store's JavaScript would let anyone read it in the downloaded code.
//
// Mounted at /api/guide. Logged-in users only; GUIDE_PASSWORD (in .env / on Render) is the password.

const GUIDE_HTML = readFileSync(new URL('./system-map.html', import.meta.url), 'utf8');

// Compare SHA-256 hashes in constant time: equal length always, and the time taken reveals
// nothing about how many characters were right.
const digest = (text) => createHash('sha256').update(text).digest();
const passwordMatches = (attempt) => timingSafeEqual(digest(attempt), digest(env.GUIDE_PASSWORD));

const unlockSchema = z.object({ password: z.string().min(1, 'Enter the guide password').max(200) });

export const guideRouter = Router();

guideRouter.post('/unlock', requireAuth, validate(unlockSchema), (_req, res) => {
  // 404 rather than 503: "not set up" isn't a server failure, and the store shows 5xx as a
  // "something went wrong, retry" popup instead of this message.
  if (!env.GUIDE_PASSWORD) throw notFound("The project guide isn't set up on this server.");

  // At most 5 wrong passwords per user in 15 minutes: guessing would take forever.
  const key = `guide:${res.locals.user.id}`;
  const waitMs = limiters.guidePerUser.retryAfterMs(key);
  if (waitMs > 0) {
    res.set('Retry-After', String(Math.ceil(waitMs / 1000)));
    throw tooManyRequests(waitMs);
  }

  if (!passwordMatches(res.locals.body.password)) {
    limiters.guidePerUser.record(key);
    // 403, not 401: a 401 tells the store "your login expired" and it would try to refresh it.
    throw forbidden('Wrong guide password');
  }

  limiters.guidePerUser.reset(key);
  res.set('Cache-Control', 'no-store'); // never keep the unlocked guide in any cache
  res.json({ html: GUIDE_HTML });
});
