// import = bring in code from another file or package
// keepPreviousData = keep showing the old results while the new ones load
// useQuery = READ server data with caching, loading and error states
import { keepPreviousData, useQuery } from '@tanstack/react-query';
// import = bring in code from another file or package
// api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
import { api } from '@/lib/api-client';

// React Query caches each response by its queryKey. Same filters = instant result from
// cache; different filters = new request. Data stays "fresh" for 1 min (set in main.tsx).

// export = other files can import this
// function = a named, reusable block of code
export function useCategories() {
  // return = give this value back and stop the function here
  // useQuery = READ server data with caching, loading and error states
  return useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: ['categories'],
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    queryFn: async () => (await api.get('/catalog/categories')).data.categories,
    // staleTime = how long cached data counts as fresh (no refetch during that time)
    staleTime: 10 * 60 * 1000, // categories rarely change
  });
}

// Products + facet counts for the sidebar and tabs, all in one response.
// export = other files can import this
// function = a named, reusable block of code
export function useProducts(filters) {
  // return = give this value back and stop the function here
  // useQuery = READ server data with caching, loading and error states
  return useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: ['products', filters],
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    queryFn: async () => (await api.get('/catalog/products', { params: filters })).data,
    // Keep showing the previous page while the next one loads (no flicker when paginating).
    // placeholderData = what to show while the real data loads
    // keepPreviousData = keep showing the old results while the new ones load
    placeholderData: keepPreviousData,
  });
}

// Search-as-you-type. Called with an already-debounced query (see SearchBox).
// export = other files can import this
// function = a named, reusable block of code
export function useSuggestions(q) {
  // const = a name for a value that is never reassigned
  // .trim = remove spaces at both ends
  const trimmed = q.trim();
  // return = give this value back and stop the function here
  // useQuery = READ server data with caching, loading and error states
  return useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: ['suggest', trimmed],
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // { a, b } = destructuring: take properties a and b out of an object
    queryFn: async ({ signal }) =>
      // `signal` cancels the request if the user keeps typing and this result is no longer needed.
      // await = wait for a Promise (async result) before continuing
      // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
      (await api.get('/catalog/suggest', { params: { q: trimmed }, signal })).data,
    // enabled = only fetch when this is true (e.g. once logged in)
    enabled: trimmed.length >= 2,
    // staleTime = how long cached data counts as fresh (no refetch during that time)
    staleTime: 60 * 1000,
    // placeholderData = what to show while the real data loads
    // keepPreviousData = keep showing the old results while the new ones load
    placeholderData: keepPreviousData, // keep old suggestions visible instead of flashing empty
  });
}

// export = other files can import this
// function = a named, reusable block of code
export function useProduct(slug) {
  // return = give this value back and stop the function here
  // useQuery = READ server data with caching, loading and error states
  return useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: ['product', slug],
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    // `text ${x}` = a template string: text with values inserted
    queryFn: async () => (await api.get(`/catalog/products/${slug}`)).data.product,
  });
}
