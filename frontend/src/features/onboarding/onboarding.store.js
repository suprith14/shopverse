// Is the "set up your profile" wizard open? A tiny global store (Zustand) so RegisterPage can
// open it and the wizard (OnboardingDialog, mounted in RootLayout) can react, without passing props.

import { create } from 'zustand';
import { useAuthStore } from '@/features/auth/auth.store';

export const useOnboardingStore = create((set) => ({
  open: false,
  // called right after creating an account
  start: () => set({ open: true }),
  // Done, Skip, Esc or the close button
  finish: () => set({ open: false }),
}));

// Logging out (or switching account) closes it.
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id) useOnboardingStore.getState().finish();
});
