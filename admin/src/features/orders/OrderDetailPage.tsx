import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Check, ExternalLink, PackageCheck, RotateCcw, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState, Spinner } from '@/components/ui/States';
import { formatDateTime, formatPrice, getErrorMessage, orderNumber } from '@/lib/format';
import type { AdminOrderDetail, OrderStatus } from '@/types/api';
import { useGetOrderQuery, useRefundOrderMutation, useUpdateOrderStatusMutation } from './ordersApi';
import { OrderStatusBadge } from './OrderStatusBadge';

const REFUNDABLE: OrderStatus[] = ['PAID', 'SHIPPED', 'DELIVERED'];

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const { data: order, isLoading, error } = useGetOrderQuery(id);

  if (isLoading) return <Spinner />;
  if (error || !order) return <ErrorState message={getErrorMessage(error)} />;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:underline"><ArrowLeft className="size-4" /> Orders</Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-bold">{orderNumber(order.id)}</h1>
        <OrderStatusBadge status={order.status} />
        <span className="text-sm text-slate-500">Placed {formatDateTime(order.createdAt)}</span>
      </div>

      <Progress status={order.status} />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Items order={order} />
        </div>
        <div className="space-y-5">
          <Actions order={order} />
          <Box title="Customer">
            <p className="font-medium">{order.user.name}</p>
            <a href={`mailto:${order.user.email}`} className="text-sm text-brand-700 hover:underline">{order.user.email}</a>
          </Box>
          <Box title="Payment">
            {order.stripePaymentIntentId ? (
              <a href={`https://dashboard.stripe.com/test/payments/${order.stripePaymentIntentId}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 break-all font-mono text-xs text-brand-700 hover:underline">
                {order.stripePaymentIntentId} <ExternalLink className="size-3 shrink-0" />
              </a>
            ) : (
              <p className="text-sm text-slate-500">Not paid</p>
            )}
            {order.reservations[0] && (
              <p className="mt-2 text-xs text-slate-500">Stock reservation: {order.reservations[0].status.toLowerCase()}</p>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
}

// PAID -> SHIPPED -> DELIVERED, with the current step highlighted.
function Progress({ status }: { status: OrderStatus }) {
  if (!['PAID', 'SHIPPED', 'DELIVERED'].includes(status)) return null;
  const steps = [
    { key: 'PAID', label: 'Paid', icon: Check },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: PackageCheck },
  ];
  const current = steps.findIndex((s) => s.key === status);
  return (
    <ol className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
      {steps.map(({ key, label, icon: Icon }, i) => (
        <li key={key} className="flex flex-1 items-center gap-2">
          <span className={`flex size-8 items-center justify-center rounded-full ${i <= current ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
            <Icon className="size-4" />
          </span>
          <span className={`text-sm font-medium ${i <= current ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
          {i < steps.length - 1 && <span className={`h-0.5 flex-1 ${i < current ? 'bg-brand-600' : 'bg-slate-200'}`} />}
        </li>
      ))}
    </ol>
  );
}

// Only the actions the order's current state allows are shown. The backend enforces the same rules.
function Actions({ order }: { order: AdminOrderDetail }) {
  const [updateStatus, statusState] = useUpdateOrderStatusMutation();
  const [refund, refundState] = useRefundOrderMutation();
  const [refundOpen, setRefundOpen] = useState(false);
  const [restock, setRestock] = useState(false);
  const error = statusState.error ?? refundState.error;
  const canRefund = REFUNDABLE.includes(order.status) && !!order.stripePaymentIntentId;

  const next =
    order.status === 'PAID' ? { to: 'SHIPPED' as const, label: 'Mark as shipped', icon: Truck }
    : order.status === 'SHIPPED' ? { to: 'DELIVERED' as const, label: 'Mark as delivered', icon: PackageCheck }
    : null;

  return (
    <Box title="Actions">
      {error && <div className="mb-3"><ErrorState message={getErrorMessage(error)} /></div>}
      {!next && !canRefund && <p className="text-sm text-slate-500">No actions for a {order.status.toLowerCase()} order.</p>}

      <div className="space-y-2">
        {next && (
          <Button className="w-full" loading={statusState.isLoading} onClick={() => updateStatus({ id: order.id, status: next.to })}>
            <next.icon className="size-4" /> {next.label}
          </Button>
        )}

        {canRefund && !refundOpen && (
          <Button variant="secondary" className="w-full" onClick={() => setRefundOpen(true)}>
            <RotateCcw className="size-4" /> Refund
          </Button>
        )}

        {canRefund && refundOpen && (
          <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-900">Refund {formatPrice(order.total)} to the customer's card?</p>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-red-900">
              <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} className="mt-0.5" />
              <span>Put the items back in stock (only if they were returned unused)</span>
            </label>
            <div className="flex gap-2">
              <Button variant="danger" loading={refundState.isLoading}
                onClick={async () => { await refund({ id: order.id, restock }).unwrap().catch(() => undefined); setRefundOpen(false); }}>
                Confirm refund
              </Button>
              <Button variant="ghost" onClick={() => setRefundOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </Box>
  );
}

function Items({ order }: { order: AdminOrderDetail }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <h2 className="border-b border-slate-200 px-5 py-3 font-semibold">Items</h2>
      <ul className="divide-y divide-slate-100">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 px-5 py-3">
            <img src={item.variant.product.images[0]} alt="" className="size-12 rounded-lg bg-slate-100 object-cover" />
            <div className="flex-1">
              <Link to={`/products/${item.variant.product.id}`} className="font-medium hover:underline">{item.productName}</Link>
              <p className="text-xs text-slate-500">{item.variantName} · <span className="font-mono">{item.variant.sku}</span></p>
            </div>
            <p className="text-sm text-slate-600">{item.quantity} × {formatPrice(item.unitPrice)}</p>
            <p className="w-24 text-right font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <dl className="space-y-1 border-t border-slate-200 px-5 py-3 text-sm">
        <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
        {order.discount > 0 && (
          <div className="flex justify-between text-green-700"><dt>Discount{order.coupon && ` (${order.coupon.code})`}</dt><dd>−{formatPrice(order.discount)}</dd></div>
        )}
        <div className="flex justify-between pt-1 text-base font-semibold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
      </dl>
      <p className="border-t border-slate-100 px-5 py-2 text-xs text-slate-400">Names and prices are the snapshot from when the order was placed.</p>
    </div>
  );
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </div>
  );
}
