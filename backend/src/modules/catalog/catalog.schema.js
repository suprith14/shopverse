// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';

// Query params arrive as strings ("?page=2"), so z.coerce converts them to numbers.
// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const listProductsQuery = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .optional = may be left out
  category: z.string().optional(), // category slug, e.g. "sneakers"
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .max = at most this many (characters, or this value)
  // .optional = may be left out
  q: z.string().trim().max(100).optional(), // full-text search
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .optional = may be left out
  brand: z.string().optional(),
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  // z.number = must be a number
  // .int = must be a whole number
  // .min = at least this many (characters, or this value)
  // .optional = may be left out
  minPrice: z.coerce.number().int().min(0).optional(), // cents
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  // z.number = must be a number
  // .int = must be a whole number
  // .min = at least this many (characters, or this value)
  // .optional = may be left out
  maxPrice: z.coerce.number().int().min(0).optional(), // cents
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  // z.number = must be a number
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  // .optional = may be left out
  minRating: z.coerce.number().min(0).max(5).optional(),
  // No default here: the service picks 'relevance' when searching and 'newest' otherwise.
  // z = Zod: describe the shape of data and check it
  // z.enum = must be one of these values
  // .optional = may be left out
  sort: z.enum(['relevance', 'newest', 'price_asc', 'price_desc', 'rating']).optional(),
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
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const suggestQuery = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .max = at most this many (characters, or this value)
  // .default = the value used when it's left out
  q: z.string().trim().max(100).default(''),
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const productSlugParams = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  slug: z.string().min(1),
});
