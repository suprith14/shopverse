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

// The cart is server state: the backend is the source of truth, React Query keeps a copy.
// The query key includes the user id, so after logging in as someone else we never
// show the previous user's cart from the cache.
// function = a named, reusable block of code
function useCartKey() {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  const userId = useAuthStore((s) => s.user?.id);
  // return = give this value back and stop the function here
  return ['cart', userId];
}

// export = other files can import this
// function = a named, reusable block of code
export function useCart() {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const status = useAuthStore((s) => s.status);
  // return = give this value back and stop the function here
  // useQuery = READ server data with caching, loading and error states
  return useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: useCartKey(),
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    queryFn: async () => (await api.get('/cart')).data.cart,
    // enabled = only fetch when this is true (e.g. once logged in)
    // === = strictly equal (same value AND same type)
    enabled: status === 'authenticated', // guests have no cart, don't call the API
  });
}

// Every cart endpoint returns the full, updated cart. We put it straight into the cache,
// so the page and the header badge update without another GET request.
// function = a named, reusable block of code
function useCartMutation(request) {
  // const = a name for a value that is never reassigned
  // useQueryClient = the shared cache, to update or refresh cached data
  const queryClient = useQueryClient();
  // const = a name for a value that is never reassigned
  const key = useCartKey();
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    mutationFn: async (input) => (await request(input)).data.cart,
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    // setQueryData = put a value straight into the cache (no request)
    onSuccess: (cart) => queryClient.setQueryData(key, cart),
  });
}

// export = other files can import this
// function = a named, reusable block of code
export function useAddToCart() {
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
  return useCartMutation((input) => api.post('/cart/items', input));
}

// export = other files can import this
// function = a named, reusable block of code
export function useClearCart() {
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
  return useCartMutation(() => api.delete('/cart'));
}

// Optimistic update: change the screen immediately, THEN tell the server.
// If the server says no (e.g. "Only 2 left"), roll back to what it was before.
// This makes +/- buttons feel instant even on a slow connection.
// function = a named, reusable block of code
function useOptimisticCartMutation(request, applyLocally) {
  // const = a name for a value that is never reassigned
  // useQueryClient = the shared cache, to update or refresh cached data
  const queryClient = useQueryClient();
  // const = a name for a value that is never reassigned
  const key = useCartKey();
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    mutationFn: async (input) => (await request(input)).data.cart,
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    onMutate: async (input) => {
      // await = wait for a Promise (async result) before continuing
      // queryKey = the name of this data in the cache; same key = same cached answer
      await queryClient.cancelQueries({ queryKey: key }); // stop a refetch from overwriting our change
      // const = a name for a value that is never reassigned
      const previous = queryClient.getQueryData(key);
      // if (...) = run the next part only when the condition is true
      // setQueryData = put a value straight into the cache (no request)
      if (previous) queryClient.setQueryData(key, applyLocally(previous, input));
      // return = give this value back and stop the function here
      return { previous };
    },
    // onError = runs if the request failed
    // => = an arrow function (a short function)
    onError: (_error, _input, context) => {
      // if (...) = run the next part only when the condition is true
      // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
      // setQueryData = put a value straight into the cache (no request)
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    // setQueryData = put a value straight into the cache (no request)
    onSuccess: (cart) => queryClient.setQueryData(key, cart), // server's answer is the final truth
  });
}

// Recalculates the totals after a local change (the server does the same on its side).
// function = a named, reusable block of code
function withTotals(items) {
  // return = give this value back and stop the function here
  return {
    items,
    // .reduce = combine all items into one value (e.g. a sum)
    // => = an arrow function (a short function)
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    // .filter = keep only the items that pass a test
    // => = an arrow function (a short function)
    // ! = NOT: flips true/false
    // .reduce = combine all items into one value (e.g. a sum)
    subtotal: items.filter((i) => !i.issue).reduce((sum, i) => sum + i.lineTotal, 0),
    // .some = true if at least one item passes the test
    // => = an arrow function (a short function)
    hasIssues: items.some((i) => i.issue),
  };
}

// export = other files can import this
// function = a named, reusable block of code
export function useUpdateCartItem() {
  // return = give this value back and stop the function here
  return useOptimisticCartMutation(
    // => = an arrow function (a short function)
    // { a, b } = destructuring: take properties a and b out of an object
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    // `text ${x}` = a template string: text with values inserted
    ({ variantId, quantity }) => api.patch(`/cart/items/${variantId}`, { quantity }),
    // => = an arrow function (a short function)
    // { a, b } = destructuring: take properties a and b out of an object
    (cart, { variantId, quantity }) =>
      withTotals(
        // .map = make a new array by transforming each item (in JSX: one element per item)
        // => = an arrow function (a short function)
        // a ? b : c = ternary: if a then b else c
        // === = strictly equal (same value AND same type)
        // ...x = spread: copy all items/properties of x into here
        cart.items.map((i) => (i.variantId === variantId ? { ...i, quantity, lineTotal: i.unitPrice * quantity } : i)),
      ),
  );
}

// export = other files can import this
// function = a named, reusable block of code
export function useRemoveCartItem() {
  // return = give this value back and stop the function here
  return useOptimisticCartMutation(
    // => = an arrow function (a short function)
    // { a, b } = destructuring: take properties a and b out of an object
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    // `text ${x}` = a template string: text with values inserted
    ({ variantId }) => api.delete(`/cart/items/${variantId}`),
    // => = an arrow function (a short function)
    // { a, b } = destructuring: take properties a and b out of an object
    // .filter = keep only the items that pass a test
    // !== = not strictly equal
    (cart, { variantId }) => withTotals(cart.items.filter((i) => i.variantId !== variantId)),
  );
}
