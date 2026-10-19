import { Link } from 'react-router';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { useWishlist } from './wishlist.api';
import { PageTitle } from '@/components/layout/PageTitle';

export function WishlistPage() {
  const { data: items, isLoading, isError, error } = useWishlist();

  if (isLoading)
    return <ProductGridSkeleton count={4} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" />;
  if (isError || !items) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <PageTitle title="Wishlist" />
      <h1 className="text-2xl font-bold">
        Your wishlist <span className="text-base font-normal text-slate-500">({items.length} saved)</span>
      </h1>

      {items.length === 0 ? (
        <>
          <EmptyState title="Nothing saved yet" hint="Tap the heart on any product to save it for later." />
          <div className="text-center">
            <Link to="/shop" className="text-brand-600 dark:text-brand-300 hover:underline">
              Browse the shop
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
