import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/auth.store';

// Same idea as the cart: server state cached per user.
function useWishlistKey() {
  const userId = useAuthStore((s) => s.user?.id);
  return ['wishlist', userId];
}

export function useWishlist() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: useWishlistKey(),
    queryFn: async () => (await api.get('/wishlist')).data.items,
    enabled: status === 'authenticated',
  });
}

// A Set of saved product ids, so every heart button can check "is this saved?" instantly.
export function useWishlistIds() {
  const { data } = useWishlist();
  return useMemo(() => new Set(data?.map((entry) => entry.product.id)), [data]);
}

// Toggle pattern: one hook for both "save" and "unsave".
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const key = useWishlistKey();
  return useMutation({
    mutationFn: async ({ productId, save }) => {
      const request = save ? api.put(`/wishlist/${productId}`) : api.delete(`/wishlist/${productId}`);
      return (await request).data.items;
    },
    onSuccess: (items) => queryClient.setQueryData(key, items),
  });
}
