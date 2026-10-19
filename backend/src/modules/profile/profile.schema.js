// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';

// Countries we deliver to, as ISO 3166 codes (what couriers, Stripe and tax tools use).
// export = other files can import this
// const = a name for a value that is never reassigned
export const COUNTRIES = ['IN', 'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'SG', 'AE'];

// export = other files can import this
// const = a name for a value that is never reassigned
export const MAX_ADDRESSES = 10;

// "+91 98765-43210" -> "+919876543210". Spaces, dashes, dots and brackets are removed first,
// then it must be international (E.164) format: + country code + number, 8 to 15 digits.
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
const phone = z
  // z.string = must be text
  .string()
  // .transform = change the value after it passed the checks
  // => = an arrow function (a short function)
  .transform((s) => s.replace(/[\s\-().]/g, ''))
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .regex = must match this pattern
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, 'Use international format, e.g. +919876543210'));

// "YYYY-MM-DD", in the past, age 13 to 120.
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
const dateOfBirth = z
  // z.string = must be text
  .string()
  // .regex = must match this pattern
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  // .refine = a custom check written as a function
  // => = an arrow function (a short function)
  // ! = NOT: flips true/false
  // Date = a point in time (Date.now() = milliseconds since 1970)
  // `text ${x}` = a template string: text with values inserted
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), 'Not a real date')
  // .refine = a custom check written as a function
  // => = an arrow function (a short function)
  .refine((s) => {
    // const = a name for a value that is never reassigned
    // Date = a point in time (Date.now() = milliseconds since 1970)
    // `text ${x}` = a template string: text with values inserted
    const age = (Date.now() - Date.parse(`${s}T00:00:00Z`)) / (365.25 * 24 * 60 * 60 * 1000);
    // return = give this value back and stop the function here
    // a && b = AND; in JSX: show b only when a is true
    return age >= 13 && age <= 120;
  }, 'You must be at least 13 years old');

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const updateProfileSchema = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  // .optional = may be left out
  name: z.string().trim().min(2).max(80).optional(),
  phone: phone.nullable().optional(), // null = remove it
  dateOfBirth: dateOfBirth.nullable().optional(),
});

// Exact postcode rules where we know them, a loose sanity check elsewhere.
// const = a name for a value that is never reassigned
const POSTCODE_RULES = {
  IN: { regex: /^[1-9]\d{5}$/, example: '560001' },
  US: { regex: /^\d{5}(-\d{4})?$/, example: '94105 or 94105-1234' },
};

// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
const addressFields = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .max = at most this many (characters, or this value)
  // .nullable = may be null
  // .optional = may be left out
  label: z.string().trim().max(30).nullable().optional(), // "Home", "Office"
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  fullName: z.string().trim().min(2).max(80),
  phone,
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  line1: z.string().trim().min(3).max(120),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .max = at most this many (characters, or this value)
  // .nullable = may be null
  // .optional = may be left out
  line2: z.string().trim().max(120).nullable().optional(),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  city: z.string().trim().min(2).max(60),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  state: z.string().trim().min(2).max(60),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .toUpperCase = the text in capital letters
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  postalCode: z.string().trim().toUpperCase().min(3).max(10),
  // z = Zod: describe the shape of data and check it
  // z.enum = must be one of these values
  country: z.enum(COUNTRIES),
});

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const checkPostcode = (a, ctx) => {
  // const = a name for a value that is never reassigned
  // a && b = AND; in JSX: show b only when a is true
  // obj[key] = read the property whose name is stored in key
  const rule = a.country && POSTCODE_RULES[a.country];
  // if (...) = run the next part only when the condition is true
  // a && b = AND; in JSX: show b only when a is true
  // ! = NOT: flips true/false
  if (rule && a.postalCode && !rule.regex.test(a.postalCode)) {
    // path = the cookie is only sent to URLs under this path
    // `text ${x}` = a template string: text with values inserted
    ctx.addIssue({ code: 'custom', path: ['postalCode'], message: `Postcode should look like ${rule.example}` });
  }
};

// export = other files can import this
// const = a name for a value that is never reassigned
export const createAddressSchema = addressFields
  // z = Zod: describe the shape of data and check it
  // z.boolean = must be true/false
  // .default = the value used when it's left out
  .extend({ makeDefault: z.boolean().default(false) })
  .superRefine(checkPostcode);

// When editing, country and postcode must be sent together so they can be checked together.
// export = other files can import this
// const = a name for a value that is never reassigned
export const updateAddressSchema = addressFields
  .partial()
  // => = an arrow function (a short function)
  // === = strictly equal (same value AND same type)
  .refine((a) => (a.country === undefined) === (a.postalCode === undefined), {
    message: 'Send country and postalCode together',
    // path = the cookie is only sent to URLs under this path
    path: ['postalCode'],
  })
  .superRefine(checkPostcode);

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
// z.string = must be text
// .min = at least this many (characters, or this value)
export const addressIdParams = z.object({ id: z.string().min(1) });

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
// z.url = must be a valid URL
// .max = at most this many (characters, or this value)
export const saveAvatarSchema = z.object({ url: z.url().max(500) });
