// import = bring in code from another file or package
import { verifyAccessToken } from '../modules/auth/auth.tokens.js';
// import = bring in code from another file or package
// forbidden = HttpError 403: logged in, but not allowed
// unauthorized = HttpError 401: not logged in / bad token
import { forbidden, unauthorized } from '../lib/http-error.js';
// import = bring in code from another file or package
import { recordActivity } from '../lib/activity.js';

// Reads "Authorization: Bearer <accessToken>" and attaches the user to res.locals.user.
// export = other files can import this
// function = a named, reusable block of code
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
// next() = pass to the next middleware; next(error) = jump to the error handler
export function requireAuth(req, res, next) {
  // const = a name for a value that is never reassigned
  // req.headers = the request headers
  const header = req.headers.authorization;
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // ?.() = call only if the function exists
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // .startsWith = true if the text begins with this
  // return = give this value back and stop the function here
  // next() = pass to the next middleware; next(error) = jump to the error handler
  // unauthorized = HttpError 401: not logged in / bad token
  if (!header?.startsWith('Bearer ')) return next(unauthorized());

  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // const = a name for a value that is never reassigned
    // .slice = a copy of part of an array/string
    const payload = verifyAccessToken(header.slice('Bearer '.length));
    // res.locals = data for this one request (the validated input, the logged-in user)
    // res.locals.user = the logged-in user (set by requireAuth from the access token)
    res.locals.user = { id: payload.sub, role: payload.role };
    recordActivity(payload.sub); // "last seen" for the admin dashboard (throttled, never blocks the request)
    // next() = pass to the next middleware; next(error) = jump to the error handler
    next();
  } catch {
    // Expired or tampered token. The frontend reacts to 401 by calling /auth/refresh.
    // next() = pass to the next middleware; next(error) = jump to the error handler
    // unauthorized = HttpError 401: not logged in / bad token
    next(unauthorized('Invalid or expired token'));
  }
}

// Use after requireAuth: requireRole('ADMIN')
// export = other files can import this
// function = a named, reusable block of code
// requireRole = middleware: the user must have this role (e.g. ADMIN)
export function requireRole(role) {
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // next() = pass to the next middleware; next(error) = jump to the error handler
  return (_req, res, next) => {
    // const = a name for a value that is never reassigned
    // res.locals = data for this one request (the validated input, the logged-in user)
    // res.locals.user = the logged-in user (set by requireAuth from the access token)
    const user = res.locals.user;
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // return = give this value back and stop the function here
    // next() = pass to the next middleware; next(error) = jump to the error handler
    // unauthorized = HttpError 401: not logged in / bad token
    if (!user) return next(unauthorized());
    // if (...) = run the next part only when the condition is true
    // !== = not strictly equal
    // return = give this value back and stop the function here
    // next() = pass to the next middleware; next(error) = jump to the error handler
    // forbidden = HttpError 403: logged in, but not allowed
    if (user.role !== role) return next(forbidden());
    // next() = pass to the next middleware; next(error) = jump to the error handler
    next();
  };
}
