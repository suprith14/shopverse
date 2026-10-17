import { z } from 'zod';

// Most stores cap how many of one item a customer can buy at once (stops bulk resellers
// and typos like "100" instead of "1").
export const MAX_QUANTITY_PER_ITEM = 10;

const quantity = z.coerce.number().int().min(1).max(MAX_QUANTITY_PER_ITEM);

// The client only sends WHICH variant and HOW MANY. Never a price: prices always come
// from the database, so a user can't edit the request to pay less.
export const addItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: quantity.default(1),
});

export const updateItemSchema = z.object({
  quantity,
});

export const variantIdParams = z.object({
  variantId: z.string().min(1),
});
