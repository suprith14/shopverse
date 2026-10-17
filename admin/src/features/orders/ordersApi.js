import { api } from '@/app/api';

const LIST = { type: 'Order', id: 'LIST' };

export const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query({
      query: (params) => ({ url: '/admin/orders', params }),
      providesTags: (result) => [LIST, ...(result?.items.map((o) => ({ type: 'Order', id: o.id })) ?? [])],
    }),
    getOrder: build.query({
      query: (id) => `/admin/orders/${id}`,
      transformResponse: (res) => res.order,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    // Order changes also change dashboard numbers (status counts, revenue after refunds).
    updateOrderStatus: build.mutation({
      query: ({ id, status }) => ({ url: `/admin/orders/${id}/status`, method: 'PATCH', body: { status } }),
      transformResponse: (res) => res.order,
      invalidatesTags: (_r, _e, { id }) => [LIST, { type: 'Order', id }, 'Analytics'],
    }),
    // A refund with restock puts units back, so product stock is affected too.
    refundOrder: build.mutation({
      query: ({ id, restock }) => ({ url: `/admin/orders/${id}/refund`, method: 'POST', body: { restock } }),
      transformResponse: (res) => res.order,
      invalidatesTags: (_r, _e, { id }) => [LIST, { type: 'Order', id }, 'Analytics', { type: 'Product', id: 'LIST' }],
    }),
  }),
});

export const { useGetOrdersQuery, useGetOrderQuery, useUpdateOrderStatusMutation, useRefundOrderMutation } = ordersApi;
