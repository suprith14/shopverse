// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const listAdminOrdersQuery = z.object({
  // z = Zod: describe the shape of data and check it
  // z.enum = must be one of these values
  // .optional = may be left out
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .max = at most this many (characters, or this value)
  // .optional = may be left out
  q: z.string().trim().max(100).optional(), // order number, customer name or email
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

// Admins move orders forward by hand. PAID and CANCELLED are set only by the payment flow
// (webhook / expiry job), and REFUNDED only by the refund endpoint.
// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const updateStatusSchema = z.object({
  // z = Zod: describe the shape of data and check it
  // z.enum = must be one of these values
  status: z.enum(['SHIPPED', 'DELIVERED']),
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const refundSchema = z.object({
  // true = the items came back and can be sold again.
  // z = Zod: describe the shape of data and check it
  // z.boolean = must be true/false
  // .default = the value used when it's left out
  restock: z.boolean().default(false),
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
// z.string = must be text
// .min = at least this many (characters, or this value)
export const idParams = z.object({ id: z.string().min(1) });
