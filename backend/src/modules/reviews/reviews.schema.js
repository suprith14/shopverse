import { z } from 'zod';

export const productIdParams = z.object({
  productId: z.string().min(1),
});

export const listReviewsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Pick 1 to 5 stars').max(5, 'Pick 1 to 5 stars'),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100),
  body: z.string().trim().min(10, 'Review must be at least 10 characters').max(2000),
});
