// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';

// One password rule for sign-up and password changes.
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.string = must be text
// .min = at least this many (characters, or this value)
// .max = at most this many (characters, or this value)
const password = z.string().min(8, 'Password must be at least 8 characters').max(100);

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const registerSchema = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .trim = remove spaces at both ends before checking
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  name: z.string().trim().min(2).max(60),
  // z = Zod: describe the shape of data and check it
  // z.email = must look like an email address
  // .toLowerCase = convert to small letters (emails)
  email: z.email().toLowerCase(),
  password,
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const loginSchema = z.object({
  // z = Zod: describe the shape of data and check it
  // z.email = must look like an email address
  // .toLowerCase = convert to small letters (emails)
  email: z.email().toLowerCase(),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  password: z.string().min(1),
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
export const changePasswordSchema = z
  // z.object = an object with these fields
  .object({
    // z = Zod: describe the shape of data and check it
    // z.string = must be text
    // .min = at least this many (characters, or this value)
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: password,
  })
  // .refine = a custom check written as a function
  // => = an arrow function (a short function)
  // !== = not strictly equal
  .refine((v) => v.currentPassword !== v.newPassword, {
    // path = the cookie is only sent to URLs under this path
    path: ['newPassword'],
    message: 'The new password must be different from the current one',
  });

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const forgotPasswordSchema = z.object({
  // z = Zod: describe the shape of data and check it
  // z.email = must look like an email address
  // .toLowerCase = convert to small letters (emails)
  email: z.email().toLowerCase(),
});

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const resetPasswordSchema = z.object({
  // z = Zod: describe the shape of data and check it
  // z.email = must look like an email address
  // .toLowerCase = convert to small letters (emails)
  email: z.email().toLowerCase(),
  // z = Zod: describe the shape of data and check it
  code: z
    // z.string = must be text
    .string()
    // .trim = remove spaces at both ends before checking
    .trim()
    // .regex = must match this pattern
    .regex(/^\d{6}$/, 'Enter the 6-digit code from the email'),
  newPassword: password,
});
