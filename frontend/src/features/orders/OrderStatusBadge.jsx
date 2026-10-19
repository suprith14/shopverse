// The coloured pill showing an order's state: Awaiting payment, Paid, Shipped, Delivered...
// Colour + text together (never colour alone), so it's readable without seeing colour.

import { useTranslation } from 'react-i18next';
// Colours per status. They have dark-mode versions too (index.css).
// Labels: orders.status.* (i18n)
const styles = {
  PENDING: 'bg-amber-100 text-amber-800',
  PAID: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-slate-200 text-slate-800',
  CANCELLED: 'bg-slate-100 text-slate-500',
  REFUNDED: 'bg-purple-100 text-purple-800',
};

export function OrderStatusBadge({ status }) {
  const { t } = useTranslation();
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {t(`orders.status.${status}`)}
    </span>
  );
}
