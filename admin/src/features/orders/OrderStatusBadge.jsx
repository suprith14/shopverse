import { statusStyles } from './orderStatus';

export function OrderStatusBadge({ status }) {
  const { label, className } = statusStyles[status];
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
  );
}
