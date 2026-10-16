import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Cart } from '@/types/api';
import { useAuthStore } from '@/features/auth/auth.store';

// The cart is server state: the backend is the source of truth, React Query keeps a copy.
// The query key includes the user id, so after logging in as someone else we never
// show the previous user's cart from the cache.
function useCartKey() {
  const userId = useAuthStore((s) => s.user?.id);
  return ['cart', userId] as const;
}

export function useCart() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: useCartKey(),
    queryFn: async () => (await api.get<{ cart: Cart }>('/cart')).data.cart,
    enabled: status === 'authenticated', // guests have no cart, don't call the API
  });
}

// Every cart endpoint returns the full, updated cart. We put it straight into the cache,
// so the page and the header badge update without another GET request.
function useCartMutation<TInput>(request: (input: TInput) => Promise<{ data: { cart: Cart } }>) {
  const queryClient = useQueryClient();
  const key = useCartKey();
  return useMutation({
    mutationFn: async (input: TInput) => (await request(input)).data.cart,
    onSuccess: (cart) => queryClient.setQueryData(key, cart),
  });
}

export function useAddToCart() {
  return useCartMutation((input: { variantId: string; quantity?: number }) => api.post('/cart/items', input));
}

export function useClearCart() {
  return useCartMutation(() => api.delete('/cart'));
}

// Optimistic update: change the screen immediately, THEN tell the server.
// If the server says no (e.g. "Only 2 left"), roll back to what it was before.
// This makes +/- buttons feel instant even on a slow connection.
function useOptimisticCartMutation<TInput extends { variantId: string }>(
  request: (input: TInput) => Promise<{ data: { cart: Cart } }>,
  applyLocally: (cart: Cart, input: TInput) => Cart,
) {
  const queryClient = useQueryClient();
  const key = useCartKey();
  return useMutation({
    mutationFn: async (input: TInput) => (await request(input)).data.cart,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key }); // stop a refetch from overwriting our change
      const previous = queryClient.getQueryData<Cart>(key);
      if (previous) queryClient.setQueryData(key, applyLocally(previous, input));
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (cart) => queryClient.setQueryData(key, cart), // server's answer is the final truth
  });
}

// Recalculates the totals after a local change (the server does the same on its side).
function withTotals(items: Cart['items']): Cart {
  return {
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: items.filter((i) => !i.issue).reduce((sum, i) => sum + i.lineTotal, 0),
    hasIssues: items.some((i) => i.issue),
  };
}

export function useUpdateCartItem() {
  return useOptimisticCartMutation(
    ({ variantId, quantity }: { variantId: string; quantity: number }) =>
      api.patch(`/cart/items/${variantId}`, { quantity }),
    (cart, { variantId, quantity }) =>
      withTotals(cart.items.map((i) => (i.variantId === variantId ? { ...i, quantity, lineTotal: i.unitPrice * quantity } : i))),
  );
}

export function useRemoveCartItem() {
  return useOptimisticCartMutation(
    ({ variantId }: { variantId: string }) => api.delete(`/cart/items/${variantId}`),
    (cart, { variantId }) => withTotals(cart.items.filter((i) => i.variantId !== variantId)),
  );
}
