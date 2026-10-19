import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, Download, ExternalLink, Loader2, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatDateTime, formatPrice } from '@/lib/format';
import { currentLocale } from '@/i18n';
import { downloadFile } from '@/lib/download';
import { notify } from '@/lib/notify';
import { AddressLines } from '@/features/account/AddressCard';
import { useCouponStore } from '@/features/coupons/coupon.store';
import { useCancelOrder, useOrder, usePayOrder } from './orders.api';
import { OrderStatusBadge } from './OrderStatusBadge';
import { CheckoutSteps } from './CheckoutSteps';
import { PageTitle } from '@/components/layout/PageTitle';

// Stripe sends the customer here after paying (?payment=success) or after pressing back
// (?payment=cancelled). The URL alone proves nothing: the page shows whatever the
// backend says, and the backend only says PAID after Stripe's webhook.
export function OrderDetailPage() {
  const { t } = useTranslation();
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

  if (isLoading) return <ListSkeleton rows={2} />;
  if (isError || !order) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle title={t('orders.order', { number: order.id.slice(-8).toUpperCase() })} />
      <nav className="text-sm text-slate-500">
        <Link to="/orders" className="hover:underline">
          {t('nav.myOrders')}
        </Link>{' '}
        / #{order.id.slice(-8).toUpperCase()}
      </nav>

      {/* Steps only around the purchase itself: waiting for payment, or just back from Stripe */}
      {(order.status === 'PENDING' || payment) && ['PENDING', 'PAID'].includes(order.status) && (
        <CheckoutSteps current={order.status === 'PENDING' ? 2 : 3} done={order.status === 'PAID'} />
      )}
      <StatusBanner order={order} payment={payment} />

      <div className="rounded-xl border border-slate-200 bg-surface">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h1 className="font-semibold">{t('orders.order', { number: order.id.slice(-8).toUpperCase() })}</h1>
            <p className="text-sm text-slate-500">{t('orders.placed', { date: formatDateTime(order.createdAt) })}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Names and prices come from the order snapshot: what the customer actually paid. */}
        <ul className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 p-4">
              <Link
                to={`/products/${item.productSlug}`}
                className="size-16 shrink-0 overflow-hidden rounded-lg bg-slate-100"
              >
                {item.image && <img src={item.image} alt={item.productName} className="size-full object-cover" />}
              </Link>
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-slate-500">
                  {item.variantName} · {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <p className="font-medium">{formatPrice(item.lineTotal)}</p>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-slate-200 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">{t('cart.subtotal')}</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <dt>{order.couponCode ? t('cart.discount', { code: order.couponCode }) : t('cart.discountPlain')}</dt>
              <dd>−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
            <dt>{t('cart.total')}</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      {order.invoiceLabel && <PaymentDetails order={order} />}

      {/* The address copied into the order at checkout (not the current address book entry) */}
      {order.shippingAddress && (
        <div className="rounded-xl border border-slate-200 bg-surface p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('orders.deliveryAddress')}</h2>
          <AddressLines address={order.shippingAddress} />
        </div>
      )}
    </div>
  );
}

function StatusBanner({ order, payment }) {
  const { t } = useTranslation();
  const pay = usePayOrder();
  const cancel = useCancelOrder();

  switch (order.status) {
    case 'PAID':
    case 'SHIPPED':
    case 'DELIVERED':
      return (
        <Banner
          tone="green"
          icon={<CheckCircle2 className="size-6" />}
          title={t('orders.paidTitle')}
        >
          {t('orders.paidText')}
        </Banner>
      );

    case 'PENDING':
      // Just back from Stripe: the webhook is probably a second away. Keep checking.
      if (payment === 'success') {
        return (
          <Banner tone="blue" icon={<Loader2 className="size-6 animate-spin" />} title={t('orders.confirmingTitle')}>
            {t('orders.confirmingText')}
          </Banner>
        );
      }
      return (
        <Banner
          tone="amber"
          icon={<Clock className="size-6" />}
          title={payment === 'cancelled' ? t('orders.notCompleted') : t('orders.status.PENDING')}
        >
          <p>
            {order.paymentDeadline
              ? t('orders.reservedUntil', {
                  time: new Date(order.paymentDeadline).toLocaleTimeString(currentLocale(), {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                })
              : t('orders.reserved')}
          </p>
          {(pay.isError || cancel.isError) && (
            <div className="mt-3">
              <ErrorState error={pay.error ?? cancel.error} />
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <Button onClick={() => pay.mutate(order.id)} loading={pay.isPending}>
              {t('orders.payNow')}
            </Button>
            <Button variant="secondary" onClick={() => cancel.mutate(order.id)} loading={cancel.isPending}>
              {t('orders.cancelOrder')}
            </Button>
          </div>
        </Banner>
      );

    case 'CANCELLED':
      return (
        <Banner tone="slate" icon={<XCircle className="size-6" />} title={t('orders.cancelledTitle')}>
          {t('orders.cancelledText')}{' '}
          <Link to="/cart" className="font-medium underline">
            {t('orders.backToCart')}
          </Link>
        </Banner>
      );

    case 'REFUNDED':
      return (
        <Banner tone="purple" icon={<RotateCcw className="size-6" />} title={t('orders.refundedTitle')}>
          {t('orders.refundedText')}
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

function Banner({ tone, icon, title, children }) {
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

// Invoice download + card used + Stripe's receipt. Only shown once the order is paid.
function PaymentDetails({ order }) {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  const card =
    order.cardBrand && order.cardLast4
      ? `${order.cardBrand.charAt(0).toUpperCase()}${order.cardBrand.slice(1)} •••• ${order.cardLast4}`
      : t('orders.cardViaStripe');

  const download = async () => {
    setDownloading(true);
    try {
      await downloadFile(`/orders/${order.id}/invoice`, `${order.invoiceLabel}.pdf`);
    } catch (err) {
      notify.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-surface p-4">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('orders.payment')}</h2>
        <p className="mt-1 text-sm text-slate-700">
          {card} · {t('orders.invoice')} <span className="font-mono">{order.invoiceLabel}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" loading={downloading} onClick={download}>
          <Download className="size-4" /> {t('orders.downloadInvoice')}
        </Button>
        {order.receiptUrl && (
          <a
            href={order.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm text-brand-700 dark:text-brand-300 hover:bg-brand-50"
          >
            <ExternalLink className="size-4" /> {t('orders.stripeReceipt')}
          </a>
        )}
      </div>
    </div>
  );
}
