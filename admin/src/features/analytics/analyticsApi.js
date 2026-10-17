import { api } from '@/app/api';

// Dashboard data. Every endpoint provides the 'Analytics' tag, so any product or order change
// that invalidates 'Analytics' makes the dashboard numbers refresh.
// One endpoint per widget: they load in parallel, and a slow one doesn't block the others.
export const analyticsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSummary: build.query({
      query: (days) => ({ url: '/admin/analytics/summary', params: { days } }),
      providesTags: ['Analytics'],
    }),
    getSales: build.query({
      query: (days) => ({ url: '/admin/analytics/sales', params: { days } }),
      transformResponse: (res) => res.series,
      providesTags: ['Analytics'],
    }),
    getTopProducts: build.query({
      query: (days) => ({ url: '/admin/analytics/top-products', params: { days, limit: 5 } }),
      transformResponse: (res) => res.items,
      providesTags: ['Analytics'],
    }),
    getSalesByCategory: build.query({
      query: (days) => ({ url: '/admin/analytics/sales-by-category', params: { days } }),
      transformResponse: (res) => res.items,
      providesTags: ['Analytics'],
    }),
    getCustomerStats: build.query({
      query: (days) => ({ url: '/admin/analytics/customers', params: { days } }),
      providesTags: ['Analytics'],
      // "Active now" changes by itself as people come and go, so the dashboard polls it (pollingInterval).
    }),
    getOrdersByStatus: build.query({
      query: () => '/admin/analytics/orders-by-status',
      transformResponse: (res) => res.items,
      providesTags: ['Analytics'],
    }),
    getLowStock: build.query({
      query: () => '/admin/analytics/low-stock',
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetSummaryQuery,
  useGetSalesQuery,
  useGetTopProductsQuery,
  useGetSalesByCategoryQuery,
  useGetOrdersByStatusQuery,
  useGetCustomerStatsQuery,
  useGetLowStockQuery,
} = analyticsApi;
