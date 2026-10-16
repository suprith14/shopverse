import { api } from '@/app/api';
import type { AdminOrderDetail, AdminOrderListItem, OrderStatus, Paginated } from '@/types/api';

export interface OrderListParams {
  status?: OrderStatus;
  q?: string;
  page?: number;
}

const LIST = { type: 'Order' as const, id: 'LIST' };

export const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<Paginated<AdminOrderListItem>, OrderListParams>({
      query: (params) => ({ url: '/admin/orders', params }),
      providesTags: (result) => [LIST, ...(result?.items.map((o) => ({ type: 'Order' as const, id: o.id })) ?? [])],
    }),
    getOrder: build.query<AdminOrderDetail, string>({
      query: (id) => `/admin/orders/${id}`,
      transformResponse: (res: { order: AdminOrderDetail }) => res.order,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    // Order changes also change dashboard numbers (status counts, revenue after refunds).
    updateOrderStatus: build.mutation<AdminOrderDetail, { id: string; status: 'SHIPPED' | 'DELIVERED' }>({
      query: ({ id, status }) => ({ url: `/admin/orders/${id}/status`, method: 'PATCH', body: { status } }),
      transformResponse: (res: { order: AdminOrderDetail }) => res.order,
      invalidatesTags: (_r, _e, { id }) => [LIST, { type: 'Order', id }, 'Analytics'],
    }),
    // A refund with restock puts units back, so product stock is affected too.
    refundOrder: build.mutation<AdminOrderDetail, { id: string; restock: boolean }>({
      query: ({ id, restock }) => ({ url: `/admin/orders/${id}/refund`, method: 'POST', body: { restock } }),
      transformResponse: (res: { order: AdminOrderDetail }) => res.order,
      invalidatesTags: (_r, _e, { id }) => [LIST, { type: 'Order', id }, 'Analytics', { type: 'Product', id: 'LIST' }],
    }),
  }),
});

export const { useGetOrdersQuery, useGetOrderQuery, useUpdateOrderStatusMutation, useRefundOrderMutation } = ordersApi;
