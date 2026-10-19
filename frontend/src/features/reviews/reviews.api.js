// Reviews: list per product, "my review", save and delete.
// How these *.api.js files work (TanStack Query):
//   useQuery    = READ data. queryKey names the data in the cache; the same key anywhere = the same
//                 cached answer, fetched once. enabled: false = don't ask yet (e.g. not logged in).
//   useMutation = CHANGE data (POST/PUT/DELETE). onSuccess updates or refreshes ("invalidates")
//                 the cached queries, so every screen showing that data updates by itself.
// The user id is part of the key, so one user's cached data is never shown to the next.

// import = bring in code from another file or package
// keepPreviousData = keep showing the old results while the new ones load
// useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
// useQuery = READ server data with caching, loading and error states
// useQueryClient = the shared cache, to update or refresh cached data
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import = bring in code from another file or package
// api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
import { api } from '@/lib/api-client';
// import = bring in code from another file or package
import { useAuthStore } from '@/features/auth/auth.store';

// Public: one page of reviews for a product, with the star summary
// export = other files can import this
// function = a named, reusable block of code
export function useReviews(productId, page) {
  // return = give this value back and stop the function here
  // useQuery = READ server data with caching, loading and error states
  return useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: ['reviews', productId, page],
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    // `text ${x}` = a template string: text with values inserted
    queryFn: async () => (await api.get(`/reviews/product/${productId}`, { params: { page } })).data,
    // placeholderData = what to show while the real data loads
    // keepPreviousData = keep showing the old results while the new ones load
    placeholderData: keepPreviousData, // keep the old page visible while the next one loads
  });
}

// Logged in: my review of this product, and whether I may write one (only after buying it)
// export = other files can import this
// function = a named, reusable block of code
export function useMyReview(productId) {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  const userId = useAuthStore((s) => s.user?.id);
  // return = give this value back and stop the function here
  // useQuery = READ server data with caching, loading and error states
  return useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: ['my-review', userId, productId],
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    // `text ${x}` = a template string: text with values inserted
    queryFn: async () => (await api.get(`/reviews/product/${productId}/mine`)).data,
    // enabled = only fetch when this is true (e.g. once logged in)
    // !!x = turn any value into true/false
    // ! = NOT: flips true/false
    enabled: !!userId,
  });
}

// A review changes more than the review list: the product's average and count change too,
// and those are shown on the product page and on every product card in the shop.
// So after saving we mark all of them as stale and React Query refetches what's on screen.
// function = a named, reusable block of code
function useRefreshAfterReviewChange(productId) {
  // const = a name for a value that is never reassigned
  // useQueryClient = the shared cache, to update or refresh cached data
  const queryClient = useQueryClient();
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  return () => {
    // invalidateQueries = mark cached data as old, so screens showing it refetch
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    // invalidateQueries = mark cached data as old, so screens showing it refetch
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryClient.invalidateQueries({ queryKey: ['my-review'] });
    // invalidateQueries = mark cached data as old, so screens showing it refetch
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryClient.invalidateQueries({ queryKey: ['product'] }); // product page stars
    // invalidateQueries = mark cached data as old, so screens showing it refetch
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryClient.invalidateQueries({ queryKey: ['products'] }); // shop grid stars + "Top rated" sort
  };
}

// Create or update my review (PUT = "set it to this", so the same call does both)
// export = other files can import this
// function = a named, reusable block of code
export function useSaveReview(productId) {
  // const = a name for a value that is never reassigned
  const refresh = useRefreshAfterReviewChange(productId);
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    // `text ${x}` = a template string: text with values inserted
    mutationFn: async (input) => (await api.put(`/reviews/product/${productId}/mine`, input)).data.review,
    // onSuccess = runs after the request succeeded
    onSuccess: refresh,
  });
}

// export = other files can import this
// function = a named, reusable block of code
export function useDeleteReview(productId) {
  // const = a name for a value that is never reassigned
  const refresh = useRefreshAfterReviewChange(productId);
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    // `text ${x}` = a template string: text with values inserted
    mutationFn: async () => api.delete(`/reviews/product/${productId}/mine`),
    // onSuccess = runs after the request succeeded
    onSuccess: refresh,
  });
}
