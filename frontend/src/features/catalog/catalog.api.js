import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

// React Query caches each response by its queryKey. Same filters = instant result from
// cache; different filters = new request. Data stays "fresh" for 1 min (set in main.tsx).

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/catalog/categories')).data.categories,
    staleTime: 10 * 60 * 1000, // categories rarely change
  });
}

// Products + facet counts for the sidebar and tabs, all in one response.
export function useProducts(filters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => (await api.get('/catalog/products', { params: filters })).data,
    // Keep showing the previous page while the next one loads (no flicker when paginating).
    placeholderData: keepPreviousData,
  });
}

// Search-as-you-type. Called with an already-debounced query (see SearchBox).
export function useSuggestions(q) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: ['suggest', trimmed],
    queryFn: async ({ signal }) =>
      // `signal` cancels the request if the user keeps typing and this result is no longer needed.
      (await api.get('/catalog/suggest', { params: { q: trimmed }, signal })).data,
    enabled: trimmed.length >= 2,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData, // keep old suggestions visible instead of flashing empty
  });
}

export function useProduct(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await api.get(`/catalog/products/${slug}`)).data.product,
  });
}
