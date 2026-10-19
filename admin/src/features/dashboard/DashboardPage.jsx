import { Link, useSearchParams } from 'react-router';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { ErrorState, Spinner } from '@/components/ui/States';
import { formatPrice, getErrorMessage } from '@/lib/format';
import {
  useGetCustomerStatsQuery,
  useGetLowStockQuery,
  useGetOrdersByStatusQuery,
  useGetSalesByCategoryQuery,
  useGetSalesQuery,
  useGetSummaryQuery,
  useGetTopProductsQuery,
} from '@/features/analytics/analyticsApi';
import { RankedBars } from './RankedBars';
import { SalesChart } from './SalesChart';
import { StatTile } from './StatTile';

const PERIODS = [7, 30, 90];

export function DashboardPage() {
  // The period lives in the URL (?days=90), like every other filter in the admin.
  const [params, setParams] = useSearchParams();
  const fromUrl = Number(params.get('days'));
  const days = PERIODS.includes(fromUrl) ? fromUrl : 30;

  // Six independent requests, fired in parallel. Each widget shows its own loading state.
  const summary = useGetSummaryQuery(days);
  const sales = useGetSalesQuery(days);
  const top = useGetTopProductsQuery(days);
  const byCategory = useGetSalesByCategoryQuery(days);
  const byStatus = useGetOrdersByStatusQuery();
  const lowStock = useGetLowStockQuery();
  // Polled every minute: "active now" changes as customers come and go, even if nothing else happens.
  // (RTK Query pauses polling automatically when the dashboard is closed.)
  const customers = useGetCustomerStatsQuery(days, { pollingInterval: 60_000 });

  const s = summary.data;
  const c = customers.data;
  const statusCount = (status) => byStatus.data?.find((r) => r.status === status)?.count ?? 0;

  return (
    <div className="space-y-5">
      {/* Title + the one filter for the whole page, in a single row above the charts */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div
          role="radiogroup"
          aria-label="Period"
          className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm"
        >
          {PERIODS.map((p) => (
            <button
              key={p}
              role="radio"
              aria-checked={days === p}
              onClick={() => setParams({ days: String(p) })}
              className={`rounded-md px-3 py-1.5 ${days === p ? 'bg-slate-900 font-medium text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Last {p} days
            </button>
          ))}
        </div>
      </div>

      {summary.error && <ErrorState message={getErrorMessage(summary.error)} />}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Revenue"
          value={s ? formatPrice(s.current.revenue) : ''}
          change={s?.change.revenue}
          days={days}
          loading={!s}
        />
        <StatTile
          label="Orders"
          value={s ? String(s.current.orders) : ''}
          change={s?.change.orders}
          days={days}
          loading={!s}
        />
        <StatTile
          label="Average order value"
          value={s ? formatPrice(s.current.averageOrderValue) : ''}
          change={s?.change.averageOrderValue}
          days={days}
          loading={!s}
        />
        <StatTile
          label="Customers who bought"
          value={s ? String(s.current.customers) : ''}
          change={s?.change.customers}
          days={days}
          loading={!s}
        />
      </div>
      <p className="-mt-2 text-xs text-slate-500">
        Paid, shipped and delivered orders only (refunds and cancellations excluded). Days are UTC.
      </p>

      {/* Customers: sign-ups and activity */}
      <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Customers</h2>
      {customers.error && <ErrorState message={getErrorMessage(customers.error)} />}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Total customers"
          value={c ? c.total.toLocaleString() : ''}
          hint="All customer accounts"
          loading={!c}
        />
        <StatTile
          label="New customers"
          value={c ? c.newCustomers.toLocaleString() : ''}
          change={c?.newChange}
          days={days}
          loading={!c}
        />
        <StatTile
          label="Active now"
          value={c ? c.activeNow.toLocaleString() : ''}
          hint="Used the store in the last 15 min"
          loading={!c}
        />
        <StatTile
          label="Active today"
          value={c ? c.activeToday.toLocaleString() : ''}
          hint={c ? `Last 24 h · ${c.signedIn.toLocaleString()} signed in` : ''}
          loading={!c}
        />
      </div>

      {sales.data ? (
        <SalesChart data={sales.data} />
      ) : (
        <Card>
          <Spinner />
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {top.data ? (
          <RankedBars
            title="Best sellers (by revenue)"
            emptyText="No sales in this period."
            rows={top.data.map((p) => ({ label: p.name, revenue: p.revenue, units: p.units }))}
          />
        ) : (
          <Card>
            <Spinner />
          </Card>
        )}
        {byCategory.data ? (
          <RankedBars
            title="Revenue by category"
            emptyText="No categories."
            rows={byCategory.data.map((c) => ({ label: c.category, revenue: c.revenue, units: c.units }))}
          />
        ) : (
          <Card>
            <Spinner />
          </Card>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* To-do list: links straight into the filtered orders page */}
        <Card title="Orders needing attention">
          <ul className="divide-y divide-slate-100 text-sm">
            {[
              { status: 'PAID', label: 'Paid, waiting to be shipped' },
              { status: 'SHIPPED', label: 'Shipped, not yet delivered' },
              { status: 'PENDING', label: 'Awaiting payment' },
            ].map(({ status, label }) => (
              <li key={status}>
                <Link
                  to={`/orders?status=${status}`}
                  className="flex items-center justify-between py-2.5 hover:text-brand-700"
                >
                  <span>{label}</span>
                  <span className="flex items-center gap-1 font-semibold tabular-nums">
                    {statusCount(status)} <ChevronRight className="size-4 text-slate-400" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={`Low stock (${lowStock.data?.threshold ?? 5} or fewer left)`}>
          {!lowStock.data ? (
            <Spinner />
          ) : lowStock.data.items.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Everything is well stocked.</p>
          ) : (
            <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto text-sm">
              {lowStock.data.items.map((v) => (
                <li key={v.id}>
                  <Link
                    to={`/products/${v.product.id}`}
                    className="flex items-center justify-between gap-3 py-2 hover:text-brand-700"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{v.product.name}</span>
                      <span className="text-xs text-slate-500">
                        {v.name} · <span className="font-mono">{v.sku}</span>
                      </span>
                    </span>
                    {/* Icon + words, not colour alone */}
                    <span
                      className={`flex shrink-0 items-center gap-1 text-xs font-semibold ${v.stock === 0 ? 'text-red-700' : 'text-amber-700'}`}
                    >
                      <AlertTriangle className="size-3.5" aria-hidden />{' '}
                      {v.stock === 0 ? 'Out of stock' : `${v.stock} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {title && <h2 className="mb-2 font-semibold">{title}</h2>}
      {children}
    </div>
  );
}
