import { Link } from 'react-router';
import { StarRating } from '@/components/ui/StarRating';
import { formatPrice } from '@/lib/format';
import type { ProductSummary } from '@/types/api';
import { WishlistButton } from '@/features/wishlist/WishlistButton';

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {product.image && (
          <img src={product.image} alt={product.name} loading="lazy"
            className="size-full object-cover transition duration-300 group-hover:scale-105" />
        )}
        {!product.inStock && (
          <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-xs font-medium text-white">
            Sold out
          </span>
        )}
        <WishlistButton productId={product.id} className="absolute right-2 top-2" />
      </div>
      <div className="space-y-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.brand}</p>
        <h3 className="line-clamp-1 font-semibold text-slate-900">{product.name}</h3>
        <StarRating value={product.ratingAvg} count={product.ratingCount} />
        <p className="pt-1 font-semibold text-brand-700">
          {formatPrice(product.basePrice)}
        </p>
      </div>
    </Link>
  );
}
