import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Category, Paginated, ProductDetail, ProductSummary } from '@/types/api';

export interface ProductFilters {
  category?: string;
  q?: string;
  brand?: string;
  minPrice?: number; // cents
  maxPrice?: number; // cents
  minRating?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
}

// React Query caches each response by its queryKey. Same filters = instant result from
// cache; different filters = new request. Data stays "fresh" for 1 min (set in main.tsx).

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<{ categories: Category[] }>('/catalog/categories')).data.categories,
    staleTime: 10 * 60 * 1000, // categories rarely change
  });
}

export function useBrands(category?: string) {
  return useQuery({
    queryKey: ['brands', category ?? 'all'],
    queryFn: async () => (await api.get<{ brands: string[] }>('/catalog/brands', { params: { category } })).data.brands,
  });
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => (await api.get<Paginated<ProductSummary>>('/catalog/products', { params: filters })).data,
    // Keep showing the previous page while the next one loads (no flicker when paginating).
    placeholderData: keepPreviousData,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await api.get<{ product: ProductDetail }>(`/catalog/products/${slug}`)).data.product,
  });
}
