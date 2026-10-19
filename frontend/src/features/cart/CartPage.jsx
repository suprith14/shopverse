// /cart: the items, the order summary (subtotal, coupon, total), the delivery address and the
// Checkout button. Prices always come from the server (current price), never from the browser.
// Checkout creates the order (stock is reserved) and sends the browser to Stripe to pay.

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
// useState = a value the component remembers; calling its setter redraws the component
import { useRef, useState } from 'react';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
import { Link } from 'react-router';
// import = bring in code from another file or package
import { AlertTriangle, Lock, Minus, Plus, Trash2 } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { EmptyState, ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { ListSkeleton } from '@/components/ui/Skeleton';
// import = bring in code from another file or package
import { formatPrice } from '@/lib/format';
// import = bring in code from another file or package
import { useAddToCart, useCart, useClearCart, useRemoveCartItem, useUpdateCartItem } from './cart.api';
// import = bring in code from another file or package
import { notify } from '@/lib/notify';
// import = bring in code from another file or package
import { CouponBox } from '@/features/coupons/CouponBox';
// import = bring in code from another file or package
import { useCouponPreview } from '@/features/coupons/coupons.api';
// import = bring in code from another file or package
import { useCouponStore } from '@/features/coupons/coupon.store';
// import = bring in code from another file or package
import { usePlaceOrder } from '@/features/orders/orders.api';
// import = bring in code from another file or package
import { DeliveryAddressPicker } from '@/features/account/DeliveryAddressPicker';
// import = bring in code from another file or package
import { CheckoutSteps } from '@/features/orders/CheckoutSteps';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';

// Same limit as the backend. The backend still enforces it; this only disables the + button.
// const = a name for a value that is never reassigned
const MAX_QUANTITY_PER_ITEM = 10;

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function CartPage() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // GET /api/cart: items with current prices, stock and any problems (cart.api.js)
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // isLoading = first load, no data yet
  // isError = the request failed
  const { data: cart, isLoading, isError, error } = useCart();
  // const = a name for a value that is never reassigned
  const clearCart = useClearCart();
  // the code the customer typed (only the code is kept in the browser)
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const couponCode = useCouponStore((s) => s.code);
  // the server checks the code and calculates the discount for this subtotal
  // const = a name for a value that is never reassigned
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // a ?? b = a, unless a is null/undefined, then b
  const couponPreview = useCouponPreview(couponCode, cart?.subtotal ?? 0);
  // Only count the discount if the preview is for the code currently applied and is valid.
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // ! = NOT: flips true/false
  // isError = the request failed
  // a && b = AND; in JSX: show b only when a is true
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // === = strictly equal (same value AND same type)
  const coupon = !couponPreview.isError && couponPreview.data?.code === couponCode ? couponPreview.data : undefined;
  // const = a name for a value that is never reassigned
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // a ?? b = a, unless a is null/undefined, then b
  const discount = coupon?.discount ?? 0;
  // POST /api/orders -> { checkoutUrl } -> the browser goes to Stripe (orders.api.js)
  // const = a name for a value that is never reassigned
  const placeOrder = usePlaceOrder();
  // the chosen delivery address (the picker below sets it)
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [addressId, setAddressId] = useState(null);
  // to scroll to the address form when Checkout is pressed without one
  // const = a name for a value that is never reassigned
  // useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
  const addressSection = useRef(null);

  // if (...) = run the next part only when the condition is true
  // isLoading = first load, no data yet
  // return = give this value back and stop the function here
  if (isLoading) return <ListSkeleton />;
  // if (...) = run the next part only when the condition is true
  // isError = the request failed
  // a || b = OR: a if it is truthy, else b
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  if (isError || !cart) return <ErrorState error={error} />;

  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  if (cart.items.length === 0) {
    // return = give this value back and stop the function here
    return (
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      <div className="space-y-4">
        {/* { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <PageTitle title={t('cart.title')} />
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <h1 className="text-2xl font-bold">{t('cart.title')}</h1>
        {/* { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <EmptyState title={t('cart.empty')} hint={t('cart.emptyHint')} />
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="text-center">
          {/* Link = a link to another page of this app (no full page reload)
             className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <Link to="/shop" className="text-brand-600 dark:text-brand-300 hover:underline">
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="space-y-6">
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <PageTitle title={t('cart.title')} />
      {/* Step 1 of 3: Cart & delivery -> Payment (Stripe) -> Confirmation */}
      {/* { } in JSX = run JavaScript here and show its result */}
      <CheckoutSteps current={1} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex items-baseline justify-between">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <h1 className="text-2xl font-bold">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('cart.title')}{' '}
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <span className="text-base font-normal text-slate-500">{t('cart.itemCount', { count: cart.itemCount })}</span>
        </h1>
        {/* onClick = what happens on click/tap
           { } in JSX = run JavaScript here and show its result
           => = an arrow function (a short function)
           mutate = run the mutation (send the change)
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <button onClick={() => clearCart.mutate(undefined)} className="text-sm text-slate-500 hover:text-red-600">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('cart.clear')}
        </button>
      </div>

      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-surface">
          {/* { } in JSX = run JavaScript here and show its result
             .map = make a new array by transforming each item (in JSX: one element per item)
             => = an arrow function (a short function) */}
          {cart.items.map((item) => (
            // Each row has its own quantity buttons and Remove (with Undo), see CartRow below
            // key = a stable id for list items so React can track them between redraws
            // { } in JSX = run JavaScript here and show its result
            <CartRow key={item.variantId} item={item} />
          ))}
        </ul>

        {/* Order summary */}
        {/* <aside> = side content next to the main content
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-surface p-5">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <h2 className="font-semibold">{t('cart.summary')}</h2>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="flex justify-between text-sm">
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <span className="text-slate-600">{t('cart.subtotal')}</span>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result */}
            <span className="font-medium">{formatPrice(cart.subtotal)}</span>
          </div>
          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true */}
          {discount > 0 && (
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <div className="flex justify-between text-sm text-green-700">
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                 ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined */}
              <span>{t('cart.discount', { code: coupon?.code })}</span>
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result */}
              <span className="font-medium">−{formatPrice(discount)}</span>
            </div>
          )}
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold">
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <span>{t('cart.total')}</span>
            {/* { } in JSX = run JavaScript here and show its result */}
            <span>{formatPrice(cart.subtotal - discount)}</span>
          </div>
          {/* Type a code, see the saving or why it doesn't work */}
          {/* { } in JSX = run JavaScript here and show its result */}
          <CouponBox preview={couponPreview} />
          {/* ref = after drawing, put this element into a useRef box (.current)
             { } in JSX = run JavaScript here and show its result
             className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div ref={addressSection} className="scroll-mt-24 border-t border-slate-200 pt-4">
            {/* { } in JSX = run JavaScript here and show its result
               onChange = runs on every change of an input */}
            <DeliveryAddressPicker value={addressId} onChange={setAddressId} />
          </div>
          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true */}
          {cart.hasIssues && (
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <p className="flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <AlertTriangle className="size-4 shrink-0" /> {t('cart.hasIssues')}
            </p>
          )}
          {/* { } in JSX = run JavaScript here and show its result
             isError = the request failed
             a && b = AND; in JSX: show b only when a is true */}
          {placeOrder.isError && <ErrorState error={placeOrder.error} />}
          {/* Only a coupon the backend accepted is sent. The backend checks it again anyway. */}
          {/* Not disabled when the address is missing: a dead button doesn't say why (and tooltips
               don't exist on phones). Tapping it takes you to the address form instead. */}
          <Button
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="w-full py-3"
            // loading="lazy" = load the image only when it gets near the screen
            // { } in JSX = run JavaScript here and show its result
            // isPending = the request is running right now
            loading={placeOrder.isPending}
            // disabled = can't be clicked or typed in
            // { } in JSX = run JavaScript here and show its result
            // a || b = OR: a if it is truthy, else b
            // === = strictly equal (same value AND same type)
            disabled={cart.hasIssues || cart.subtotal === 0}
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            onClick={() => {
              // if (...) = run the next part only when the condition is true
              // ! = NOT: flips true/false
              if (!addressId) {
                // ?.() = call only if the function exists
                // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
                // scrollIntoView = scroll the page until this element is visible
                addressSection.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Put the cursor in the first field of the address form, so typing can start right away.
                // ?.() = call only if the function exists
                // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
                // focus = put the keyboard cursor in this element
                addressSection.current?.querySelector('input')?.focus({ preventScroll: true });
                // new = create an object from a class (e.g. new Date())
                // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                notify.error(new Error(t('cart.addAddressFirst')));
                // return = give this value back and stop the function here
                return;
              }
              // mutate = run the mutation (send the change)
              // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
              placeOrder.mutate({ couponCode: coupon?.code, addressId });
            }}
          >
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Lock className="size-4" />
            {/* { } in JSX = run JavaScript here and show its result
               a ? b : c = ternary: if a then b else c */}
            {addressId
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              ? t('cart.checkout', { total: formatPrice(cart.subtotal - discount) })
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              : t('cart.addAddressToContinue')}
          </Button>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <p className="text-center text-xs text-slate-500">
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('cart.stripeNote')}
          </p>
          {/* Link = a link to another page of this app (no full page reload)
             className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <Link to="/shop" className="block text-center text-sm text-brand-600 dark:text-brand-300 hover:underline">
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('cart.continueShopping')}
          </Link>
        </aside>
      </div>
    </div>
  );
}

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function CartRow({ item }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  const update = useUpdateCartItem();
  // const = a name for a value that is never reassigned
  const remove = useRemoveCartItem();
  // const = a name for a value that is never reassigned
  const addBack = useAddToCart(); // for "Undo" after removing
  // const = a name for a value that is never reassigned
  // Math = number helpers (min, max, round, floor...)
  const maxAllowed = Math.min(item.stock, MAX_QUANTITY_PER_ITEM);
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // mutate = run the mutation (send the change)
  const setQuantity = (quantity) => update.mutate({ variantId: item.variantId, quantity });

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <li className="flex gap-4 p-4">
      {/* Link = a link to another page of this app (no full page reload)
         { } in JSX = run JavaScript here and show its result
         `text ${x}` = a template string: text with values inserted
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <Link to={`/products/${item.productSlug}`} className="size-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true
           alt = text describing the image for screen readers (empty = decorative)
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        {item.image && <img src={item.image} alt={item.productName} className="size-full object-cover" />}
      </Link>

      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex flex-1 flex-col gap-2">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="flex justify-between gap-4">
          <div>
            {/* Link = a link to another page of this app (no full page reload)
               { } in JSX = run JavaScript here and show its result
               `text ${x}` = a template string: text with values inserted
               className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Link to={`/products/${item.productSlug}`} className="font-medium hover:underline">
              {/* { } in JSX = run JavaScript here and show its result */}
              {item.productName}
            </Link>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <p className="text-sm text-slate-500">
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {item.variantName} · {t('cart.each', { price: formatPrice(item.unitPrice) })}
            </p>
          </div>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result */}
          <p className="font-semibold">{formatPrice(item.lineTotal)}</p>
        </div>

        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true */}
        {item.issue && (
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          <p className="text-sm text-amber-700">
            {/* { } in JSX = run JavaScript here and show its result
               a ? b : c = ternary: if a then b else c
               === = strictly equal (same value AND same type) */}
            {item.issue === 'OUT_OF_STOCK'
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              ? t('cart.outOfStock')
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              : t('cart.notEnough', { count: item.stock })}
          </p>
        )}
        {/* { } in JSX = run JavaScript here and show its result
           isError = the request failed
           a && b = AND; in JSX: show b only when a is true
           className = CSS classes (Tailwind) for this element (class is a JS keyword)
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {update.isError && <p className="text-sm text-red-600">{t('cart.updateFailed')}</p>}

        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="mt-auto flex items-center justify-between">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="flex items-center rounded-lg border border-slate-300">
            <button
              // onClick = what happens on click/tap
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              onClick={() => setQuantity(item.quantity - 1)}
              // disabled = can't be clicked or typed in
              // { } in JSX = run JavaScript here and show its result
              disabled={item.quantity <= 1}
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              className="p-2 hover:bg-slate-50 disabled:opacity-30"
              // aria-label = the name screen readers read for this element
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              aria-label={t('product.decrease')}
            >
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <Minus className="size-4" />
            </button>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result */}
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              // onClick = what happens on click/tap
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              onClick={() => setQuantity(item.quantity + 1)}
              // disabled = can't be clicked or typed in
              // { } in JSX = run JavaScript here and show its result
              disabled={item.quantity >= maxAllowed}
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              className="p-2 hover:bg-slate-50 disabled:opacity-30"
              // aria-label = the name screen readers read for this element
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              aria-label={t('product.increase')}
            >
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <Plus className="size-4" />
            </button>
          </div>
          <button
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            onClick={() =>
              // mutate = run the mutation (send the change)
              remove.mutate(
                { variantId: item.variantId },
                {
                  // "Undo" instead of an "Are you sure?" dialog: no interruption, and a mistake is one click to fix.
                  // onSuccess = runs after the request succeeded
                  // => = an arrow function (a short function)
                  onSuccess: () =>
                    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                    notify.success(t('cart.removed', { name: item.productName }), {
                      // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                      label: t('cart.undo'),
                      // onClick = what happens on click/tap
                      // => = an arrow function (a short function)
                      onClick: () =>
                        // mutate = run the mutation (send the change)
                        addBack.mutate(
                          { variantId: item.variantId, quantity: item.quantity },
                          // onError = runs if the request failed
                          { onError: notify.error },
                        ),
                    }),
                  // onError = runs if the request failed
                  onError: notify.error,
                },
              )
            }
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-600"
          >
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <Trash2 className="size-4" /> {t('cart.remove')}
          </button>
        </div>
      </div>
    </li>
  );
}
