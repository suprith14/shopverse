import { z } from 'zod';

// The client sends only an optional coupon code. Items, prices and totals are all
// taken from the user's cart in the database.
export const createOrderSchema = z.object({
  couponCode: z.string().trim().max(32).toUpperCase().optional(),
  // Which saved address to ship to. Only the id is sent: the server loads the address,
  // checks it belongs to this user, and copies it into the order.
  addressId: z.string({ error: 'Choose a delivery address' }).min(1, 'Choose a delivery address'),
});

export const orderIdParams = z.object({
  id: z.string().min(1),
});
