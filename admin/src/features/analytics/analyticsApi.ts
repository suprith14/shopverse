import { api } from '@/app/api';
import type { OrderStatus } from '@/types/api';

export type PeriodDays = 7 | 30 | 90;

export interface PeriodTotals {
  revenue: number; // cents
  orders: number;
  averageOrderValue: number; // cents
  customers: number;
  newCustomers: number;
}

export interface Summary {
  days: number;
  current: PeriodTotals;
  previous: PeriodTotals;
  // % change vs the previous period; null when the previous period had nothing to compare.
  change: { revenue: number | null; orders: number | null; averageOrderValue: number | null; customers: number | null };
}

export interface CustomerStats {
  days: number;
  total: number;
  newCustomers: number; // sign-ups in the period
  newChange: number | null; // % vs previous period
  activeNow: number; // last 15 minutes
  activeToday: number; // last 24 hours
  signedIn: number; // valid login session right now
}

export interface SalesPoint { date: string; revenue: number; orders: number }
export interface TopProduct { productId: string; name: string; slug: string; revenue: number; units: number }
export interface CategorySales { category: string; revenue: number; units: number }
export interface LowStockVariant { id: string; sku: string; name: string; stock: number; product: { id: string; name: string } }

// Dashboard data. Every endpoint provides the 'Analytics' tag, so any product or order change
// that invalidates 'Analytics' makes the dashboard numbers refresh.
// One endpoint per widget: they load in parallel, and a slow one doesn't block the others.
export const analyticsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSummary: build.query<Summary, PeriodDays>({
      query: (days) => ({ url: '/admin/analytics/summary', params: { days } }),
      providesTags: ['Analytics'],
    }),
    getSales: build.query<SalesPoint[], PeriodDays>({
      query: (days) => ({ url: '/admin/analytics/sales', params: { days } }),
      transformResponse: (res: { series: SalesPoint[] }) => res.series,
      providesTags: ['Analytics'],
    }),
    getTopProducts: build.query<TopProduct[], PeriodDays>({
      query: (days) => ({ url: '/admin/analytics/top-products', params: { days, limit: 5 } }),
      transformResponse: (res: { items: TopProduct[] }) => res.items,
      providesTags: ['Analytics'],
    }),
    getSalesByCategory: build.query<CategorySales[], PeriodDays>({
      query: (days) => ({ url: '/admin/analytics/sales-by-category', params: { days } }),
      transformResponse: (res: { items: CategorySales[] }) => res.items,
      providesTags: ['Analytics'],
    }),
    getCustomerStats: build.query<CustomerStats, PeriodDays>({
      query: (days) => ({ url: '/admin/analytics/customers', params: { days } }),
      providesTags: ['Analytics'],
      // "Active now" changes by itself as people come and go, so the dashboard polls it (pollingInterval).
    }),
    getOrdersByStatus: build.query<{ status: OrderStatus; count: number }[], void>({
      query: () => '/admin/analytics/orders-by-status',
      transformResponse: (res: { items: { status: OrderStatus; count: number }[] }) => res.items,
      providesTags: ['Analytics'],
    }),
    getLowStock: build.query<{ threshold: number; items: LowStockVariant[] }, void>({
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
