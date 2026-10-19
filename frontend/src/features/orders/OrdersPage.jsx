// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
import { Link } from 'react-router';
// import = bring in code from another file or package
import { ChevronRight } from 'lucide-react';
// import = bring in code from another file or package
import { EmptyState, ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { ListSkeleton } from '@/components/ui/Skeleton';
// import = bring in code from another file or package
import { formatDate, formatPrice } from '@/lib/format';
// import = bring in code from another file or package
import { useOrders } from './orders.api';
// import = bring in code from another file or package
import { OrderStatusBadge } from './OrderStatusBadge';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';


// "My orders": every order, newest first.
// Data: useOrders() -> GET /api/orders, only THIS user's orders (the server filters by the login token).
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function OrdersPage() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // isLoading = first load, no data yet
  // isError = the request failed
  const { data: orders, isLoading, isError, error } = useOrders();

  // if (...) = run the next part only when the condition is true
  // isLoading = first load, no data yet
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  if (isLoading) return <ListSkeleton rows={4} />;
  // if (...) = run the next part only when the condition is true
  // isError = the request failed
  // a || b = OR: a if it is truthy, else b
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  if (isError || !orders) return <ErrorState error={error} />;

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="space-y-6">
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <PageTitle title={t('nav.myOrders')} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <h1 className="text-2xl font-bold">{t('nav.myOrders')}</h1>

      {/* { } in JSX = run JavaScript here and show its result
         a ? b : c = ternary: if a then b else c
         === = strictly equal (same value AND same type) */}
      {orders.length === 0 ? (
        // <> </> = a fragment: groups elements without adding an extra HTML element
        <>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <EmptyState title={t('orders.none')} hint={t('orders.noneHint')} />
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="text-center">
            {/* Link = a link to another page of this app (no full page reload)
               className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Link to="/shop" className="text-brand-600 dark:text-brand-300 hover:underline">
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {t('orders.startShopping')}
            </Link>
          </div>
        </>
      ) : (
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-surface">
          {/* { } in JSX = run JavaScript here and show its result
             .map = make a new array by transforming each item (in JSX: one element per item)
             => = an arrow function (a short function) */}
          {orders.map((order) => (
            // key = a stable id for list items so React can track them between redraws
            // { } in JSX = run JavaScript here and show its result
            <li key={order.id}>
              {/* Link = a link to another page of this app (no full page reload)
                 { } in JSX = run JavaScript here and show its result
                 `text ${x}` = a template string: text with values inserted
                 className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <Link to={`/orders/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <div className="flex -space-x-3">
                  {/* Up to 3 product photos, overlapping (-space-x-3); the border keeps them apart */}
                  {/* { } in JSX = run JavaScript here and show its result
                     .slice = a copy of part of an array/string
                     .map = make a new array by transforming each item (in JSX: one element per item)
                     => = an arrow function (a short function) */}
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      // key = a stable id for list items so React can track them between redraws
                      // { } in JSX = run JavaScript here and show its result
                      key={item.id}
                      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                      className="size-12 overflow-hidden rounded-lg border-2 border-surface bg-slate-100"
                    >
                      {/* { } in JSX = run JavaScript here and show its result
                         a && b = AND; in JSX: show b only when a is true
                         alt = text describing the image for screen readers (empty = decorative)
                         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                      {item.image && <img src={item.image} alt="" className="size-full object-cover" />}
                    </div>
                  ))}
                </div>
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <div className="min-w-0 flex-1">
                  {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                     { } in JSX = run JavaScript here and show its result
                     .map = make a new array by transforming each item (in JSX: one element per item)
                     => = an arrow function (a short function)
                     .join = turn an array into one string with a separator */}
                  <p className="truncate font-medium">{order.items.map((i) => i.productName).join(', ')}</p>
                  {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                  <p className="text-sm text-slate-500">
                    {/* date in the reader's language; the order number is the last 8 characters of its id */}
                    {/* { } in JSX = run JavaScript here and show its result
                       .slice = a copy of part of an array/string */}
                    {formatDate(order.createdAt)} · #{order.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <div className="flex flex-col items-end gap-1">
                  {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                     { } in JSX = run JavaScript here and show its result */}
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                  {/* { } in JSX = run JavaScript here and show its result */}
                  <OrderStatusBadge status={order.status} />
                </div>
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <ChevronRight className="size-4 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
