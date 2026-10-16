import { z } from 'zod';

// Query params arrive as strings ("?page=2"), so z.coerce converts them to numbers.
export const listProductsQuery = z.object({
  category: z.string().optional(), // category slug, e.g. "sneakers"
  q: z.string().trim().max(100).optional(), // full-text search
  brand: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(), // cents
  maxPrice: z.coerce.number().int().min(0).optional(), // cents
  minRating: z.coerce.number().min(0).max(5).optional(),
  // No default here: the service picks 'relevance' when searching and 'newest' otherwise.
  sort: z.enum(['relevance', 'newest', 'price_asc', 'price_desc', 'rating']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export const suggestQuery = z.object({
  q: z.string().trim().max(100).default(''),
});

export const productSlugParams = z.object({
  slug: z.string().min(1),
});

export type ListProductsQuery = z.infer<typeof listProductsQuery>;
