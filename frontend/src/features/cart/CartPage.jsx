// /cart: the items, the order summary (subtotal, coupon, total), the delivery address and the
// Checkout button. Prices always come from the server (current price), never from the browser.
// Checkout creates the order (stock is reserved) and sends the browser to Stripe to pay.

import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, Lock, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/format';
import { useAddToCart, useCart, useClearCart, useRemoveCartItem, useUpdateCartItem } from './cart.api';
import { notify } from '@/lib/notify';
import { CouponBox } from '@/features/coupons/CouponBox';
import { useCouponPreview } from '@/features/coupons/coupons.api';
import { useCouponStore } from '@/features/coupons/coupon.store';
import { usePlaceOrder } from '@/features/orders/orders.api';
import { DeliveryAddressPicker } from '@/features/account/DeliveryAddressPicker';
import { CheckoutSteps } from '@/features/orders/CheckoutSteps';
import { PageTitle } from '@/components/layout/PageTitle';

// Same limit as the backend. The backend still enforces it; this only disables the + button.
const MAX_QUANTITY_PER_ITEM = 10;

export function CartPage() {
  const { t } = useTranslation();
  // GET /api/cart: items with current prices, stock and any problems (cart.api.js)
  const { data: cart, isLoading, isError, error } = useCart();
  const clearCart = useClearCart();
  // the code the customer typed (only the code is kept in the browser)
  const couponCode = useCouponStore((s) => s.code);
  // the server checks the code and calculates the discount for this subtotal
  const couponPreview = useCouponPreview(couponCode, cart?.subtotal ?? 0);
  // Only count the discount if the preview is for the code currently applied and is valid.
  const coupon = !couponPreview.isError && couponPreview.data?.code === couponCode ? couponPreview.data : undefined;
  const discount = coupon?.discount ?? 0;
  // POST /api/orders -> { checkoutUrl } -> the browser goes to Stripe (orders.api.js)
  const placeOrder = usePlaceOrder();
  // the chosen delivery address (the picker below sets it)
  const [addressId, setAddressId] = useState(null);
  // to scroll to the address form when Checkout is pressed without one
  const addressSection = useRef(null);

  if (isLoading) return <ListSkeleton />;
  if (isError || !cart) return <ErrorState error={error} />;

  if (cart.items.length === 0) {
    return (
      <div className="space-y-4">
        <PageTitle title={t('cart.title')} />
        <h1 className="text-2xl font-bold">{t('cart.title')}</h1>
        <EmptyState title={t('cart.empty')} hint={t('cart.emptyHint')} />
        <div className="text-center">
          <Link to="/shop" className="text-brand-600 dark:text-brand-300 hover:underline">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle title={t('cart.title')} />
      {/* Step 1 of 3: Cart & delivery -> Payment (Stripe) -> Confirmation */}
      <CheckoutSteps current={1} />
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">
          {t('cart.title')}{' '}
          <span className="text-base font-normal text-slate-500">{t('cart.itemCount', { count: cart.itemCount })}</span>
        </h1>
        <button onClick={() => clearCart.mutate(undefined)} className="text-sm text-slate-500 hover:text-red-600">
          {t('cart.clear')}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-surface">
          {cart.items.map((item) => (
            // Each row has its own quantity buttons and Remove (with Undo), see CartRow below
            <CartRow key={item.variantId} item={item} />
          ))}
        </ul>

        {/* Order summary */}
        <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-surface p-5">
          <h2 className="font-semibold">{t('cart.summary')}</h2>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">{t('cart.subtotal')}</span>
            <span className="font-medium">{formatPrice(cart.subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-700">
              <span>{t('cart.discount', { code: coupon?.code })}</span>
              <span className="font-medium">−{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold">
            <span>{t('cart.total')}</span>
            <span>{formatPrice(cart.subtotal - discount)}</span>
          </div>
          {/* Type a code, see the saving or why it doesn't work */}
          <CouponBox preview={couponPreview} />
          <div ref={addressSection} className="scroll-mt-24 border-t border-slate-200 pt-4">
            <DeliveryAddressPicker value={addressId} onChange={setAddressId} />
          </div>
          {cart.hasIssues && (
            <p className="flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="size-4 shrink-0" /> {t('cart.hasIssues')}
            </p>
          )}
          {placeOrder.isError && <ErrorState error={placeOrder.error} />}
          {/* Only a coupon the backend accepted is sent. The backend checks it again anyway. */}
          {/* Not disabled when the address is missing: a dead button doesn't say why (and tooltips
               don't exist on phones). Tapping it takes you to the address form instead. */}
          <Button
            className="w-full py-3"
            loading={placeOrder.isPending}
            disabled={cart.hasIssues || cart.subtotal === 0}
            onClick={() => {
              if (!addressId) {
                addressSection.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Put the cursor in the first field of the address form, so typing can start right away.
                addressSection.current?.querySelector('input')?.focus({ preventScroll: true });
                notify.error(new Error(t('cart.addAddressFirst')));
                return;
              }
              placeOrder.mutate({ couponCode: coupon?.code, addressId });
            }}
          >
            <Lock className="size-4" />
            {addressId
              ? t('cart.checkout', { total: formatPrice(cart.subtotal - discount) })
              : t('cart.addAddressToContinue')}
          </Button>
          <p className="text-center text-xs text-slate-500">
            {t('cart.stripeNote')}
          </p>
          <Link to="/shop" className="block text-center text-sm text-brand-600 dark:text-brand-300 hover:underline">
            {t('cart.continueShopping')}
          </Link>
        </aside>
      </div>
    </div>
  );
}

function CartRow({ item }) {
  const { t } = useTranslation();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const addBack = useAddToCart(); // for "Undo" after removing
  const maxAllowed = Math.min(item.stock, MAX_QUANTITY_PER_ITEM);
  const setQuantity = (quantity) => update.mutate({ variantId: item.variantId, quantity });

  return (
    <li className="flex gap-4 p-4">
      <Link to={`/products/${item.productSlug}`} className="size-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {item.image && <img src={item.image} alt={item.productName} className="size-full object-cover" />}
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between gap-4">
          <div>
            <Link to={`/products/${item.productSlug}`} className="font-medium hover:underline">
              {item.productName}
            </Link>
            <p className="text-sm text-slate-500">
              {item.variantName} · {t('cart.each', { price: formatPrice(item.unitPrice) })}
            </p>
          </div>
          <p className="font-semibold">{formatPrice(item.lineTotal)}</p>
        </div>

        {item.issue && (
          <p className="text-sm text-amber-700">
            {item.issue === 'OUT_OF_STOCK'
              ? t('cart.outOfStock')
              : t('cart.notEnough', { count: item.stock })}
          </p>
        )}
        {update.isError && <p className="text-sm text-red-600">{t('cart.updateFailed')}</p>}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-slate-300">
            <button
              onClick={() => setQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="p-2 hover:bg-slate-50 disabled:opacity-30"
              aria-label={t('product.decrease')}
            >
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => setQuantity(item.quantity + 1)}
              disabled={item.quantity >= maxAllowed}
              className="p-2 hover:bg-slate-50 disabled:opacity-30"
              aria-label={t('product.increase')}
            >
              <Plus className="size-4" />
            </button>
          </div>
          <button
            onClick={() =>
              remove.mutate(
                { variantId: item.variantId },
                {
                  // "Undo" instead of an "Are you sure?" dialog: no interruption, and a mistake is one click to fix.
                  onSuccess: () =>
                    notify.success(t('cart.removed', { name: item.productName }), {
                      label: t('cart.undo'),
                      onClick: () =>
                        addBack.mutate(
                          { variantId: item.variantId, quantity: item.quantity },
                          { onError: notify.error },
                        ),
                    }),
                  onError: notify.error,
                },
              )
            }
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-600"
          >
            <Trash2 className="size-4" /> {t('cart.remove')}
          </button>
        </div>
      </div>
    </li>
  );
}
