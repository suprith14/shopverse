// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';

// Most stores cap how many of one item a customer can buy at once (stops bulk resellers
// and typos like "100" instead of "1").
// export = other files can import this
// const = a name for a value that is never reassigned
export const MAX_QUANTITY_PER_ITEM = 10;

// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.coerce = convert first (e.g. "5" from the URL -> 5), then check
// z.number = must be a number
// .int = must be a whole number
// .min = at least this many (characters, or this value)
// .max = at most this many (characters, or this value)
const quantity = z.coerce.number().int().min(1).max(MAX_QUANTITY_PER_ITEM);

// The client only sends WHICH variant and HOW MANY. Never a price: prices always come
// from the database, so a user can't edit the request to pay less.
// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const addItemSchema = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  variantId: z.string().min(1),
  quantity: quantity.default(1),
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const updateItemSchema = z.object({
  quantity,
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const variantIdParams = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  variantId: z.string().min(1),
});
