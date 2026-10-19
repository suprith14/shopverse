// Throw an HttpError anywhere in a service; the error-handler middleware
// turns it into a JSON response with the right status code.
// export = other files can import this
// HttpError = an error with an HTTP status; the error handler sends it as JSON
// Error = an error object with a message (and a stack trace)
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// export = other files can import this
// const = a name for a value that is never reassigned
// badRequest = HttpError 400: the request is invalid
// => = an arrow function (a short function)
// new = create an object from a class (e.g. new Date())
// HttpError = an error with an HTTP status; the error handler sends it as JSON
export const badRequest = (message, details) => new HttpError(400, message, details);
// export = other files can import this
// const = a name for a value that is never reassigned
// unauthorized = HttpError 401: not logged in / bad token
// => = an arrow function (a short function)
// x = value (in parameters) = the default used when x is not given
// new = create an object from a class (e.g. new Date())
// HttpError = an error with an HTTP status; the error handler sends it as JSON
export const unauthorized = (message = 'Not authenticated') => new HttpError(401, message);
// export = other files can import this
// const = a name for a value that is never reassigned
// forbidden = HttpError 403: logged in, but not allowed
// => = an arrow function (a short function)
// x = value (in parameters) = the default used when x is not given
// new = create an object from a class (e.g. new Date())
// HttpError = an error with an HTTP status; the error handler sends it as JSON
export const forbidden = (message = 'Not allowed') => new HttpError(403, message);
// export = other files can import this
// const = a name for a value that is never reassigned
// notFound = HttpError 404: doesn't exist
// => = an arrow function (a short function)
// x = value (in parameters) = the default used when x is not given
// new = create an object from a class (e.g. new Date())
// HttpError = an error with an HTTP status; the error handler sends it as JSON
export const notFound = (message = 'Not found') => new HttpError(404, message);
// export = other files can import this
// const = a name for a value that is never reassigned
// conflict = HttpError 409: clashes with existing data (e.g. email taken)
// => = an arrow function (a short function)
// new = create an object from a class (e.g. new Date())
// HttpError = an error with an HTTP status; the error handler sends it as JSON
export const conflict = (message) => new HttpError(409, message);

// 429 Too Many Requests. The caller also sets the standard Retry-After header (seconds).
// export = other files can import this
// const = a name for a value that is never reassigned
// tooManyRequests = HttpError 429: slow down (rate limit)
// => = an arrow function (a short function)
export const tooManyRequests = (retryAfterMs) => {
  // const = a name for a value that is never reassigned
  // Math = number helpers (min, max, round, floor, ceil...)
  const minutes = Math.ceil(retryAfterMs / 60_000);
  // return = give this value back and stop the function here
  // new = create an object from a class (e.g. new Date())
  // HttpError = an error with an HTTP status; the error handler sends it as JSON
  // `text ${x}` = a template string: text with values inserted
  // a ? b : c = ternary: if a then b else c
  // === = strictly equal (same value AND same type)
  return new HttpError(429, `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`);
};
