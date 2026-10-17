const styles = {
  PENDING: { label: 'Awaiting payment', className: 'bg-amber-100 text-amber-800' },
  PAID: { label: 'Paid', className: 'bg-green-100 text-green-800' },
  SHIPPED: { label: 'Shipped', className: 'bg-blue-100 text-blue-800' },
  DELIVERED: { label: 'Delivered', className: 'bg-slate-200 text-slate-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-slate-100 text-slate-500' },
  REFUNDED: { label: 'Refunded', className: 'bg-purple-100 text-purple-800' },
};

export function OrderStatusBadge({ status }) {
  const { label, className } = styles[status];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{label}</span>;
}
