import { useEffect, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, Loader2, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState, Spinner } from '@/components/ui/States';
import { formatPrice } from '@/lib/format';
import { AddressLines } from '@/features/account/AddressCard';
import type { Order } from '@/types/api';
import { useCouponStore } from '@/features/coupons/coupon.store';
import { useCancelOrder, useOrder, usePayOrder } from './orders.api';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PageTitle } from '@/components/layout/PageTitle';

// Stripe sends the customer here after paying (?payment=success) or after pressing back
// (?payment=cancelled). The URL alone proves nothing: the page shows whatever the
// backend says, and the backend only says PAID after Stripe's webhook.
export function OrderDetailPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const payment = params.get('payment'); // 'success' | 'cancelled' | null
  const { data: order, isLoading, isError, error } = useOrder(id, payment === 'success');
  const queryClient = useQueryClient();
  const removeCoupon = useCouponStore((s) => s.remove);

  // Once paid, the backend has emptied the bought items from the cart and the coupon is
  // used up. Refresh the cart (header badge) and forget the coupon code.
  const isPaid = order?.status === 'PAID';
  useEffect(() => {
    if (!isPaid) return;
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    removeCoupon();
  }, [isPaid, queryClient, removeCoupon]);

  if (isLoading) return <Spinner />;
  if (isError || !order) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle title={`Order #${order.id.slice(-8).toUpperCase()}`} />
      <nav className="text-sm text-slate-500">
        <Link to="/orders" className="hover:underline">My orders</Link> / #{order.id.slice(-8).toUpperCase()}
      </nav>

      <StatusBanner order={order} payment={payment} />

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h1 className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</h1>
            <p className="text-sm text-slate-500">Placed {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Names and prices come from the order snapshot: what the customer actually paid. */}
        <ul className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 p-4">
              <Link to={`/products/${item.productSlug}`} className="size-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {item.image && <img src={item.image} alt={item.productName} className="size-full object-cover" />}
              </Link>
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-slate-500">{item.variantName} · {item.quantity} × {formatPrice(item.unitPrice)}</p>
              </div>
              <p className="font-medium">{formatPrice(item.lineTotal)}</p>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-slate-200 p-4 text-sm">
          <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <dt>Discount{order.couponCode && ` (${order.couponCode})`}</dt><dd>−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
            <dt>Total</dt><dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      {/* The address copied into the order at checkout (not the current address book entry) */}
      {order.shippingAddress && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery address</h2>
          <AddressLines address={order.shippingAddress} />
        </div>
      )}
    </div>
  );
}

function StatusBanner({ order, payment }: { order: Order; payment: string | null }) {
  const pay = usePayOrder();
  const cancel = useCancelOrder();

  switch (order.status) {
    case 'PAID':
    case 'SHIPPED':
    case 'DELIVERED':
      return (
        <Banner tone="green" icon={<CheckCircle2 className="size-6" />} title="Payment received. Thank you for your order!">
          We've received your payment and your order is confirmed.
        </Banner>
      );

    case 'PENDING':
      // Just back from Stripe: the webhook is probably a second away. Keep checking.
      if (payment === 'success') {
        return (
          <Banner tone="blue" icon={<Loader2 className="size-6 animate-spin" />} title="Confirming your payment...">
            This usually takes a few seconds. This page updates by itself.
          </Banner>
        );
      }
      return (
        <Banner tone="amber" icon={<Clock className="size-6" />}
          title={payment === 'cancelled' ? 'Payment not completed' : 'Awaiting payment'}>
          <p>
            Your items are reserved
            {order.paymentDeadline && ` until ${new Date(order.paymentDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}.
            After that the order is cancelled automatically.
          </p>
          {(pay.isError || cancel.isError) && <div className="mt-3"><ErrorState error={pay.error ?? cancel.error} /></div>}
          <div className="mt-3 flex gap-2">
            <Button onClick={() => pay.mutate(order.id)} loading={pay.isPending}>Pay now</Button>
            <Button variant="secondary" onClick={() => cancel.mutate(order.id)} loading={cancel.isPending}>Cancel order</Button>
          </div>
        </Banner>
      );

    case 'CANCELLED':
      return (
        <Banner tone="slate" icon={<XCircle className="size-6" />} title="Order cancelled">
          This order wasn't paid, so it was cancelled and the items were released.{' '}
          <Link to="/cart" className="font-medium underline">Back to cart</Link>
        </Banner>
      );

    case 'REFUNDED':
      return (
        <Banner tone="purple" icon={<RotateCcw className="size-6" />} title="Payment refunded">
          Your payment arrived after this order had expired, so it was refunded in full to your card.
        </Banner>
      );
  }
}

const tones = {
  green: 'border-green-200 bg-green-50 text-green-900',
  blue: 'border-blue-200 bg-blue-50 text-blue-900',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  slate: 'border-slate-200 bg-slate-100 text-slate-800',
  purple: 'border-purple-200 bg-purple-50 text-purple-900',
};

function Banner({ tone, icon, title, children }: { tone: keyof typeof tones; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className={`flex gap-3 rounded-xl border p-4 ${tones[tone]}`}>
      <div className="shrink-0">{icon}</div>
      <div className="text-sm">
        <p className="text-base font-semibold">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}
