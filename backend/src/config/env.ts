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
  // How many proxies stand in front of this server. Express then reads the visitor's real IP from
  // the X-Forwarded-For header (needed for per-IP rate limits). Must be EXACT: too many and a client
  // can fake its IP by sending that header; too few and every visitor looks like the proxy.
  // Laptop: 0. Render behind Vercel's rewrite: 2 (Vercel + Render's load balancer).
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  STRIPE_SECRET_KEY: z.string().regex(/^sk_(test|live)_/, 'must be a Stripe secret key (sk_test_...)'),
  // Proves webhook requests really come from Stripe. Optional so the rest of the app runs
  // without it, but payments can't be confirmed until it's set.
  STRIPE_WEBHOOK_SECRET: z.string().regex(/^whsec_/, 'must start with whsec_').optional(),
  // Emails. Without an API key, emails are printed to the console instead of sent.
  RESEND_API_KEY: z.string().regex(/^re_/, 'must start with re_').optional(),
  // onboarding@resend.dev works without owning a domain. Real stores send from their own domain.
  EMAIL_FROM: z.string().default('ShopVerse <onboarding@resend.dev>'),
  // Outside production, EVERY email goes to this address instead of the real recipient.
  EMAIL_DEV_REDIRECT_TO: z.email().optional(),
  // Profile photo uploads (Cloudinary). Optional: without them, photo upload is switched off.
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
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
