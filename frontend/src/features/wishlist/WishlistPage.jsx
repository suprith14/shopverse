// /wishlist: the products this customer saved with the heart button.
// Data: useWishlist() -> GET /api/wishlist (features/wishlist/wishlist.api.js).

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { useWishlist } from './wishlist.api';
import { PageTitle } from '@/components/layout/PageTitle';

export function WishlistPage() {
  const { t } = useTranslation();
  const { data: items, isLoading, isError, error } = useWishlist();

  // grey placeholder cards while loading (no layout jump when real cards arrive)
  if (isLoading)
    return <ProductGridSkeleton count={4} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" />;
  if (isError || !items) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <PageTitle title={t('nav.wishlist')} />
      <h1 className="text-2xl font-bold">
        {t('wishlistPage.title')}{' '}
        <span className="text-base font-normal text-slate-500">{t('wishlistPage.savedCount', { count: items.length })}</span>
      </h1>

      {/* Nothing saved yet: a friendly empty state with a link to the shop */}
      {items.length === 0 ? (
        <>
          <EmptyState title={t('wishlistPage.empty')} hint={t('wishlistPage.emptyHint')} />
          <div className="text-center">
            <Link to="/shop" className="text-brand-600 dark:text-brand-300 hover:underline">
              {t('wishlistPage.browse')}
            </Link>
          </div>
        </>
      ) : (
        // Same product cards as the shop. Tapping the heart here removes the item.
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((entry) => (
            <ProductCard key={entry.product.id} product={entry.product} />
          ))}
        </div>
      )}
    </div>
  );
}
