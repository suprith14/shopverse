// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';

// const = a name for a value that is never reassigned
const variantFields = {
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  // .toUpperCase = the text in capital letters
  sku: z.string().trim().min(1).max(64).toUpperCase(), // stock-keeping unit, e.g. "NIKE-ASR-9-BLK"
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  name: z.string().trim().min(1).max(80), // shown to customers, e.g. "UK 9 / Black"
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  // z.number = must be a number
  // .int = must be a whole number
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  price: z.coerce.number().int().min(1, 'Price must be at least 1 cent').max(10_000_000), // cents
  // z = Zod: describe the shape of data and check it
  // z.record = an object with any keys, values of this type
  // z.string = must be text
  // .default = the value used when it's left out
  options: z.record(z.string(), z.string()).default({}), // e.g. { size: "9", color: "Black" }
};

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const variantSchema = z.object({
  // ...x = spread: copy all items/properties of x into here
  ...variantFields,
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  // z.number = must be a number
  // .int = must be a whole number
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  // .default = the value used when it's left out
  stock: z.coerce.number().int().min(0).max(100_000).default(0),
});

// const = a name for a value that is never reassigned
const productFields = {
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  name: z.string().trim().min(2).max(120),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  description: z.string().trim().min(10).max(5000),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .max = at most this many (characters, or this value)
  // .nullable = may be null
  // .optional = may be left out
  brand: z.string().trim().max(60).nullable().optional(),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  categoryId: z.string().min(1),
  // z = Zod: describe the shape of data and check it
  // z.array = a list of items of this type
  // z.url = must be a valid URL
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  images: z.array(z.url()).min(1, 'Add at least one image').max(8),
  // z = Zod: describe the shape of data and check it
  // z.record = an object with any keys, values of this type
  // z.string = must be text
  // z.unknown = anything (checked later)
  // .default = the value used when it's left out
  attributes: z.record(z.string(), z.unknown()).default({}), // category-specific details
  // z = Zod: describe the shape of data and check it
  // z.boolean = must be true/false
  // .default = the value used when it's left out
  isActive: z.boolean().default(true),
};

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const createProductSchema = z.object({
  // ...x = spread: copy all items/properties of x into here
  ...productFields,
  // z = Zod: describe the shape of data and check it
  // z.array = a list of items of this type
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  variants: z.array(variantSchema).min(1, 'A product needs at least one variant').max(50),
});

// Every product field is optional when editing. Variants have their own endpoints.
// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
// .partial = every field becomes optional (for "update some fields")
export const updateProductSchema = z.object(productFields).partial();

// Price and name only. Stock is changed with an adjustment (below), never overwritten.
// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
// .omit = the same object without these fields
// .partial = every field becomes optional (for "update some fields")
export const updateVariantSchema = z.object(variantFields).omit({ sku: true }).partial();

// Stock is changed by a DELTA ("received 10", "2 damaged"), not set to a number.
// Setting stock = 50 could wipe out a customer's purchase that happened a second earlier;
// adding +10 to whatever the current value is can't.
// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const stockAdjustmentSchema = z.object({
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  delta: z.coerce
    // z.number = must be a number
    .number()
    // .int = must be a whole number
    .int()
    // .min = at least this many (characters, or this value)
    .min(-100_000)
    // .max = at most this many (characters, or this value)
    .max(100_000)
    // .refine = a custom check written as a function
    // => = an arrow function (a short function)
    // !== = not strictly equal
    .refine((d) => d !== 0, 'Change must not be 0'),
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const listAdminProductsQuery = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .max = at most this many (characters, or this value)
  // .optional = may be left out
  q: z.string().trim().max(100).optional(), // name, brand or SKU
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .optional = may be left out
  category: z.string().optional(), // slug
  // z = Zod: describe the shape of data and check it
  // z.enum = must be one of these values
  // .default = the value used when it's left out
  status: z.enum(['all', 'active', 'hidden']).default('all'),
  // z = Zod: describe the shape of data and check it
  lowStock: z
    // z.enum = must be one of these values
    .enum(['true', 'false'])
    // .transform = change the value after it passed the checks
    // => = an arrow function (a short function)
    // === = strictly equal (same value AND same type)
    .transform((v) => v === 'true')
    // .optional = may be left out
    .optional(),
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
// z.string = must be text
// .min = at least this many (characters, or this value)
export const idParams = z.object({ id: z.string().min(1) });
// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
// z.string = must be text
// .min = at least this many (characters, or this value)
export const variantIdParams = z.object({ variantId: z.string().min(1) });
