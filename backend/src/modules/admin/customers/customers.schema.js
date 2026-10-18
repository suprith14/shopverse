import { z } from 'zod';

export const listCustomersQuery = z.object({
  q: z.string().trim().max(100).optional(), // name or email
  // online = active in the last 15 minutes
  status: z.enum(['all', 'online', 'blocked']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const blockSchema = z.object({
  reason: z.string().trim().max(200).optional(), // for other admins: "chargebacks", "spam reviews"
});

export const idParams = z.object({ id: z.string().min(1) });
