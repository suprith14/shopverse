// import = bring in code from another file or package
import crypto from 'node:crypto';
// import = bring in code from another file or package
// jwt = JSON Web Tokens: signed login tokens
import jwt from 'jsonwebtoken';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from '../../config/env.js';

// Two-token strategy:
// - Access token: short-lived JWT (15 min), sent in the Authorization header. Stateless:
//   the server verifies its signature without a DB lookup.
// - Refresh token: long-lived random string (7 days) in an httpOnly cookie, so JavaScript
//   (and therefore XSS) can't read it. Stored hashed in the DB so it can be revoked.

// export = other files can import this
// const = a name for a value that is never reassigned
export const ACCESS_TOKEN_TTL = '15m';
// export = other files can import this
// const = a name for a value that is never reassigned
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// export = other files can import this
// function = a named, reusable block of code
export function signAccessToken(userId, role) {
  // return = give this value back and stop the function here
  // jwt = JSON Web Tokens: signed login tokens
  // jwt.sign = create a signed token with this data (only someone with the secret can make one)
  // env = the checked settings from .env (config/env.js)
  // expiresIn = how long the token is valid (e.g. "15m")
  return jwt.sign({ role }, env.JWT_ACCESS_SECRET, { subject: userId, expiresIn: ACCESS_TOKEN_TTL });
}

// export = other files can import this
// function = a named, reusable block of code
export function verifyAccessToken(token) {
  // return = give this value back and stop the function here
  // jwt = JSON Web Tokens: signed login tokens
  // jwt.verify = check the signature and expiry; throws if forged or expired
  // env = the checked settings from .env (config/env.js)
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

// export = other files can import this
// function = a named, reusable block of code
export function generateRefreshToken() {
  // return = give this value back and stop the function here
  // crypto.randomBytes = cryptographically secure random bytes (for tokens)
  return crypto.randomBytes(48).toString('hex');
}

// export = other files can import this
// function = a named, reusable block of code
export function hashToken(token) {
  // return = give this value back and stop the function here
  // crypto.createHash = a one-way fingerprint (hash) of data
  return crypto.createHash('sha256').update(token).digest('hex');
}
