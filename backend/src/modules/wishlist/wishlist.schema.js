import { z } from 'zod';

export const productIdParams = z.object({
  productId: z.string().min(1),
});
