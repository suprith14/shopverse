import 'dotenv/config';
import { z } from 'zod';

// Validate settings once at startup: a missing one stops the server with a clear message.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4100),
  // The CMS's OWN database (not the shop's).
  DATABASE_URL: z
    .string()
    .min(1)
    .refine((url) => URL.canParse(url) && new URL(url).pathname === '/cms', 'must point at the database named cms'),
  // Must be the SAME value as the shop API's JWT_ACCESS_SECRET, so admin tokens are accepted here.
  JWT_ACCESS_SECRET: z.string().min(16),
  // Banner image uploads (Cloudinary). Optional: without them, uploading answers 503 and the
  // rest of the CMS works as usual. Same account as the shop API's profile photos.
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
