import { Link } from 'react-router';
import { AlertTriangle, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States';
import { formatPrice } from '@/lib/format';
import type { CartItem } from '@/types/api';
import { useCart, useClearCart, useRemoveCartItem, useUpdateCartItem } from './cart.api';
import { CouponBox } from '@/features/coupons/CouponBox';
import { useCouponPreview } from '@/features/coupons/coupons.api';
import { useCouponStore } from '@/features/coupons/coupon.store';

// Same limit as the backend. The backend still enforces it; this only disables the + button.
const MAX_QUANTITY_PER_ITEM = 10;

export function CartPage() {
  const { data: cart, isLoading, isError, error } = useCart();
  const clearCart = useClearCart();
  const couponCode = useCouponStore((s) => s.code);
  const couponPreview = useCouponPreview(couponCode, cart?.subtotal ?? 0);
  // Only count the discount if the preview is for the code currently applied and is valid.
  const coupon = !couponPreview.isError && couponPreview.data?.code === couponCode ? couponPreview.data : undefined;
  const discount = coupon?.discount ?? 0;

  if (isLoading) return <Spinner />;
  if (isError || !cart) return <ErrorState error={error} />;

  if (cart.items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Your cart</h1>
        <EmptyState title="Your cart is empty" hint="Find something you like in the shop." />
        <div className="text-center">
          <Link to="/shop" className="text-brand-600 hover:underline">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Your cart <span className="text-base font-normal text-slate-500">({cart.itemCount} items)</span></h1>
        <button onClick={() => clearCart.mutate(undefined)} className="text-sm text-slate-500 hover:text-red-600">Clear cart</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {cart.items.map((item) => <CartRow key={item.variantId} item={item} />)}
        </ul>

        {/* Order summary */}
        <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Order summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">{formatPrice(cart.subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-700">
              <span>Discount ({coupon?.code})</span>
              <span className="font-medium">−{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold">
            <span>Total</span>
            <span>{formatPrice(cart.subtotal - discount)}</span>
          </div>
          <CouponBox preview={couponPreview} />
          <p className="text-xs text-slate-500">Shipping is calculated at checkout.</p>
          {cart.hasIssues && (
            <p className="flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="size-4 shrink-0" /> Some items are unavailable. Fix them before checking out.
            </p>
          )}
          {/* Checkout is implemented in Phase 3 */}
          <Button className="w-full py-3" disabled title="Coming in Phase 3">Checkout (coming soon)</Button>
          <Link to="/shop" className="block text-center text-sm text-brand-600 hover:underline">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const maxAllowed = Math.min(item.stock, MAX_QUANTITY_PER_ITEM);
  const setQuantity = (quantity: number) => update.mutate({ variantId: item.variantId, quantity });

  return (
    <li className="flex gap-4 p-4">
      <Link to={`/products/${item.productSlug}`} className="size-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {item.image && <img src={item.image} alt={item.productName} className="size-full object-cover" />}
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between gap-4">
          <div>
            <Link to={`/products/${item.productSlug}`} className="font-medium hover:underline">{item.productName}</Link>
            <p className="text-sm text-slate-500">{item.variantName} · {formatPrice(item.unitPrice)} each</p>
          </div>
          <p className="font-semibold">{formatPrice(item.lineTotal)}</p>
        </div>

        {item.issue && (
          <p className="text-sm text-amber-700">
            {item.issue === 'OUT_OF_STOCK' ? 'Out of stock. Remove it to continue.' : `Only ${item.stock} left. Lower the quantity.`}
          </p>
        )}
        {update.isError && <p className="text-sm text-red-600">Couldn't update quantity. Please try again.</p>}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-slate-300">
            <button onClick={() => setQuantity(item.quantity - 1)} disabled={item.quantity <= 1}
              className="p-2 hover:bg-slate-50 disabled:opacity-30" aria-label="Decrease quantity">
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button onClick={() => setQuantity(item.quantity + 1)} disabled={item.quantity >= maxAllowed}
              className="p-2 hover:bg-slate-50 disabled:opacity-30" aria-label="Increase quantity">
              <Plus className="size-4" />
            </button>
          </div>
          <button onClick={() => remove.mutate({ variantId: item.variantId })}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-600">
            <Trash2 className="size-4" /> Remove
          </button>
        </div>
      </div>
    </li>
  );
}
