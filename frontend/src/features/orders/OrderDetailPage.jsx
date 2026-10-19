// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
// useState = a value the component remembers; calling its setter redraws the component
import { useEffect, useState } from 'react';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
// useParams = the :parts of the URL, e.g. :slug in /products/:slug
// useSearchParams = read/write the ?query=part of the URL
import { Link, useParams, useSearchParams } from 'react-router';
// import = bring in code from another file or package
// useQueryClient = the shared cache, to update or refresh cached data
import { useQueryClient } from '@tanstack/react-query';
// import = bring in code from another file or package
import { CheckCircle2, Clock, Download, ExternalLink, Loader2, RotateCcw, XCircle } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { ListSkeleton } from '@/components/ui/Skeleton';
// import = bring in code from another file or package
import { formatDateTime, formatPrice } from '@/lib/format';
// import = bring in code from another file or package
import { currentLocale } from '@/i18n';
// import = bring in code from another file or package
import { downloadFile } from '@/lib/download';
// import = bring in code from another file or package
import { notify } from '@/lib/notify';
// import = bring in code from another file or package
import { AddressLines } from '@/features/account/AddressCard';
// import = bring in code from another file or package
import { useCouponStore } from '@/features/coupons/coupon.store';
// import = bring in code from another file or package
import { useCancelOrder, useOrder, usePayOrder } from './orders.api';
// import = bring in code from another file or package
import { OrderStatusBadge } from './OrderStatusBadge';
// import = bring in code from another file or package
import { CheckoutSteps } from './CheckoutSteps';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';

// Stripe sends the customer here after paying (?payment=success) or after pressing back
// (?payment=cancelled). The URL alone proves nothing: the page shows whatever the
// backend says, and the backend only says PAID after Stripe's webhook.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function OrderDetailPage() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // x = value (in parameters) = the default used when x is not given
  // useParams = the :parts of the URL, e.g. :slug in /products/:slug
  const { id = '' } = useParams();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useSearchParams = read/write the ?query=part of the URL
  const [params] = useSearchParams();
  // const = a name for a value that is never reassigned
  const payment = params.get('payment'); // 'success' | 'cancelled' | null
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // isLoading = first load, no data yet
  // isError = the request failed
  // === = strictly equal (same value AND same type)
  const { data: order, isLoading, isError, error } = useOrder(id, payment === 'success');
  // const = a name for a value that is never reassigned
  // useQueryClient = the shared cache, to update or refresh cached data
  const queryClient = useQueryClient();
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const removeCoupon = useCouponStore((s) => s.remove);

  // Once paid, the backend has emptied the bought items from the cart and the coupon is
  // used up. Refresh the cart (header badge) and forget the coupon code.
  // Once paid: refresh the cart badge (bought items left the cart), the orders list, and forget the coupon
  // const = a name for a value that is never reassigned
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // === = strictly equal (same value AND same type)
  const isPaid = order?.status === 'PAID';
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // return = give this value back and stop the function here
    if (!isPaid) return;
    // invalidateQueries = mark cached data as old, so screens showing it refetch
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    // invalidateQueries = mark cached data as old, so screens showing it refetch
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    removeCoupon();
  }, [isPaid, queryClient, removeCoupon]);

  // if (...) = run the next part only when the condition is true
  // isLoading = first load, no data yet
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  if (isLoading) return <ListSkeleton rows={2} />;
  // if (...) = run the next part only when the condition is true
  // isError = the request failed
  // a || b = OR: a if it is truthy, else b
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  if (isError || !order) return <ErrorState error={error} />;

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="mx-auto max-w-3xl space-y-6">
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
         .slice = a copy of part of an array/string */}
      <PageTitle title={t('orders.order', { number: order.id.slice(-8).toUpperCase() })} />
      {/* <nav> = a navigation area (screen readers can jump to it)
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <nav className="text-sm text-slate-500">
        {/* Link = a link to another page of this app (no full page reload)
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Link to="/orders" className="hover:underline">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('nav.myOrders')}
        {/* { } in JSX = run JavaScript here and show its result */}
        </Link>{' '}
        / #{order.id.slice(-8).toUpperCase()}
      </nav>

      {/* Steps only around the purchase itself: waiting for payment, or just back from Stripe */}
      {/* { } in JSX = run JavaScript here and show its result
         === = strictly equal (same value AND same type)
         a || b = OR: a if it is truthy, else b
         .includes = true if the array/string contains the value
         a && b = AND; in JSX: show b only when a is true */}
      {(order.status === 'PENDING' || payment) && ['PENDING', 'PAID'].includes(order.status) && (
        // { } in JSX = run JavaScript here and show its result
        // a ? b : c = ternary: if a then b else c
        // === = strictly equal (same value AND same type)
        <CheckoutSteps current={order.status === 'PENDING' ? 2 : 3} done={order.status === 'PAID'} />
      )}
      {/* { } in JSX = run JavaScript here and show its result */}
      <StatusBanner order={order} payment={payment} />

      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="rounded-xl border border-slate-200 bg-surface">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
               .slice = a copy of part of an array/string */}
            <h1 className="font-semibold">{t('orders.order', { number: order.id.slice(-8).toUpperCase() })}</h1>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <p className="text-sm text-slate-500">{t('orders.placed', { date: formatDateTime(order.createdAt) })}</p>
          </div>
          {/* { } in JSX = run JavaScript here and show its result */}
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Names and prices come from the order snapshot: what the customer actually paid. */}
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <ul className="divide-y divide-slate-100">
          {/* { } in JSX = run JavaScript here and show its result
             .map = make a new array by transforming each item (in JSX: one element per item)
             => = an arrow function (a short function) */}
          {order.items.map((item) => (
            // key = a stable id for list items so React can track them between redraws
            // { } in JSX = run JavaScript here and show its result
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <li key={item.id} className="flex gap-4 p-4">
              {/* Link = a link to another page of this app (no full page reload) */}
              <Link
                // { } in JSX = run JavaScript here and show its result
                // `text ${x}` = a template string: text with values inserted
                to={`/products/${item.productSlug}`}
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                className="size-16 shrink-0 overflow-hidden rounded-lg bg-slate-100"
              >
                {/* { } in JSX = run JavaScript here and show its result
                   a && b = AND; in JSX: show b only when a is true
                   alt = text describing the image for screen readers (empty = decorative)
                   className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                {item.image && <img src={item.image} alt={item.productName} className="size-full object-cover" />}
              </Link>
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <div className="flex-1">
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                   { } in JSX = run JavaScript here and show its result */}
                <p className="font-medium">{item.productName}</p>
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <p className="text-sm text-slate-500">
                  {/* { } in JSX = run JavaScript here and show its result */}
                  {item.variantName} · {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result */}
              <p className="font-medium">{formatPrice(item.lineTotal)}</p>
            </li>
          ))}
        </ul>

        {/* <dl> = a list of terms (<dt>) and their values (<dd>)
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <dl className="space-y-2 border-t border-slate-200 p-4 text-sm">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="flex justify-between">
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <dt className="text-slate-600">{t('cart.subtotal')}</dt>
            {/* { } in JSX = run JavaScript here and show its result */}
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true */}
          {order.discount > 0 && (
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <div className="flex justify-between text-green-700">
              {/* { } in JSX = run JavaScript here and show its result
                 a ? b : c = ternary: if a then b else c
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <dt>{order.couponCode ? t('cart.discount', { code: order.couponCode }) : t('cart.discountPlain')}</dt>
              {/* { } in JSX = run JavaScript here and show its result */}
              <dd>−{formatPrice(order.discount)}</dd>
            </div>
          )}
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <dt>{t('cart.total')}</dt>
            {/* { } in JSX = run JavaScript here and show its result */}
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true */}
      {order.invoiceLabel && <PaymentDetails order={order} />}

      {/* The address copied into the order at checkout (not the current address book entry) */}
      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true */}
      {order.shippingAddress && (
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <div className="rounded-xl border border-slate-200 bg-surface p-4">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('orders.deliveryAddress')}</h2>
          {/* { } in JSX = run JavaScript here and show its result */}
          <AddressLines address={order.shippingAddress} />
        </div>
      )}
    </div>
  );
}

// The coloured message at the top: what happened to this order and what the customer can do now.
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function StatusBanner({ order, payment }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  const pay = usePayOrder();
  // const = a name for a value that is never reassigned
  const cancel = useCancelOrder();

  switch (order.status) {
    case 'PAID':
    case 'SHIPPED':
    case 'DELIVERED':
      // return = give this value back and stop the function here
      return (
        <Banner
          tone="green"
          // { } in JSX = run JavaScript here and show its result
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          icon={<CheckCircle2 className="size-6" />}
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          title={t('orders.paidTitle')}
        >
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('orders.paidText')}
        </Banner>
      );

    case 'PENDING':
      // Just back from Stripe: the webhook is probably a second away. Keep checking.
      // if (...) = run the next part only when the condition is true
      // === = strictly equal (same value AND same type)
      if (payment === 'success') {
        // return = give this value back and stop the function here
        return (
          // { } in JSX = run JavaScript here and show its result
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          <Banner tone="blue" icon={<Loader2 className="size-6 animate-spin" />} title={t('orders.confirmingTitle')}>
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('orders.confirmingText')}
          </Banner>
        );
      }
      // return = give this value back and stop the function here
      return (
        <Banner
          tone="amber"
          // { } in JSX = run JavaScript here and show its result
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          icon={<Clock className="size-6" />}
          // { } in JSX = run JavaScript here and show its result
          // a ? b : c = ternary: if a then b else c
          // === = strictly equal (same value AND same type)
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          title={payment === 'cancelled' ? t('orders.notCompleted') : t('orders.status.PENDING')}
        >
          <p>
            {/* { } in JSX = run JavaScript here and show its result
               a ? b : c = ternary: if a then b else c */}
            {order.paymentDeadline
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              ? t('orders.reservedUntil', {
                  // new = create an object from a class (e.g. new Date())
                  // Date = a point in time
                  time: new Date(order.paymentDeadline).toLocaleTimeString(currentLocale(), {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                })
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              : t('orders.reserved')}
          </p>
          {/* { } in JSX = run JavaScript here and show its result
             isError = the request failed
             a || b = OR: a if it is truthy, else b
             a && b = AND; in JSX: show b only when a is true */}
          {(pay.isError || cancel.isError) && (
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <div className="mt-3">
              {/* { } in JSX = run JavaScript here and show its result
                 a ?? b = a, unless a is null/undefined, then b */}
              <ErrorState error={pay.error ?? cancel.error} />
            </div>
          )}
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="mt-3 flex gap-2">
            {/* onClick = what happens on click/tap
               { } in JSX = run JavaScript here and show its result
               => = an arrow function (a short function)
               mutate = run the mutation (send the change)
               loading="lazy" = load the image only when it gets near the screen
               isPending = the request is running right now */}
            <Button onClick={() => pay.mutate(order.id)} loading={pay.isPending}>
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {t('orders.payNow')}
            </Button>
            {/* onClick = what happens on click/tap
               { } in JSX = run JavaScript here and show its result
               => = an arrow function (a short function)
               mutate = run the mutation (send the change)
               loading="lazy" = load the image only when it gets near the screen
               isPending = the request is running right now */}
            <Button variant="secondary" onClick={() => cancel.mutate(order.id)} loading={cancel.isPending}>
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {t('orders.cancelOrder')}
            </Button>
          </div>
        </Banner>
      );

    case 'CANCELLED':
      // return = give this value back and stop the function here
      return (
        // { } in JSX = run JavaScript here and show its result
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        <Banner tone="slate" icon={<XCircle className="size-6" />} title={t('orders.cancelledTitle')}>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('orders.cancelledText')}{' '}
          {/* Link = a link to another page of this app (no full page reload)
             className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <Link to="/cart" className="font-medium underline">
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('orders.backToCart')}
          </Link>
        </Banner>
      );

    case 'REFUNDED':
      // return = give this value back and stop the function here
      return (
        // { } in JSX = run JavaScript here and show its result
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        <Banner tone="purple" icon={<RotateCcw className="size-6" />} title={t('orders.refundedTitle')}>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('orders.refundedText')}
        </Banner>
      );
  }
}

// Border, background and text colour per banner type (all have dark-mode versions)
// const = a name for a value that is never reassigned
const tones = {
  green: 'border-green-200 bg-green-50 text-green-900',
  blue: 'border-blue-200 bg-blue-50 text-blue-900',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  slate: 'border-slate-200 bg-slate-100 text-slate-800',
  purple: 'border-purple-200 bg-purple-50 text-purple-900',
};

// The banner box itself: icon on the left, title + text on the right
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// children = whatever is written between this component's opening and closing tags
function Banner({ tone, icon, title, children }) {
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    // { } in JSX = run JavaScript here and show its result
    // `text ${x}` = a template string: text with values inserted
    // obj[key] = read the property whose name is stored in key
    <div className={`flex gap-3 rounded-xl border p-4 ${tones[tone]}`}>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <div className="shrink-0">{icon}</div>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="text-sm">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result */}
        <p className="text-base font-semibold">{title}</p>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           children = whatever is written between this component's opening and closing tags */}
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

// Invoice download + card used + Stripe's receipt. Only shown once the order is paid.
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function PaymentDetails({ order }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [downloading, setDownloading] = useState(false);
  // const = a name for a value that is never reassigned
  const card =
    // a ? b : c = ternary: if a then b else c
    // a && b = AND; in JSX: show b only when a is true
    order.cardBrand && order.cardLast4
      // `text ${x}` = a template string: text with values inserted
      // .slice = a copy of part of an array/string
      ? `${order.cardBrand.charAt(0).toUpperCase()}${order.cardBrand.slice(1)} •••• ${order.cardLast4}`
      // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
      : t('orders.cardViaStripe');

  // The PDF needs the login token, so it's fetched with it and saved as a file (lib/download.js)
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  const download = async () => {
    setDownloading(true);
    // try / catch = if the code inside fails, run the catch part instead of crashing
    try {
      // await = wait for a Promise (async result) before continuing
      // `text ${x}` = a template string: text with values inserted
      await downloadFile(`/orders/${order.id}/invoice`, `${order.invoiceLabel}.pdf`);
    } catch (err) {
      notify.error(err);
    } finally {
      setDownloading(false);
    }
  };

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-surface p-4">
      <div>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('orders.payment')}</h2>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <p className="mt-1 text-sm text-slate-700">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
             className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          {card} · {t('orders.invoice')} <span className="font-mono">{order.invoiceLabel}</span>
        </p>
      </div>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex flex-wrap gap-2">
        {/* loading="lazy" = load the image only when it gets near the screen
           { } in JSX = run JavaScript here and show its result
           onClick = what happens on click/tap */}
        <Button variant="secondary" loading={downloading} onClick={download}>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <Download className="size-4" /> {t('orders.downloadInvoice')}
        </Button>
        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true */}
        {order.receiptUrl && (
          <a
            // { } in JSX = run JavaScript here and show its result
            href={order.receiptUrl}
            target="_blank"
            rel="noreferrer"
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm text-brand-700 dark:text-brand-300 hover:bg-brand-50"
          >
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <ExternalLink className="size-4" /> {t('orders.stripeReceipt')}
          </a>
        )}
      </div>
    </div>
  );
}
