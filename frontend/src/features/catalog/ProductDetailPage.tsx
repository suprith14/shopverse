import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { Check, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState, Spinner } from '@/components/ui/States';
import { StarRating } from '@/components/ui/StarRating';
import { formatPrice } from '@/lib/format';
import type { ProductDetail, ProductVariant } from '@/types/api';
import { useAuthStore } from '@/features/auth/auth.store';
import { useAddToCart } from '@/features/cart/cart.api';
import { WishlistButton } from '@/features/wishlist/WishlistButton';
import { ProductReviews } from '@/features/reviews/ProductReviews';
import { useProduct } from './catalog.api';

export function ProductDetailPage() {
  const { slug = '' } = useParams();
  const { data: product, isLoading, isError, error } = useProduct(slug);

  if (isLoading) return <Spinner />;
  if (isError || !product) return <ErrorState error={error} />;
  // key={product.id} resets the selected image/variant when navigating to another product.
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }: { product: ProductDetail }) {
  const [imageIndex, setImageIndex] = useState(0);
  // Default to the first variant that is in stock.
  const [variantId, setVariantId] = useState(
    (product.variants.find((v) => v.stock > 0) ?? product.variants[0])?.id,
  );
  const variant = product.variants.find((v) => v.id === variantId);

  return (
    <div className="space-y-4">
      <nav className="text-sm text-slate-500">
        <Link to="/shop" className="hover:underline">Shop</Link> /{' '}
        <Link to={`/shop?category=${product.category.slug}`} className="hover:underline">{product.category.name}</Link> /{' '}
        <span className="text-slate-800">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
            <img src={product.images[imageIndex]} alt={product.name} className="size-full object-cover" />
          </div>
          <div className="flex gap-3">
            {product.images.map((src, i) => (
              <button key={src} onClick={() => setImageIndex(i)}
                className={`size-20 overflow-hidden rounded-lg ring-2 ${i === imageIndex ? 'ring-brand-500' : 'ring-transparent'}`}>
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
            <div className="mt-2"><StarRating value={product.ratingAvg} count={product.ratingCount} size="md" /></div>
          </div>

          <p className="text-3xl font-semibold text-brand-700">{formatPrice(variant?.price ?? product.basePrice)}</p>
          <p className="leading-relaxed text-slate-600">{product.description}</p>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Choose an option</h2>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button key={v.id} onClick={() => setVariantId(v.id)} disabled={v.stock === 0}
                  className={`rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${
                    v.id === variantId ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}>
                  {v.name}
                </button>
              ))}
            </div>
            {variant && (
              <p className={`mt-2 text-sm ${variant.stock > 0 && variant.stock <= 5 ? 'text-amber-600' : 'text-slate-500'}`}>
                {variant.stock === 0 ? 'Out of stock' : variant.stock <= 5 ? `Only ${variant.stock} left!` : 'In stock'}
              </p>
            )}
          </div>

          <AddToCart variant={variant} />

          <Attributes attributes={product.attributes} />
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}

function AddToCart({ variant }: { variant?: ProductVariant }) {
  const status = useAuthStore((s) => s.status);
  const navigate = useNavigate();
  const location = useLocation();
  const addToCart = useAddToCart();

  const onClick = () => {
    // Guests are sent to login, then brought back to this product.
    if (status !== 'authenticated') {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (variant) addToCart.mutate({ variantId: variant.id, quantity: 1 });
  };

  return (
    <div className="space-y-2">
      <Button className="w-full py-3" onClick={onClick} loading={addToCart.isPending} disabled={!variant || variant.stock === 0}>
        <ShoppingCart className="size-4" /> {variant?.stock === 0 ? 'Out of stock' : 'Add to cart'}
      </Button>
      {addToCart.isSuccess && (
        <p className="flex items-center gap-1.5 text-sm text-green-700">
          <Check className="size-4" /> Added to cart. <Link to="/cart" className="font-medium underline">View cart</Link>
        </p>
      )}
      {/* Shows the backend's message, e.g. "Only 2 left in stock" */}
      {addToCart.isError && <ErrorState error={addToCart.error} />}
    </div>
  );
}

// Renders category-specific details: author/pages for books, specs for electronics, etc.
function Attributes({ attributes }: { attributes: Record<string, unknown> }) {
  const flat = Object.entries(attributes).flatMap(([key, value]) =>
    value && typeof value === 'object' ? Object.entries(value as Record<string, unknown>) : [[key, value] as const],
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
