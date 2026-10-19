// import = bring in code from another file or package
import 'dotenv/config';
// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';

// Validate environment variables once at startup. If something is missing,
// the server fails immediately with a clear message instead of crashing later.
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
const envSchema = z.object({
  // z = Zod: describe the shape of data and check it
  // z.enum = must be one of these values
  // .default = the value used when it's left out
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  // z.number = must be a number
  // .default = the value used when it's left out
  PORT: z.coerce.number().default(4000),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  DATABASE_URL: z.string().min(1),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .default = the value used when it's left out
  CLIENT_URL: z.string().default('http://localhost:5173'),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  JWT_ACCESS_SECRET: z.string().min(16),
  // How many proxies stand in front of this server. Express then reads the visitor's real IP from
  // the X-Forwarded-For header (needed for per-IP rate limits). Must be EXACT: too many and a client
  // can fake its IP by sending that header; too few and every visitor looks like the proxy.
  // Laptop: 0. Render behind Vercel's rewrite: 2 (Vercel + Render's load balancer).
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  // z.number = must be a number
  // .int = must be a whole number
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  // .default = the value used when it's left out
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  // bcrypt work factor: each +1 doubles the time to hash (and to crack) a password. 12 takes ~0.3-2 s.
  // Tests set 4 (a few ms): they only check the login logic, and slow hashing would make them minutes long.
  // z = Zod: describe the shape of data and check it
  // z.coerce = convert first (e.g. "5" from the URL -> 5), then check
  // z.number = must be a number
  // .int = must be a whole number
  // .min = at least this many (characters, or this value)
  // .max = at most this many (characters, or this value)
  // .default = the value used when it's left out
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .regex = must match this pattern
  STRIPE_SECRET_KEY: z.string().regex(/^sk_(test|live)_/, 'must be a Stripe secret key (sk_test_...)'),
  // Proves webhook requests really come from Stripe. Optional so the rest of the app runs
  // without it, but payments can't be confirmed until it's set.
  // z = Zod: describe the shape of data and check it
  STRIPE_WEBHOOK_SECRET: z
    // z.string = must be text
    .string()
    // .regex = must match this pattern
    .regex(/^whsec_/, 'must start with whsec_')
    // .optional = may be left out
    .optional(),
  // Emails. Without an API key, emails are printed to the console instead of sent.
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .regex = must match this pattern
  // .optional = may be left out
  RESEND_API_KEY: z.string().regex(/^re_/, 'must start with re_').optional(),
  // onboarding@resend.dev works without owning a domain. Real stores send from their own domain.
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .default = the value used when it's left out
  EMAIL_FROM: z.string().default('ShopVerse <onboarding@resend.dev>'),
  // Outside production, EVERY email goes to this address instead of the real recipient.
  // z = Zod: describe the shape of data and check it
  // z.email = must look like an email address
  // .optional = may be left out
  EMAIL_DEV_REDIRECT_TO: z.email().optional(),
  // Shared demo accounts (their logins are public in the README): nobody can change their password,
  // reset it, or block/delete them, so the next visitor can still log in. Comma-separated emails.
  // Empty = protect nothing (a real store).
  // Password for the project guide in the store (My account → Project guide). Optional: without it
  // the guide stays locked for everyone.
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  // .optional = may be left out
  GUIDE_PASSWORD: z.string().min(8, 'at least 8 characters').optional(),
  // z = Zod: describe the shape of data and check it
  PROTECTED_ACCOUNTS: z
    // z.string = must be text
    .string()
    // .default = the value used when it's left out
    .default('demo@shopverse.dev,admin@shopverse.dev')
    // .transform = change the value after it passed the checks
    // => = an arrow function (a short function)
    .transform((list) =>
      list
        // .split = cut a string into an array
        .split(',')
        // .map = make a new array by transforming each item
        // => = an arrow function (a short function)
        // .trim = remove spaces at both ends
        // .toLowerCase = the text in small letters
        .map((email) => email.trim().toLowerCase())
        // .filter = keep only the items that pass a test
        .filter(Boolean),
    ),
  // Profile photo uploads (Cloudinary). Optional: without them, photo upload is switched off.
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  // .optional = may be left out
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  // .optional = may be left out
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  // .optional = may be left out
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
});

// const = a name for a value that is never reassigned
// process = the running Node program (process.env = settings, process.exit = stop)
// process.env = settings from the environment (.env locally, the dashboard on Render)
const parsed = envSchema.safeParse(process.env);

// if (...) = run the next part only when the condition is true
// ! = NOT: flips true/false
if (!parsed.success) {
  // console.log / warn / error = print to the server log
  console.error('Invalid environment variables:');
  // const = a name for a value that is never reassigned
  for (const issue of parsed.error.issues) {
    // console.log / warn / error = print to the server log
    // `text ${x}` = a template string: text with values inserted
    // .join = turn an array into one string with a separator
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  // process = the running Node program (process.env = settings, process.exit = stop)
  // process.exit = stop the program (0 = ok, 1 = error)
  process.exit(1);
}

// export = other files can import this
// const = a name for a value that is never reassigned
// env = the checked settings from .env (config/env.js)
export const env = parsed.data;
// export = other files can import this
// const = a name for a value that is never reassigned
// env = the checked settings from .env (config/env.js)
// === = strictly equal (same value AND same type)
export const isProd = env.NODE_ENV === 'production';
