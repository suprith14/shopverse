import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { CouponPreview } from '@/types/api';
import { useAuthStore } from '@/features/auth/auth.store';

// Asks the backend "what would this coupon give me on my current cart?".
// The subtotal is part of the query key ONLY so the preview runs again whenever the cart
// total changes (e.g. the user lowers a quantity and drops below the minimum order).
// The backend still calculates the subtotal itself; we never send it.
export function useCouponPreview(code: string | null, subtotal: number) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['coupon-preview', userId, code, subtotal],
    queryFn: async () =>
      (await api.get<{ preview: CouponPreview }>('/coupons/preview', { params: { code } })).data.preview,
    enabled: !!userId && !!code && subtotal > 0,
    retry: false, // "This coupon has expired" won't change by asking again
    placeholderData: keepPreviousData, // no flicker while the new total loads
  });
}
