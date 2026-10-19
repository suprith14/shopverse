// import = bring in code from another file or package
import { Prisma } from '@prisma/client';
// import = bring in code from another file or package
// HttpError = an error with an HTTP status; the error handler sends it as JSON
import { HttpError } from '../lib/http-error.js';

// Central error handler: every thrown error ends up here and becomes a consistent
// JSON shape: { error: { message, details? } }.
// Express 5 forwards errors from async handlers automatically, so no try/catch is needed in controllers.
// export = other files can import this
// function = a named, reusable block of code
export function errorHandler(err, _req, res, _next) {
  // if (...) = run the next part only when the condition is true
  // HttpError = an error with an HTTP status; the error handler sends it as JSON
  if (err instanceof HttpError) {
    // return = give this value back and stop the function here
    // res.status(code) = set the HTTP status code (201 created, 404...)
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }

  // Unique constraint violation, e.g. registering an email that already exists.
  // if (...) = run the next part only when the condition is true
  // a && b = AND; in JSX: show b only when a is true
  // === = strictly equal (same value AND same type)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    // return = give this value back and stop the function here
    // res.status(code) = set the HTTP status code (201 created, 404...)
    return res.status(409).json({ error: { message: 'Resource already exists' } });
  }

  // console.log / warn / error = print to the server log
  console.error(err);
  // res.status(code) = set the HTTP status code (201 created, 404...)
  res.status(500).json({ error: { message: 'Internal server error' } });
}

// export = other files can import this
// function = a named, reusable block of code
export function notFoundHandler(req, res) {
  // res.status(code) = set the HTTP status code (201 created, 404...)
  // `text ${x}` = a template string: text with values inserted
  // req.method = GET, POST...
  // req.path = the URL path
  res.status(404).json({ error: { message: `Route ${req.method} ${req.path} not found` } });
}
