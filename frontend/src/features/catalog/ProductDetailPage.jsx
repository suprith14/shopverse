// /products/:slug: one product. Photos, price, options (sizes/colours = variants), quantity,
// Add to cart, details and reviews.
// The page is split in parts: ProductDetailPage loads the data, ProductView shows it, AddToCart
// handles the quantity and the cart call, Attributes lists the product details.

import { useTranslation } from 'react-i18next';
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
  // the :slug part of the URL, e.g. "air-stride-runner"
  const { slug = '' } = useParams();
  // GET /api/catalog/products/:slug (catalog.api.js)
  const { data: product, isLoading, isError, error } = useProduct(slug);

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !product) return <ErrorState error={error} />;
  // key={product.id} resets the selected image/variant when navigating to another product.
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }) {
  const { t } = useTranslation();
  // which photo is shown big
  const [imageIndex, setImageIndex] = useState(0);
  // Default to the first variant that is in stock.
  const [variantId, setVariantId] = useState((product.variants.find((v) => v.stock > 0) ?? product.variants[0])?.id);
  // the chosen option: its price and stock are what the page shows
  const variant = product.variants.find((v) => v.id === variantId);

  return (
    <div className="space-y-4">
      <PageTitle title={product.name} />
      {/* Breadcrumb: Shop / Category / Product name */}
      <nav className="text-sm text-slate-500">
        <Link to="/shop" className="hover:underline">
          {t('nav.shop')}
        </Link>{' '}
        /{' '}
        <Link to={`/shop?category=${product.category.slug}`} className="hover:underline">
          {t(`category.${product.category.slug}`, { defaultValue: product.category.name })}
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

          <p className="text-3xl font-semibold text-brand-700 dark:text-brand-300">{formatPrice(variant?.price ?? product.basePrice)}</p>
          <p className="leading-relaxed text-slate-600">{product.description}</p>

          <div>
            <h2 className="mb-2 text-sm font-semibold">{t('product.chooseOption')}</h2>
            <div className="flex flex-wrap gap-2">
              {/* One button per option; sold-out options are disabled and struck through */}
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  disabled={v.stock === 0}
                  className={`rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${
                    v.id === variantId
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:text-brand-300'
                      : 'border-slate-300 bg-surface hover:border-slate-400'
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
                {/* "Only 3 left!" in amber when 5 or fewer remain (a gentle nudge, and true) */}
                {variant.stock === 0
                  ? t('product.outOfStock')
                  : variant.stock <= 5
                    ? t('product.onlyLeft', { count: variant.stock })
                    : t('product.inStock')}
              </p>
            )}
          </div>

          {/* key: picking another size resets the quantity to 1 */}
          <AddToCart key={variant?.id} variant={variant} productName={product.name} />

          <Attributes attributes={product.attributes} />
        </div>
      </div>

      {/* Reviews load separately, so the product shows first */}
      <ProductReviews productId={product.id} />
    </div>
  );
}

// Same cap as the backend (cart.schema.ts). The backend still enforces it and the stock.
const MAX_PER_ITEM = 10;

function AddToCart({ variant, productName }) {
  const { t } = useTranslation();
  const status = useAuthStore((s) => s.status);
  const navigate = useNavigate();
  const location = useLocation();
  // POST /api/cart/items; on success the cart badge in the header updates (cart.api.js)
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  // the + button stops at the stock or at 10, whichever is lower
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
          notify.success(t('product.added', { count: quantity, name: productName, variant: variant.name }), {
            label: t('product.viewCart'),
            onClick: () => navigate('/cart'),
          }),
        onError: notify.error, // e.g. "Only 2 left in stock"
      },
    );
  };

  // no option chosen, or it has no stock: the button is disabled
  const soldOut = !variant || variant.stock === 0;

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        {/* Quantity stepper: buttons instead of a number box, which are easier to tap on phones
             and can't produce "0", "-3" or "1.5". Limited by stock and the per-item cap. */}
        <div
          className="flex items-center rounded-lg border border-slate-300 bg-surface"
          role="group"
          aria-label={t('product.quantity')}
        >
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={soldOut || quantity <= 1}
            className="p-3 hover:bg-slate-50 disabled:opacity-30"
            aria-label={t('product.decrease')}
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
            aria-label={t('product.increase')}
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Button className="flex-1 py-3" onClick={onClick} loading={addToCart.isPending} disabled={soldOut}>
          <ShoppingCart className="size-4" /> {soldOut ? t('product.outOfStock') : t('product.addToCart')}
        </Button>
      </div>
    </div>
  );
}

// Renders category-specific details: author/pages for books, specs for electronics, etc.
function Attributes({ attributes }) {
  const { t } = useTranslation();
  // { author: "X", specs: { ram: "8 GB" } } -> [["author","X"], ["ram","8 GB"]]: one flat list of rows
  const flat = Object.entries(attributes).flatMap(([key, value]) =>
    value && typeof value === 'object' ? Object.entries(value) : [[key, value]],
  );
  if (flat.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-surface">
      <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">{t('product.details')}</h2>
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
