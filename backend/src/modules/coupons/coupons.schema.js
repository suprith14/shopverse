// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';

// Codes are case-insensitive for the customer: " save20 " is the same as "SAVE20".
// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const couponCodeQuery = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  // .toUpperCase = the text in capital letters
  code: z.string().trim().min(1, 'Enter a coupon code').max(32).toUpperCase(),
});
