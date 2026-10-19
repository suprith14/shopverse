import { z } from 'zod';

const variantFields = {
  sku: z.string().trim().min(1).max(64).toUpperCase(), // stock-keeping unit, e.g. "NIKE-ASR-9-BLK"
  name: z.string().trim().min(1).max(80), // shown to customers, e.g. "UK 9 / Black"
  price: z.coerce.number().int().min(1, 'Price must be at least 1 cent').max(10_000_000), // cents
  options: z.record(z.string(), z.string()).default({}), // e.g. { size: "9", color: "Black" }
};

export const variantSchema = z.object({
  ...variantFields,
  stock: z.coerce.number().int().min(0).max(100_000).default(0),
});

const productFields = {
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(5000),
  brand: z.string().trim().max(60).nullable().optional(),
  categoryId: z.string().min(1),
  images: z.array(z.url()).min(1, 'Add at least one image').max(8),
  attributes: z.record(z.string(), z.unknown()).default({}), // category-specific details
  isActive: z.boolean().default(true),
};

export const createProductSchema = z.object({
  ...productFields,
  variants: z.array(variantSchema).min(1, 'A product needs at least one variant').max(50),
});

// Every product field is optional when editing. Variants have their own endpoints.
export const updateProductSchema = z.object(productFields).partial();

// Price and name only. Stock is changed with an adjustment (below), never overwritten.
export const updateVariantSchema = z.object(variantFields).omit({ sku: true }).partial();

// Stock is changed by a DELTA ("received 10", "2 damaged"), not set to a number.
// Setting stock = 50 could wipe out a customer's purchase that happened a second earlier;
// adding +10 to whatever the current value is can't.
export const stockAdjustmentSchema = z.object({
  delta: z.coerce
    .number()
    .int()
    .min(-100_000)
    .max(100_000)
    .refine((d) => d !== 0, 'Change must not be 0'),
});

export const listAdminProductsQuery = z.object({
  q: z.string().trim().max(100).optional(), // name, brand or SKU
  category: z.string().optional(), // slug
  status: z.enum(['all', 'active', 'hidden']).default('all'),
  lowStock: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParams = z.object({ id: z.string().min(1) });
export const variantIdParams = z.object({ variantId: z.string().min(1) });
