// Throw an HttpError anywhere in a service; the error-handler middleware
// turns it into a JSON response with the right status code.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message, details) => new HttpError(400, message, details);
export const unauthorized = (message = 'Not authenticated') => new HttpError(401, message);
export const forbidden = (message = 'Not allowed') => new HttpError(403, message);
export const notFound = (message = 'Not found') => new HttpError(404, message);
export const conflict = (message) => new HttpError(409, message);

// 429 Too Many Requests. The caller also sets the standard Retry-After header (seconds).
export const tooManyRequests = (retryAfterMs) => {
  const minutes = Math.ceil(retryAfterMs / 60_000);
  return new HttpError(429, `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`);
};
