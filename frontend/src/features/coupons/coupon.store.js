// import = bring in code from another file or package
// create (zustand) = make a small global store any component can read
import { create } from 'zustand';
// import = bring in code from another file or package
import { useAuthStore } from '@/features/auth/auth.store';

// Which coupon code the customer has typed in. Only the CODE is kept on the frontend;
// the discount is always calculated by the backend. At checkout (Phase 3) the code is
// sent along and checked again there.

// export = other files can import this
// const = a name for a value that is never reassigned
// create (zustand) = make a small global store any component can read
// => = an arrow function (a short function)
export const useCouponStore = create((set) => ({
  code: null,
  // => = an arrow function (a short function)
  // .trim = remove spaces at both ends
  apply: (code) => set({ code: code.trim().toUpperCase() }),
  // => = an arrow function (a short function)
  remove: () => set({ code: null }),
}));

// When the logged-in user changes (logout, or login as someone else), forget the coupon.
// subscribe = run a function whenever the store changes
// => = an arrow function (a short function)
useAuthStore.subscribe((state, previous) => {
  // if (...) = run the next part only when the condition is true
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // !== = not strictly equal
  // getState = read the store outside React
  if (state.user?.id !== previous.user?.id) useCouponStore.getState().remove();
});
