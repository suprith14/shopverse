// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const listCustomersQuery = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .max = at most this many (characters, or this value)
  // .optional = may be left out
  q: z.string().trim().max(100).optional(), // name or email
  // online = active in the last 15 minutes
  // z = Zod: describe the shape of data and check it
  // z.enum = must be one of these values
  // .default = the value used when it's left out
  status: z.enum(['all', 'online', 'blocked']).default('all'),
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  // z.number = must be a number
  // .int = must be a whole number
  // .min = at least this many (characters, or this value)
  // .default = the value used when it's left out
  page: z.coerce.number().int().min(1).default(1),
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  // z.number = must be a number
  // .int = must be a whole number
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  // .default = the value used when it's left out
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const blockSchema = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .max = at most this many (characters, or this value)
  // .optional = may be left out
  reason: z.string().trim().max(200).optional(), // for other admins: "chargebacks", "spam reviews"
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
// z.string = must be text
// .min = at least this many (characters, or this value)
export const idParams = z.object({ id: z.string().min(1) });
