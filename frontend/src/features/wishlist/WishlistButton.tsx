import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/features/auth/auth.store';
import { useToggleWishlist, useWishlistIds } from './wishlist.api';

// The heart button. Used on product cards and on the product page.
export function WishlistButton({ productId, className = '' }: { productId: string; className?: string }) {
  const status = useAuthStore((s) => s.status);
  const navigate = useNavigate();
  const location = useLocation();
  const savedIds = useWishlistIds();
  const toggle = useToggleWishlist();

  // Optimistic UI, the simple way: while the request is running, show what the user
  // asked for. When it finishes, the real data from the server takes over.
  // If the request fails, it falls back to the real (unchanged) data on its own.
  const saved = toggle.isPending ? toggle.variables.save : savedIds.has(productId);

  const onClick = (e: MouseEvent) => {
    // On a product card the heart sits inside a link. Don't open the product page.
    e.preventDefault();
    e.stopPropagation();
    if (status !== 'authenticated') {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    toggle.mutate({ productId, save: !saved });
  };

  return (
    <button onClick={onClick} aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'} title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 ${className}`}>
      <Heart className={`size-5 ${saved ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
    </button>
  );
}
