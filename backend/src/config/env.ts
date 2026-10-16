import 'dotenv/config';
import { z } from 'zod';

// Validate environment variables once at startup. If something is missing,
// the server fails immediately with a clear message instead of crashing later.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().min(16),
  STRIPE_SECRET_KEY: z.string().regex(/^sk_(test|live)_/, 'must be a Stripe secret key (sk_test_...)'),
  // Proves webhook requests really come from Stripe. Optional so the rest of the app runs
  // without it, but payments can't be confirmed until it's set.
  STRIPE_WEBHOOK_SECRET: z.string().regex(/^whsec_/, 'must start with whsec_').optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
