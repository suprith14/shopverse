import { z } from 'zod';

export const listAdminOrdersQuery = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  q: z.string().trim().max(100).optional(), // order number, customer name or email
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Admins move orders forward by hand. PAID and CANCELLED are set only by the payment flow
// (webhook / expiry job), and REFUNDED only by the refund endpoint.
export const updateStatusSchema = z.object({
  status: z.enum(['SHIPPED', 'DELIVERED']),
});

export const refundSchema = z.object({
  // true = the items came back and can be sold again.
  restock: z.boolean().default(false),
});

export const idParams = z.object({ id: z.string().min(1) });
