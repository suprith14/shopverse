import { create } from 'zustand';
import { useAuthStore } from '@/features/auth/auth.store';

// Whether the "set up your profile" wizard is open. Opened once, right after creating an
// account; never on a normal login (that would be nagging). Everything it asks for can be
// changed later in My account.
interface OnboardingState {
  open: boolean;
  start: () => void;
  finish: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  open: false,
  start: () => set({ open: true }),
  finish: () => set({ open: false }),
}));

// Logging out (or switching account) closes it.
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id) useOnboardingStore.getState().finish();
});
