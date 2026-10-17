import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/States';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import { StarRating } from '@/components/ui/StarRating';
import { formatPrice } from '@/lib/format';
import { useAuthStore } from '@/features/auth/auth.store';
import { useAddToCart } from '@/features/cart/cart.api';
import { WishlistButton } from '@/features/wishlist/WishlistButton';
import { ProductReviews } from '@/features/reviews/ProductReviews';
import { useProduct } from './catalog.api';
import { notify } from '@/lib/notify';
import { PageTitle } from '@/components/layout/PageTitle';

export function ProductDetailPage() {
  const { slug = '' } = useParams();
  const { data: product, isLoading, isError, error } = useProduct(slug);

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !product) return <ErrorState error={error} />;
  // key={product.id} resets the selected image/variant when navigating to another product.
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }) {
  const [imageIndex, setImageIndex] = useState(0);
  // Default to the first variant that is in stock.
  const [variantId, setVariantId] = useState((product.variants.find((v) => v.stock > 0) ?? product.variants[0])?.id);
  const variant = product.variants.find((v) => v.id === variantId);

  return (
    <div className="space-y-4">
      <PageTitle title={product.name} />
      <nav className="text-sm text-slate-500">
        <Link to="/shop" className="hover:underline">
          Shop
        </Link>{' '}
        /{' '}
        <Link to={`/shop?category=${product.category.slug}`} className="hover:underline">
          {product.category.name}
        </Link>{' '}
        / <span className="text-slate-800">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
            <img src={product.images[imageIndex]} alt={product.name} className="size-full object-cover" />
          </div>
          <div className="flex gap-3">
            {product.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setImageIndex(i)}
                className={`size-20 overflow-hidden rounded-lg ring-2 ${i === imageIndex ? 'ring-brand-500' : 'ring-transparent'}`}
              >
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info + variant picker */}
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{product.brand}</p>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <WishlistButton productId={product.id} className="shrink-0 border border-slate-200" />
            </div>
            <div className="mt-2">
              <StarRating value={product.ratingAvg} count={product.ratingCount} size="md" />
            </div>
          </div>

          <p className="text-3xl font-semibold text-brand-700">{formatPrice(variant?.price ?? product.basePrice)}</p>
          <p className="leading-relaxed text-slate-600">{product.description}</p>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Choose an option</h2>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  disabled={v.stock === 0}
                  className={`rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${
                    v.id === variantId
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
            {variant && (
              <p
                className={`mt-2 text-sm ${variant.stock > 0 && variant.stock <= 5 ? 'text-amber-600' : 'text-slate-500'}`}
              >
                {variant.stock === 0 ? 'Out of stock' : variant.stock <= 5 ? `Only ${variant.stock} left!` : 'In stock'}
              </p>
            )}
          </div>

          {/* key: picking another size resets the quantity to 1 */}
          <AddToCart key={variant?.id} variant={variant} productName={product.name} />

          <Attributes attributes={product.attributes} />
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}

// Same cap as the backend (cart.schema.ts). The backend still enforces it and the stock.
const MAX_PER_ITEM = 10;

function AddToCart({ variant, productName }) {
  const status = useAuthStore((s) => s.status);
  const navigate = useNavigate();
  const location = useLocation();
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const max = Math.max(1, Math.min(variant?.stock ?? 1, MAX_PER_ITEM));

  const onClick = () => {
    // Guests are sent to login, then brought back to this product.
    if (status !== 'authenticated') {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!variant) return;
    addToCart.mutate(
      { variantId: variant.id, quantity },
      {
        onSuccess: () =>
          notify.success(`Added ${quantity} × ${productName} (${variant.name})`, {
            label: 'View cart',
            onClick: () => navigate('/cart'),
          }),
        onError: notify.error, // e.g. "Only 2 left in stock"
      },
    );
  };

  const soldOut = !variant || variant.stock === 0;

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        {/* Quantity stepper: buttons instead of a number box, which are easier to tap on phones
             and can't produce "0", "-3" or "1.5". Limited by stock and the per-item cap. */}
        <div
          className="flex items-center rounded-lg border border-slate-300 bg-white"
          role="group"
          aria-label="Quantity"
        >
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={soldOut || quantity <= 1}
            className="p-3 hover:bg-slate-50 disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(max, q + 1))}
            disabled={soldOut || quantity >= max}
            className="p-3 hover:bg-slate-50 disabled:opacity-30"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Button className="flex-1 py-3" onClick={onClick} loading={addToCart.isPending} disabled={soldOut}>
          <ShoppingCart className="size-4" /> {soldOut ? 'Out of stock' : 'Add to cart'}
        </Button>
      </div>
    </div>
  );
}

// Renders category-specific details: author/pages for books, specs for electronics, etc.
function Attributes({ attributes }) {
  const flat = Object.entries(attributes).flatMap(([key, value]) =>
    value && typeof value === 'object' ? Object.entries(value) : [[key, value]],
  );
  if (flat.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">Details</h2>
      <dl className="divide-y divide-slate-100 text-sm">
        {flat.map(([key, value]) => (
          <div key={key} className="grid grid-cols-3 px-4 py-2.5">
            <dt className="capitalize text-slate-500">{key}</dt>
            <dd className="col-span-2 text-slate-800">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
