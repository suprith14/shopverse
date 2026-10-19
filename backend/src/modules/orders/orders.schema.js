// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';

// The client sends only an optional coupon code. Items, prices and totals are all
// taken from the user's cart in the database.
// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const createOrderSchema = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .max = at most this many (characters, or this value)
  // .toUpperCase = the text in capital letters
  // .optional = may be left out
  couponCode: z.string().trim().max(32).toUpperCase().optional(),
  // Which saved address to ship to. Only the id is sent: the server loads the address,
  // checks it belongs to this user, and copies it into the order.
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  addressId: z.string({ error: 'Choose a delivery address' }).min(1, 'Choose a delivery address'),
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const orderIdParams = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  id: z.string().min(1),
});
