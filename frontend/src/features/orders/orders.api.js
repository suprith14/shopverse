// Orders: my list, one order, place an order, pay, cancel.
// How these *.api.js files work (TanStack Query):
//   useQuery    = READ data. queryKey names the data in the cache; the same key anywhere = the same
//                 cached answer, fetched once. enabled: false = don't ask yet (e.g. not logged in).
//   useMutation = CHANGE data (POST/PUT/DELETE). onSuccess updates or refreshes ("invalidates")
//                 the cached queries, so every screen showing that data updates by itself.
// The user id is part of the key, so one user's cached data is never shown to the next.

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

// function = a named, reusable block of code
function useUserId() {
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  return useAuthStore((s) => s.user?.id);
}

// My orders, newest first (the server only returns this user's orders)
// export = other files can import this
// function = a named, reusable block of code
export function useOrders() {
  // const = a name for a value that is never reassigned
  const userId = useUserId();
  // return = give this value back and stop the function here
  // useQuery = READ server data with caching, loading and error states
  return useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: ['orders', userId],
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    queryFn: async () => (await api.get('/orders')).data.orders,
    // enabled = only fetch when this is true (e.g. once logged in)
    // !!x = turn any value into true/false
    // ! = NOT: flips true/false
    enabled: !!userId,
  });
}

// `waitForPayment`: the customer just came back from Stripe. The webhook usually arrives
// within a second or two, so while the order is still PENDING we ask again every 2 seconds.
// export = other files can import this
// function = a named, reusable block of code
// x = value (in parameters) = the default used when x is not given
export function useOrder(id, waitForPayment = false) {
  // const = a name for a value that is never reassigned
  const userId = useUserId();
  // return = give this value back and stop the function here
  // useQuery = READ server data with caching, loading and error states
  return useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: ['order', userId, id],
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    // `text ${x}` = a template string: text with values inserted
    queryFn: async () => (await api.get(`/orders/${id}`)).data.order,
    // enabled = only fetch when this is true (e.g. once logged in)
    // !!x = turn any value into true/false
    // ! = NOT: flips true/false
    enabled: !!userId,
    // refetchInterval = ask the server again every N ms (polling)
    // => = an arrow function (a short function)
    // a ? b : c = ternary: if a then b else c
    // a && b = AND; in JSX: show b only when a is true
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // === = strictly equal (same value AND same type)
    refetchInterval: (query) => (waitForPayment && query.state.data?.status === 'PENDING' ? 2000 : false),
  });
}

// "Place order": the backend creates the order and a Stripe payment page,
// then we send the browser to Stripe. (A full page navigation, Stripe is another website.)
// export = other files can import this
// function = a named, reusable block of code
export function usePlaceOrder() {
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    mutationFn: async (input) => (await api.post('/orders', input)).data,
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    // { a, b } = destructuring: take properties a and b out of an object
    onSuccess: ({ checkoutUrl }) => {
      // window = the browser tab (location, events, timers)
      window.location.href = checkoutUrl;
    },
  });
}

// "Pay now" on an unpaid order: reopens the same Stripe page.
// export = other files can import this
// function = a named, reusable block of code
export function usePayOrder() {
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    // `text ${x}` = a template string: text with values inserted
    mutationFn: async (id) => (await api.post(`/orders/${id}/pay`)).data,
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    // { a, b } = destructuring: take properties a and b out of an object
    onSuccess: ({ checkoutUrl }) => {
      // window = the browser tab (location, events, timers)
      window.location.href = checkoutUrl;
    },
  });
}

// Cancel an unpaid order: the stock goes back. The answer updates the cached order directly.
// export = other files can import this
// function = a named, reusable block of code
export function useCancelOrder() {
  // const = a name for a value that is never reassigned
  // useQueryClient = the shared cache, to update or refresh cached data
  const queryClient = useQueryClient();
  // const = a name for a value that is never reassigned
  const userId = useUserId();
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    // `text ${x}` = a template string: text with values inserted
    mutationFn: async (id) => (await api.post(`/orders/${id}/cancel`)).data.order,
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    onSuccess: (order) => {
      // setQueryData = put a value straight into the cache (no request)
      queryClient.setQueryData(['order', userId, order.id], order);
      // invalidateQueries = mark cached data as old, so screens showing it refetch
      // queryKey = the name of this data in the cache; same key = same cached answer
      queryClient.invalidateQueries({ queryKey: ['orders', userId] });
    },
  });
}
