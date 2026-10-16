import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { badRequest } from '../lib/http-error.js';

type Source = 'body' | 'query' | 'params';

// Validates part of the request against a Zod schema before the controller runs.
// The parsed (typed, coerced, defaulted) result is stored on res.locals.<source>,
// so controllers never touch unvalidated input.
export function validate(schema: ZodType, source: Source = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(badRequest('Validation failed', details));
    }
    res.locals[source] = result.data;
    next();
  };
}
