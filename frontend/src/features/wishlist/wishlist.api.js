// Wishlist: the saved products, and save/unsave.
// How these *.api.js files work (TanStack Query):
//   useQuery    = READ data. queryKey names the data in the cache; the same key anywhere = the same
//                 cached answer, fetched once. enabled: false = don't ask yet (e.g. not logged in).
//   useMutation = CHANGE data (POST/PUT/DELETE). onSuccess updates or refreshes ("invalidates")
//                 the cached queries, so every screen showing that data updates by itself.
// The user id is part of the key, so one user's cached data is never shown to the next.

// import = bring in code from another file or package
// useMemo = remember a calculated value; recalculate only when its [deps] change
import { useMemo } from 'react';
// import = bring in code from another file or package
// useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
// useQuery = READ server data with caching, loading and error states
// useQueryClient = the shared cache, to update or refresh cached data
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import = bring in code from another file or package
// api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
import { api } from '@/lib/api-client';
// import = bring in code from another file or package
import { useAuthStore } from '@/features/auth/auth.store';

// Same idea as the cart: server state cached per user.
// function = a named, reusable block of code
function useWishlistKey() {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  const userId = useAuthStore((s) => s.user?.id);
  // return = give this value back and stop the function here
  return ['wishlist', userId];
}

// export = other files can import this
// function = a named, reusable block of code
export function useWishlist() {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const status = useAuthStore((s) => s.status);
  // return = give this value back and stop the function here
  // useQuery = READ server data with caching, loading and error states
  return useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: useWishlistKey(),
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    queryFn: async () => (await api.get('/wishlist')).data.items,
    // enabled = only fetch when this is true (e.g. once logged in)
    // === = strictly equal (same value AND same type)
    enabled: status === 'authenticated',
  });
}

// A Set of saved product ids, so every heart button can check "is this saved?" instantly.
// export = other files can import this
// function = a named, reusable block of code
export function useWishlistIds() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { data } = useWishlist();
  // return = give this value back and stop the function here
  // useMemo = remember a calculated value; recalculate only when its [deps] change
  // => = an arrow function (a short function)
  // new = create an object from a class (e.g. new Date())
  // Set = a collection of unique values with fast .has() lookup
  // ?.() = call only if the function exists
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // .map = make a new array by transforming each item (in JSX: one element per item)
  return useMemo(() => new Set(data?.map((entry) => entry.product.id)), [data]);
}

// Toggle pattern: one hook for both "save" and "unsave".
// export = other files can import this
// function = a named, reusable block of code
export function useToggleWishlist() {
  // const = a name for a value that is never reassigned
  // useQueryClient = the shared cache, to update or refresh cached data
  const queryClient = useQueryClient();
  // const = a name for a value that is never reassigned
  const key = useWishlistKey();
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // { a, b } = destructuring: take properties a and b out of an object
    mutationFn: async ({ productId, save }) => {
      // const = a name for a value that is never reassigned
      // a ? b : c = ternary: if a then b else c
      // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
      // `text ${x}` = a template string: text with values inserted
      const request = save ? api.put(`/wishlist/${productId}`) : api.delete(`/wishlist/${productId}`);
      // return = give this value back and stop the function here
      // await = wait for a Promise (async result) before continuing
      return (await request).data.items;
    },
    // the server answers with the new list: put it straight into the cache (no second request)
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    // setQueryData = put a value straight into the cache (no request)
    onSuccess: (items) => queryClient.setQueryData(key, items),
  });
}
