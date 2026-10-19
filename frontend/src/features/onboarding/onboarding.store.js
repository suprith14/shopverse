// Is the "set up your profile" wizard open? A tiny global store (Zustand) so RegisterPage can
// open it and the wizard (OnboardingDialog, mounted in RootLayout) can react, without passing props.

// import = bring in code from another file or package
// create (zustand) = make a small global store any component can read
import { create } from 'zustand';
// import = bring in code from another file or package
import { useAuthStore } from '@/features/auth/auth.store';

// export = other files can import this
// const = a name for a value that is never reassigned
// create (zustand) = make a small global store any component can read
// => = an arrow function (a short function)
export const useOnboardingStore = create((set) => ({
  open: false,
  // called right after creating an account
  // => = an arrow function (a short function)
  start: () => set({ open: true }),
  // Done, Skip, Esc or the close button
  // => = an arrow function (a short function)
  finish: () => set({ open: false }),
}));

// Logging out (or switching account) closes it.
// subscribe = run a function whenever the store changes
// => = an arrow function (a short function)
useAuthStore.subscribe((state, previous) => {
  // if (...) = run the next part only when the condition is true
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // !== = not strictly equal
  // getState = read the store outside React
  if (state.user?.id !== previous.user?.id) useOnboardingStore.getState().finish();
});
