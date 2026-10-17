import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/auth.store';

export function useReviews(productId, page) {
  return useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: async () => (await api.get(`/reviews/product/${productId}`, { params: { page } })).data,
    placeholderData: keepPreviousData, // keep the old page visible while the next one loads
  });
}

export function useMyReview(productId) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['my-review', userId, productId],
    queryFn: async () => (await api.get(`/reviews/product/${productId}/mine`)).data,
    enabled: !!userId,
  });
}

// A review changes more than the review list: the product's average and count change too,
// and those are shown on the product page and on every product card in the shop.
// So after saving we mark all of them as stale and React Query refetches what's on screen.
function useRefreshAfterReviewChange(productId) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    queryClient.invalidateQueries({ queryKey: ['my-review'] });
    queryClient.invalidateQueries({ queryKey: ['product'] }); // product page stars
    queryClient.invalidateQueries({ queryKey: ['products'] }); // shop grid stars + "Top rated" sort
  };
}

export function useSaveReview(productId) {
  const refresh = useRefreshAfterReviewChange(productId);
  return useMutation({
    mutationFn: async (input) => (await api.put(`/reviews/product/${productId}/mine`, input)).data.review,
    onSuccess: refresh,
  });
}

export function useDeleteReview(productId) {
  const refresh = useRefreshAfterReviewChange(productId);
  return useMutation({
    mutationFn: async () => api.delete(`/reviews/product/${productId}/mine`),
    onSuccess: refresh,
  });
}
