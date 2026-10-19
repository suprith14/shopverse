// One product tile in a grid (home page, shop, wishlist): image, brand, name, stars, price.
// The whole card is a link to the product page; the heart button sits on top of the image.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { StarRating } from '@/components/ui/StarRating';
import { formatPrice } from '@/lib/format';
import { WishlistButton } from '@/features/wishlist/WishlistButton';

export function ProductCard({ product }) {
  const { t } = useTranslation();
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-surface transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            // images below the screen load only when scrolled near
            loading="lazy"
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        {/* Every variant sold out: a dark "Sold out" badge on the photo (night = dark in both themes) */}
        {!product.inStock && (
          <span className="absolute left-2 top-2 rounded-full bg-night/80 px-2 py-0.5 text-xs font-medium text-white">
            {t('catalog.soldOut')}
          </span>
        )}
        {/* Its click handler stops the card's link from opening (see WishlistButton) */}
        <WishlistButton productId={product.id} className="absolute right-2 top-2" />
      </div>
      <div className="space-y-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.brand}</p>
        <h3 className="line-clamp-1 font-semibold text-slate-900">{product.name}</h3>
        <StarRating value={product.ratingAvg} count={product.ratingCount} />
        {/* basePrice = the cheapest variant, kept up to date by the backend */}
        <p className="pt-1 font-semibold text-brand-700 dark:text-brand-300">{formatPrice(product.basePrice)}</p>
      </div>
    </Link>
  );
}
