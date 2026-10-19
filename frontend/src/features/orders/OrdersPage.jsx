import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatDate, formatPrice } from '@/lib/format';
import { useOrders } from './orders.api';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PageTitle } from '@/components/layout/PageTitle';


// "My orders": every order, newest first.
export function OrdersPage() {
  const { t } = useTranslation();
  const { data: orders, isLoading, isError, error } = useOrders();

  if (isLoading) return <ListSkeleton rows={4} />;
  if (isError || !orders) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <PageTitle title={t('nav.myOrders')} />
      <h1 className="text-2xl font-bold">{t('nav.myOrders')}</h1>

      {orders.length === 0 ? (
        <>
          <EmptyState title={t('orders.none')} hint={t('orders.noneHint')} />
          <div className="text-center">
            <Link to="/shop" className="text-brand-600 dark:text-brand-300 hover:underline">
              {t('orders.startShopping')}
            </Link>
          </div>
        </>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-surface">
          {orders.map((order) => (
            <li key={order.id}>
              <Link to={`/orders/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="size-12 overflow-hidden rounded-lg border-2 border-surface bg-slate-100"
                    >
                      {item.image && <img src={item.image} alt="" className="size-full object-cover" />}
                    </div>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{order.items.map((i) => i.productName).join(', ')}</p>
                  <p className="text-sm text-slate-500">
                    {formatDate(order.createdAt)} · #{order.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <ChevronRight className="size-4 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
