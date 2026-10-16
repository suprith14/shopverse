import { z } from 'zod';

// The client sends only an optional coupon code. Items, prices and totals are all
// taken from the user's cart in the database.
export const createOrderSchema = z.object({
  couponCode: z.string().trim().max(32).toUpperCase().optional(),
});

export const orderIdParams = z.object({
  id: z.string().min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
