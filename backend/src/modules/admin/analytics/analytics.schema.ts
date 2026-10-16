import { z } from 'zod';

// The dashboard's period selector: last 7 / 30 / 90 days.
export const periodQuery = z.object({
  days: z.coerce.number().int().refine((d) => [7, 30, 90].includes(d), 'days must be 7, 30 or 90').default(30),
});

export const topProductsQuery = periodQuery.extend({
  limit: z.coerce.number().int().min(1).max(20).default(5),
});
