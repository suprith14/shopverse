// Orders: my list, one order, place an order, pay, cancel.
// How these *.api.js files work (TanStack Query):
//   useQuery    = READ data. queryKey names the data in the cache; the same key anywhere = the same
//                 cached answer, fetched once. enabled: false = don't ask yet (e.g. not logged in).
//   useMutation = CHANGE data (POST/PUT/DELETE). onSuccess updates or refreshes ("invalidates")
//                 the cached queries, so every screen showing that data updates by itself.
// The user id is part of the key, so one user's cached data is never shown to the next.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/auth.store';

function useUserId() {
  return useAuthStore((s) => s.user?.id);
}

// My orders, newest first (the server only returns this user's orders)
export function useOrders() {
  const userId = useUserId();
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => (await api.get('/orders')).data.orders,
    enabled: !!userId,
  });
}

// `waitForPayment`: the customer just came back from Stripe. The webhook usually arrives
// within a second or two, so while the order is still PENDING we ask again every 2 seconds.
export function useOrder(id, waitForPayment = false) {
  const userId = useUserId();
  return useQuery({
    queryKey: ['order', userId, id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data.order,
    enabled: !!userId,
    refetchInterval: (query) => (waitForPayment && query.state.data?.status === 'PENDING' ? 2000 : false),
  });
}

// "Place order": the backend creates the order and a Stripe payment page,
// then we send the browser to Stripe. (A full page navigation, Stripe is another website.)
export function usePlaceOrder() {
  return useMutation({
    mutationFn: async (input) => (await api.post('/orders', input)).data,
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
  });
}

// "Pay now" on an unpaid order: reopens the same Stripe page.
export function usePayOrder() {
  return useMutation({
    mutationFn: async (id) => (await api.post(`/orders/${id}/pay`)).data,
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
  });
}

// Cancel an unpaid order: the stock goes back. The answer updates the cached order directly.
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const userId = useUserId();
  return useMutation({
    mutationFn: async (id) => (await api.post(`/orders/${id}/cancel`)).data.order,
    onSuccess: (order) => {
      queryClient.setQueryData(['order', userId, order.id], order);
      queryClient.invalidateQueries({ queryKey: ['orders', userId] });
    },
  });
}
