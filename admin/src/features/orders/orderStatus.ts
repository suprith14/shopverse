import type { OrderStatus } from '@/types/api';

// Admin wording focuses on what to DO: "Paid" orders are the ones waiting to be shipped.
export const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Awaiting payment', className: 'bg-amber-100 text-amber-800' },
  PAID: { label: 'Paid · to ship', className: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Shipped', className: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-slate-200 text-slate-600' },
  REFUNDED: { label: 'Refunded', className: 'bg-purple-100 text-purple-800' },
};

// Order of the status tabs on the orders page: the work queue first.
export const statusTabs: OrderStatus[] = ['PAID', 'SHIPPED', 'DELIVERED', 'PENDING', 'CANCELLED', 'REFUNDED'];
