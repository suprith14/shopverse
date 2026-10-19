// import = bring in code from another file or package
// keepPreviousData = keep showing the old results while the new ones load
// useQuery = READ server data with caching, loading and error states
import { keepPreviousData, useQuery } from '@tanstack/react-query';
// import = bring in code from another file or package
// api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
import { api } from '@/lib/api-client';
// import = bring in code from another file or package
import { useAuthStore } from '@/features/auth/auth.store';

// Asks the backend "what would this coupon give me on my current cart?".
// The subtotal is part of the query key ONLY so the preview runs again whenever the cart
// total changes (e.g. the user lowers a quantity and drops below the minimum order).
// The backend still calculates the subtotal itself; we never send it.
// export = other files can import this
// function = a named, reusable block of code
export function useCouponPreview(code, subtotal) {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  const userId = useAuthStore((s) => s.user?.id);
  // return = give this value back and stop the function here
  // useQuery = READ server data with caching, loading and error states
  return useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: ['coupon-preview', userId, code, subtotal],
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    queryFn: async () => (await api.get('/coupons/preview', { params: { code } })).data.preview,
    // enabled = only fetch when this is true (e.g. once logged in)
    // !!x = turn any value into true/false
    // ! = NOT: flips true/false
    // a && b = AND; in JSX: show b only when a is true
    enabled: !!userId && !!code && subtotal > 0,
    retry: false, // "This coupon has expired" won't change by asking again
    // placeholderData = what to show while the real data loads
    // keepPreviousData = keep showing the old results while the new ones load
    placeholderData: keepPreviousData, // no flicker while the new total loads
    // No error popup: the coupon box shows the reason right under the code ("This coupon has
    // expired"), and the check re-runs whenever the cart total changes
    // meta = extra info for the global error handler in main.jsx
    meta: { errorPopup: false },
  });
}
