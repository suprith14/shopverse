import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States';
import { formatDateTime, formatPrice, getErrorMessage, orderNumber } from '@/lib/format';
import { useDebounce } from '@/lib/use-debounce';
import { useGetOrdersByStatusQuery } from '@/features/analytics/analyticsApi';
import { useGetOrdersQuery } from './ordersApi';
import { statusStyles, statusTabs } from './orderStatus';
import { OrderStatusBadge } from './OrderStatusBadge';

export function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const filters = {
    status: params.get('status') ?? undefined,
    q: params.get('q') ?? undefined,
    page: Number(params.get('page') ?? 1),
  };

  const setFilter = (patch) => {
    const next = { ...filters, page: 1, ...patch };
    const search = new URLSearchParams();
    if (next.status) search.set('status', next.status);
    if (next.q) search.set('q', next.q);
    if (next.page && next.page > 1) search.set('page', String(next.page));
    setParams(search);
  };

  const [text, setText] = useState(filters.q ?? '');
  const debounced = useDebounce(text);
  useEffect(() => {
    if ((debounced || undefined) !== filters.q) setFilter({ q: debounced || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced text
  }, [debounced]);

  const { data, isLoading, isFetching, error } = useGetOrdersQuery(filters);
  const { data: counts = [] } = useGetOrdersByStatusQuery();
  const countOf = (status) => counts.find((c) => c.status === status)?.count ?? 0;
  const allCount = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Orders</h1>

      {/* Status tabs with counts: "Paid · to ship (2)" is the work queue. */}
      <div role="tablist" className="flex flex-wrap gap-2">
        <Tab active={!filters.status} onClick={() => setFilter({ status: undefined })} label="All" count={allCount} />
        {statusTabs.map((s) => (
          <Tab
            key={s}
            active={filters.status === s}
            onClick={() => setFilter({ status: s })}
            label={statusStyles[s].label}
            count={countOf(s)}
          />
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Order number (#RHXB9NEJ), customer name or email"
          aria-label="Search orders"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500"
        />
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorState message={getErrorMessage(error)} />}
      {data && data.items.length === 0 && <EmptyState title="No orders found" hint="Try another tab or search." />}

      {data && data.items.length > 0 && (
        <div
          className={`overflow-x-auto rounded-xl border border-slate-200 bg-white ${isFetching ? 'opacity-60' : ''}`}
        >
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Placed</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${o.id}`} className="font-mono font-medium text-brand-700 hover:underline">
                      {orderNumber(o.id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.user.name}</p>
                    <p className="text-xs text-slate-500">{o.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right">{o._count.items}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" disabled={data.page <= 1} onClick={() => setFilter({ page: data.page - 1 })}>
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={data.page >= data.totalPages}
            onClick={() => setFilter({ page: data.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function Tab({ active, onClick, label, count }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${active ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}
    >
      {label} <span className={`text-xs ${active ? 'text-slate-300' : 'text-slate-400'}`}>{count}</span>
    </button>
  );
}
