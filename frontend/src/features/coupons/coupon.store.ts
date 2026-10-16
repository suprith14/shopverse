import { create } from 'zustand';
import { useAuthStore } from '@/features/auth/auth.store';

// Which coupon code the customer has typed in. Only the CODE is kept on the frontend;
// the discount is always calculated by the backend. At checkout (Phase 3) the code is
// sent along and checked again there.

interface CouponState {
  code: string | null;
  apply: (code: string) => void;
  remove: () => void;
}

export const useCouponStore = create<CouponState>((set) => ({
  code: null,
  apply: (code) => set({ code: code.trim().toUpperCase() }),
  remove: () => set({ code: null }),
}));

// When the logged-in user changes (logout, or login as someone else), forget the coupon.
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id) useCouponStore.getState().remove();
});
