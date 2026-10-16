import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States';
import { formatPrice } from '@/lib/format';
import { useOrders } from './orders.api';
import { OrderStatusBadge } from './OrderStatusBadge';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

// "My orders": every order, newest first.
export function OrdersPage() {
  const { data: orders, isLoading, isError, error } = useOrders();

  if (isLoading) return <Spinner />;
  if (isError || !orders) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My orders</h1>

      {orders.length === 0 ? (
        <>
          <EmptyState title="No orders yet" hint="When you buy something, it shows up here." />
          <div className="text-center"><Link to="/shop" className="text-brand-600 hover:underline">Start shopping</Link></div>
        </>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {orders.map((order) => (
            <li key={order.id}>
              <Link to={`/orders/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="size-12 overflow-hidden rounded-lg border-2 border-white bg-slate-100">
                      {item.image && <img src={item.image} alt="" className="size-full object-cover" />}
                    </div>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {order.items.map((i) => i.productName).join(', ')}
                  </p>
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
