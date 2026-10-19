// import = bring in code from another file or package
import { isProd } from '../../config/env.js';
// import = bring in code from another file or package
// HttpError = an error with an HTTP status; the error handler sends it as JSON
// tooManyRequests = HttpError 429: slow down (rate limit)
// unauthorized = HttpError 401: not logged in / bad token
import { HttpError, tooManyRequests, unauthorized } from '../../lib/http-error.js';
// import = bring in code from another file or package
import { limiters } from '../../lib/rate-limiter.js';
// import = bring in code from another file or package
import { REFRESH_TOKEN_TTL_MS } from './auth.tokens.js';
// import = bring in code from another file or package
import * as authService from './auth.service.js';
// import = bring in code from another file or package
import { recordActivity } from '../../lib/activity.js';
// import = bring in code from another file or package
import { sendPasswordChangedEmail } from './auth-emails.js';
// import = bring in code from another file or package
import { requestReset, resetWithCode } from './password-reset.js';

// const = a name for a value that is never reassigned
const REFRESH_COOKIE = 'refreshToken';

// const = a name for a value that is never reassigned
const cookieOptions = {
  // httpOnly = JavaScript in the page can't read the cookie (stops token theft by XSS)
  httpOnly: true, // not readable from JavaScript
  // secure = the cookie is only sent over HTTPS
  secure: isProd, // HTTPS only in production
  // 'lax': the browser only sends the cookie to requests from our own site. That works because
  // the frontends never call the API on another domain: in development Vite forwards /api, and in
  // production Vercel does (a "rewrite"), so the browser always sees one site. It also blocks most
  // CSRF tricks, where another website makes your browser send requests with your cookie.
  // sameSite = when the browser sends the cookie with requests from other sites
  sameSite: 'lax',
  // path = the cookie is only sent to URLs under this path
  path: '/api/auth', // only sent to auth endpoints, not with every request
  // maxAge = how long the cookie lives (ms)
  maxAge: REFRESH_TOKEN_TTL_MS,
};

// Controllers only deal with HTTP: read validated input, call the service, shape the response.
// The refresh token goes into a cookie; only the user + access token go in the JSON body.

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function register(_req, res) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // ...rest = collect the remaining items/properties
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  const { refreshToken, ...result } = await authService.register(res.locals.body);
  // res.cookie = send a cookie for the browser to store
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions).status(201).json(result);
}

// Refuses the request with 429 + Retry-After if ANY of the given limits is reached.
// function = a named, reusable block of code
function enforce(res, checks) {
  // const = a name for a value that is never reassigned
  // Math = number helpers (min, max, round, floor, ceil...)
  // ...x = spread: copy all items/properties of x into here
  // .map = make a new array by transforming each item
  // => = an arrow function (a short function)
  // [a, b] = destructuring: take the first and second items of an array
  const waitMs = Math.max(0, ...checks.map(([limiter, key]) => limiter.retryAfterMs(key)));
  // if (...) = run the next part only when the condition is true
  if (waitMs > 0) {
    // Logged so blocks are visible, and so you can check in production that req.ip is the
    // visitor's real IP, not a proxy's (see TRUST_PROXY_HOPS). Keys never contain passwords or codes.
    // console.log / warn / error = print to the server log
    // `text ${x}` = a template string: text with values inserted
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    // [a, b] = destructuring: take the first and second items of an array
    // .join = turn an array into one string with a separator
    console.warn(`[rate-limit] blocked ip=${res.req.ip} keys=${checks.map(([, key]) => key).join(',')}`);
    // res.set = set a response header
    // Math = number helpers (min, max, round, floor, ceil...)
    res.set('Retry-After', String(Math.ceil(waitMs / 1000))); // standard header, in seconds
    // throw = stop here with an error
    // tooManyRequests = HttpError 429: slow down (rate limit)
    throw tooManyRequests(waitMs);
  }
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function login(req, res) {
  // Unknown emails are counted too, so "never gets locked" can't reveal an email isn't registered.
  // const = a name for a value that is never reassigned
  // `text ${x}` = a template string: text with values inserted
  // res.locals = data for this one request (the validated input, the logged-in user)
  const accountKey = `login:${res.locals.body.email}`;
  // const = a name for a value that is never reassigned
  // `text ${x}` = a template string: text with values inserted
  // req.ip = the client's IP address
  const ipKey = `login:${req.ip}`;
  enforce(res, [
    [limiters.loginPerAccount, accountKey],
    [limiters.loginPerIp, ipKey],
  ]);

  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // ...rest = collect the remaining items/properties
    // await = wait for a Promise (async result) before continuing
    // res.locals = data for this one request (the validated input, the logged-in user)
    const { refreshToken, ...result } = await authService.login(res.locals.body);
    limiters.loginPerAccount.reset(accountKey); // correct password: this account starts fresh
    recordActivity(result.user.id);
    // res.cookie = send a cookie for the browser to store
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions).json(result);
  } catch (err) {
    // Only WRONG credentials count (not e.g. a database hiccup).
    // if (...) = run the next part only when the condition is true
    // HttpError = an error with an HTTP status; the error handler sends it as JSON
    // a && b = AND; in JSX: show b only when a is true
    // === = strictly equal (same value AND same type)
    if (err instanceof HttpError && err.status === 401) {
      limiters.loginPerAccount.record(accountKey);
      limiters.loginPerIp.record(ipKey);
    }
    // throw = stop here with an error
    throw err;
  }
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function refresh(req, res) {
  // const = a name for a value that is never reassigned
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // obj[key] = read the property whose name is stored in key
  // req.cookies = the cookies the browser sent
  const token = req.cookies?.[REFRESH_COOKIE];
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // unauthorized = HttpError 401: not logged in / bad token
  if (!token) throw unauthorized('No refresh token');

  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // ...rest = collect the remaining items/properties
    // await = wait for a Promise (async result) before continuing
    const { refreshToken, ...result } = await authService.refresh(token);
    // Opening the site refreshes the session: that counts as being active.
    recordActivity(result.user.id);
    // res.cookie = send a cookie for the browser to store
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions).json(result);
  } catch (err) {
    // res.clearCookie = tell the browser to delete the cookie
    // ...x = spread: copy all items/properties of x into here
    // maxAge = how long the cookie lives (ms)
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined });
    // throw = stop here with an error
    throw err;
  }
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function logout(req, res) {
  // await = wait for a Promise (async result) before continuing
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // obj[key] = read the property whose name is stored in key
  // req.cookies = the cookies the browser sent
  await authService.logout(req.cookies?.[REFRESH_COOKIE]);
  res
    // res.clearCookie = tell the browser to delete the cookie
    // ...x = spread: copy all items/properties of x into here
    // maxAge = how long the cookie lives (ms)
    .clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined })
    .status(204)
    .end();
}

// Every session is ended by the change; this device gets a fresh refresh cookie + access token.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function changePassword(_req, res) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // ...rest = collect the remaining items/properties
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  // res.locals.user = the logged-in user (set by requireAuth from the access token)
  const { refreshToken, ...result } = await authService.changePassword(res.locals.user.id, res.locals.body);
  // res.cookie = send a cookie for the browser to store
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions).json(result);
  // After responding: the notification email must never delay or break the change itself.
  // => = an arrow function (a short function)
  // console.log / warn / error = print to the server log
  sendPasswordChangedEmail(result.user).catch((err) => console.error('[email] password-changed notice failed', err));
}

// Always the same reply, at the same speed, whether or not the email has an account.
// The work (database + sending the email) runs in the background AFTER replying: otherwise
// real accounts would answer more slowly than unknown ones (a timing leak), and an email
// failure would only ever show up for real accounts.
// export = other files can import this
// function = a named, reusable block of code
export function forgotPassword(req, res) {
  // Limit "send me a code" per IP: stops one machine flooding many inboxes through our form.
  // `text ${x}` = a template string: text with values inserted
  // req.ip = the client's IP address
  enforce(res, [[limiters.resetRequestsPerIp, `reset-request:${req.ip}`]]);
  // `text ${x}` = a template string: text with values inserted
  // req.ip = the client's IP address
  limiters.resetRequestsPerIp.record(`reset-request:${req.ip}`);
  // res.json = send this object as JSON (status 200 unless set)
  res.json({ message: 'If an account exists for that email, we sent a 6-digit code. It works for 15 minutes.' });
  // res.locals = data for this one request (the validated input, the logged-in user)
  // => = an arrow function (a short function)
  // console.log / warn / error = print to the server log
  requestReset(res.locals.body.email).catch((err) => console.error('[password-reset] could not send code', err));
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function resetPassword(req, res) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // res.locals = data for this one request (the validated input, the logged-in user)
  const { email, code, newPassword } = res.locals.body;
  // Each code allows only 5 tries, but one machine could try codes for MANY accounts: cap wrong codes per IP.
  // const = a name for a value that is never reassigned
  // `text ${x}` = a template string: text with values inserted
  // req.ip = the client's IP address
  const ipKey = `reset-fail:${req.ip}`;
  enforce(res, [[limiters.resetFailuresPerIp, ipKey]]);
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // => = an arrow function (a short function)
  const user = await resetWithCode(email, code, newPassword).catch((err) => {
    // if (...) = run the next part only when the condition is true
    // HttpError = an error with an HTTP status; the error handler sends it as JSON
    // a && b = AND; in JSX: show b only when a is true
    // === = strictly equal (same value AND same type)
    if (err instanceof HttpError && err.status === 400) limiters.resetFailuresPerIp.record(ipKey);
    // throw = stop here with an error
    throw err;
  });
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // ...rest = collect the remaining items/properties
  // await = wait for a Promise (async result) before continuing
  const { refreshToken, ...result } = await authService.startSessionAfterReset(user);
  // res.cookie = send a cookie for the browser to store
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions).json(result);
  // => = an arrow function (a short function)
  // console.log / warn / error = print to the server log
  sendPasswordChangedEmail(result.user).catch((err) => console.error('[email] password-changed notice failed', err));
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function me(_req, res) {
  // const = a name for a value that is never reassigned
  // res.locals = data for this one request (the validated input, the logged-in user)
  // res.locals.user = the logged-in user (set by requireAuth from the access token)
  const user = res.locals.user;
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  res.json({ user: await authService.getMe(user.id) });
}
