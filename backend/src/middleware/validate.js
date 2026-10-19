// import = bring in code from another file or package
// badRequest = HttpError 400: the request is invalid
import { badRequest } from '../lib/http-error.js';

// Validates part of the request against a Zod schema before the controller runs.
// The parsed (typed, coerced, defaulted) result is stored on res.locals.<source>,
// so controllers never touch unvalidated input.
// export = other files can import this
// function = a named, reusable block of code
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
// x = value (in parameters) = the default used when x is not given
export function validate(schema, source = 'body') {
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // next() = pass to the next middleware; next(error) = jump to the error handler
  return (req, res, next) => {
    // const = a name for a value that is never reassigned
    // obj[key] = read the property whose name is stored in key
    const result = schema.safeParse(req[source]);
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // result.success = did the Zod check pass?
    if (!result.success) {
      // const = a name for a value that is never reassigned
      // result.error = what was wrong (Zod)
      // .map = make a new array by transforming each item
      // => = an arrow function (a short function)
      // .join = turn an array into one string with a separator
      const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      // return = give this value back and stop the function here
      // next() = pass to the next middleware; next(error) = jump to the error handler
      // badRequest = HttpError 400: the request is invalid
      return next(badRequest('Validation failed', details));
    }
    // obj[key] = read the property whose name is stored in key
    // res.locals = data for this one request (the validated input, the logged-in user)
    // result.data = the checked (cleaned, converted) data
    res.locals[source] = result.data;
    // next() = pass to the next middleware; next(error) = jump to the error handler
    next();
  };
}
