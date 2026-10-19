// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';

// The dashboard's period selector: last 7 / 30 / 90 days.
// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const periodQuery = z.object({
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  days: z.coerce
    // z.number = must be a number
    .number()
    // .int = must be a whole number
    .int()
    // .refine = a custom check written as a function
    // => = an arrow function (a short function)
    // .includes = true if the array/string contains the value
    .refine((d) => [7, 30, 90].includes(d), 'days must be 7, 30 or 90')
    // .default = the value used when it's left out
    .default(30),
});

// export = other files can import this
// const = a name for a value that is never reassigned
export const topProductsQuery = periodQuery.extend({
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  // z.number = must be a number
  // .int = must be a whole number
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  // .default = the value used when it's left out
  limit: z.coerce.number().int().min(1).max(20).default(5),
});
