import { z } from 'zod';

// Countries we deliver to, as ISO 3166 codes (what couriers, Stripe and tax tools use).
export const COUNTRIES = ['IN', 'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'SG', 'AE'] as const;

export const MAX_ADDRESSES = 10;

// "+91 98765-43210" -> "+919876543210". Spaces, dashes, dots and brackets are removed first,
// then it must be international (E.164) format: + country code + number, 8 to 15 digits.
const phone = z
  .string()
  .transform((s) => s.replace(/[\s\-().]/g, ''))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, 'Use international format, e.g. +919876543210'));

// "YYYY-MM-DD", in the past, age 13 to 120.
const dateOfBirth = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), 'Not a real date')
  .refine((s) => {
    const age = (Date.now() - Date.parse(`${s}T00:00:00Z`)) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 13 && age <= 120;
  }, 'You must be at least 13 years old');

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: phone.nullable().optional(), // null = remove it
  dateOfBirth: dateOfBirth.nullable().optional(),
});

// Exact postcode rules where we know them, a loose sanity check elsewhere.
const POSTCODE_RULES: Partial<Record<(typeof COUNTRIES)[number], { regex: RegExp; example: string }>> = {
  IN: { regex: /^[1-9]\d{5}$/, example: '560001' },
  US: { regex: /^\d{5}(-\d{4})?$/, example: '94105 or 94105-1234' },
};

const addressFields = z.object({
  label: z.string().trim().max(30).nullable().optional(), // "Home", "Office"
  fullName: z.string().trim().min(2).max(80),
  phone,
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).nullable().optional(),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  postalCode: z.string().trim().toUpperCase().min(3).max(10),
  country: z.enum(COUNTRIES),
});

const checkPostcode = (a: { country?: (typeof COUNTRIES)[number]; postalCode?: string }, ctx: z.RefinementCtx) => {
  const rule = a.country && POSTCODE_RULES[a.country];
  if (rule && a.postalCode && !rule.regex.test(a.postalCode)) {
    ctx.addIssue({ code: 'custom', path: ['postalCode'], message: `Postcode should look like ${rule.example}` });
  }
};

export const createAddressSchema = addressFields
  .extend({ makeDefault: z.boolean().default(false) })
  .superRefine(checkPostcode);

// When editing, country and postcode must be sent together so they can be checked together.
export const updateAddressSchema = addressFields
  .partial()
  .refine((a) => (a.country === undefined) === (a.postalCode === undefined), {
    message: 'Send country and postalCode together',
    path: ['postalCode'],
  })
  .superRefine(checkPostcode);

export const addressIdParams = z.object({ id: z.string().min(1) });

export const saveAvatarSchema = z.object({ url: z.url().max(500) });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
