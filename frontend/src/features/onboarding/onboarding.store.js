import { create } from 'zustand';
import { useAuthStore } from '@/features/auth/auth.store';

export const useOnboardingStore = create((set) => ({
  open: false,
  start: () => set({ open: true }),
  finish: () => set({ open: false }),
}));

// Logging out (or switching account) closes it.
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id) useOnboardingStore.getState().finish();
});
