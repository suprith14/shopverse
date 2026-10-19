import { badRequest } from '../lib/http-error.js';

// Validates part of the request against a Zod schema before the controller runs.
// The parsed (typed, coerced, defaulted) result is stored on res.locals.<source>,
// so controllers never touch unvalidated input.
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(badRequest('Validation failed', details));
    }
    res.locals[source] = result.data;
    next();
  };
}
