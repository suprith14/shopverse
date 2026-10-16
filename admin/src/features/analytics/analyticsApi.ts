import { api } from '@/app/api';
import type { OrderStatus } from '@/types/api';

// Dashboard data. Every endpoint provides the 'Analytics' tag, so any product or order change
// that invalidates 'Analytics' makes the dashboard numbers refresh.
export const analyticsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrdersByStatus: build.query<{ status: OrderStatus; count: number }[], void>({
      query: () => '/admin/analytics/orders-by-status',
      transformResponse: (res: { items: { status: OrderStatus; count: number }[] }) => res.items,
      providesTags: ['Analytics'],
    }),
  }),
});

export const { useGetOrdersByStatusQuery } = analyticsApi;
