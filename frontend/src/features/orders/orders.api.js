import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/auth.store';

function useUserId() {
  return useAuthStore((s) => s.user?.id);
}

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
