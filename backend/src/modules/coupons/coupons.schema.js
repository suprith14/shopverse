import { z } from 'zod';

// Codes are case-insensitive for the customer: " save20 " is the same as "SAVE20".
export const couponCodeQuery = z.object({
  code: z.string().trim().min(1, 'Enter a coupon code').max(32).toUpperCase(),
});
