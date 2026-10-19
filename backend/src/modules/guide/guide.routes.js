// import = bring in code from another file or package
// createHash = make a one-way fingerprint (hash) of data, e.g. SHA-256
// timingSafeEqual = compare secrets in constant time (no timing leaks)
import { createHash, timingSafeEqual } from 'node:crypto';
// import = bring in code from another file or package
// readFileSync = read a whole file from disk (blocks until done; fine at startup)
import { readFileSync } from 'node:fs';
// import = bring in code from another file or package
// Router = a group of routes mounted under one path (e.g. /api/cart)
import { Router } from 'express';
// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from '../../config/env.js';
// import = bring in code from another file or package
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
import { requireAuth } from '../../middleware/auth.js';
// import = bring in code from another file or package
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
import { validate } from '../../middleware/validate.js';
// import = bring in code from another file or package
// forbidden = HttpError 403: logged in, but not allowed
// notFound = HttpError 404: doesn't exist
// tooManyRequests = HttpError 429: slow down (rate limit)
import { forbidden, notFound, tooManyRequests } from '../../lib/http-error.js';
// import = bring in code from another file or package
import { limiters } from '../../lib/rate-limiter.js';

// The project guide (system map, flows, code and data): a self-contained HTML page shown in the
// store under My account. It's served ONLY after the guide password is checked here, on the
// server: hiding it in the store's JavaScript would let anyone read it in the downloaded code.
//
// Mounted at /api/guide. Logged-in users only; GUIDE_PASSWORD (in .env / on Render) is the password.

// const = a name for a value that is never reassigned
// readFileSync = read a whole file from disk (blocks until done; fine at startup)
// new = create an object from a class (e.g. new Date())
const GUIDE_HTML = readFileSync(new URL('./system-map.html', import.meta.url), 'utf8');

// Compare SHA-256 hashes in constant time: equal length always, and the time taken reveals
// nothing about how many characters were right.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// createHash = make a one-way fingerprint (hash) of data, e.g. SHA-256
const digest = (text) => createHash('sha256').update(text).digest();
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// timingSafeEqual = compare secrets in constant time (no timing leaks)
// env = the checked settings from .env (config/env.js)
const passwordMatches = (attempt) => timingSafeEqual(digest(attempt), digest(env.GUIDE_PASSWORD));

// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
// z.string = must be text
// .min = at least this many (characters, or this value)
// .max = at most this many (characters, or this value)
const unlockSchema = z.object({ password: z.string().min(1, 'Enter the guide password').max(200) });

// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const guideRouter = Router();

// .post(path, ...) = handle POST requests (create / do something)
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
// => = an arrow function (a short function)
guideRouter.post('/unlock', requireAuth, validate(unlockSchema), (_req, res) => {
  // 404 rather than 503: "not set up" isn't a server failure, and the store shows 5xx as a
  // "something went wrong, retry" popup instead of this message.
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // env = the checked settings from .env (config/env.js)
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!env.GUIDE_PASSWORD) throw notFound("The project guide isn't set up on this server.");

  // At most 5 wrong passwords per user in 15 minutes: guessing would take forever.
  // const = a name for a value that is never reassigned
  // `text ${x}` = a template string: text with values inserted
  // res.locals = data for this one request (the validated input, the logged-in user)
  // res.locals.user = the logged-in user (set by requireAuth from the access token)
  const key = `guide:${res.locals.user.id}`;
  // const = a name for a value that is never reassigned
  const waitMs = limiters.guidePerUser.retryAfterMs(key);
  // if (...) = run the next part only when the condition is true
  if (waitMs > 0) {
    // res.set = set a response header
    // Math = number helpers (min, max, round, floor, ceil...)
    res.set('Retry-After', String(Math.ceil(waitMs / 1000)));
    // throw = stop here with an error
    // tooManyRequests = HttpError 429: slow down (rate limit)
    throw tooManyRequests(waitMs);
  }

  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // res.locals = data for this one request (the validated input, the logged-in user)
  if (!passwordMatches(res.locals.body.password)) {
    limiters.guidePerUser.record(key);
    // 403, not 401: a 401 tells the store "your login expired" and it would try to refresh it.
    // throw = stop here with an error
    // forbidden = HttpError 403: logged in, but not allowed
    throw forbidden('Wrong guide password');
  }

  limiters.guidePerUser.reset(key);
  // res.set = set a response header
  res.set('Cache-Control', 'no-store'); // never keep the unlocked guide in any cache
  // res.json = send this object as JSON (status 200 unless set)
  res.json({ html: GUIDE_HTML });
});
