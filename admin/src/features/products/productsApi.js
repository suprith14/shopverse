// import = bring in code from another file or package
import { api } from '@/app/api';

// Cache tags: lists "provide" Product:LIST, a single product provides Product:<id>.
// Mutations "invalidate" the tags they affect, and RTK Query refetches whatever is on screen.
// Stock and prices also feed the dashboard (low stock), so those invalidate Analytics too.
// const = a name for a value that is never reassigned
const LIST = { type: 'Product', id: 'LIST' };

// export = other files can import this
// const = a name for a value that is never reassigned
// injectEndpoints = add endpoints to the shared API from a feature file
export const productsApi = api.injectEndpoints({
  // endpoints = the list of requests this API can make
  // => = an arrow function (a short function)
  endpoints: (build) => ({
    // Queries = reading data. Each becomes a hook: useGetProductsQuery(params)
    // build.query = define a READ request: cached, and turned into a useXxxQuery hook
    getProducts: build.query({
      // query = build the request (URL, method, body) from the hook's argument
      // => = an arrow function (a short function)
      // ...x = spread: copy all items/properties of x into here
      // a || b = OR: a if it is truthy, else b
      query: (params) => ({ url: '/admin/products', params: { ...params, lowStock: params.lowStock || undefined } }),
      // providesTags = label this cached data (e.g. Order 5) so it can be refreshed later
      // => = an arrow function (a short function)
      // ...x = spread: copy all items/properties of x into here
      // ?.() = call only if the function exists
      // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
      // .map = make a new array by transforming each item (in JSX: one element per item)
      // a ?? b = a, unless a is null/undefined, then b
      providesTags: (result) => [LIST, ...(result?.items.map((p) => ({ type: 'Product', id: p.id })) ?? [])],
    }),
    // build.query = define a READ request: cached, and turned into a useXxxQuery hook
    getProduct: build.query({
      // query = build the request (URL, method, body) from the hook's argument
      // => = an arrow function (a short function)
      // `text ${x}` = a template string: text with values inserted
      query: (id) => `/admin/products/${id}`,
      // transformResponse = reshape the server answer before it is cached
      // => = an arrow function (a short function)
      transformResponse: (res) => res.product,
      // providesTags = label this cached data (e.g. Order 5) so it can be refreshed later
      // => = an arrow function (a short function)
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    // build.query = define a READ request: cached, and turned into a useXxxQuery hook
    getCategories: build.query({
      // query = build the request (URL, method, body) from the hook's argument
      // => = an arrow function (a short function)
      query: () => '/admin/products/categories',
      // transformResponse = reshape the server answer before it is cached
      // => = an arrow function (a short function)
      transformResponse: (res) => res.categories,
      // keepUnusedDataFor = seconds to keep cache nobody is using
      keepUnusedDataFor: 600, // categories rarely change: keep them cached 10 minutes
    }),

    // Mutations = changing data. Each becomes a hook: const [createProduct, state] = useCreateProductMutation()
    // build.mutation = define a CHANGE request (POST/PATCH/DELETE): turned into a useXxxMutation hook
    createProduct: build.mutation({
      // query = build the request (URL, method, body) from the hook's argument
      // => = an arrow function (a short function)
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      // transformResponse = reshape the server answer before it is cached
      // => = an arrow function (a short function)
      transformResponse: (res) => res.product,
      // invalidatesTags = after this change, refetch every query with these labels
      invalidatesTags: [LIST, 'Analytics'],
    }),
    // build.mutation = define a CHANGE request (POST/PATCH/DELETE): turned into a useXxxMutation hook
    updateProduct: build.mutation({
      // query = build the request (URL, method, body) from the hook's argument
      // => = an arrow function (a short function)
      // { a, b } = destructuring: take properties a and b out of an object
      // ...rest = collect the remaining items/properties
      // `text ${x}` = a template string: text with values inserted
      query: ({ id, ...body }) => ({ url: `/admin/products/${id}`, method: 'PATCH', body }),
      // transformResponse = reshape the server answer before it is cached
      // => = an arrow function (a short function)
      transformResponse: (res) => res.product,
      // invalidatesTags = after this change, refetch every query with these labels
      // => = an arrow function (a short function)
      // { a, b } = destructuring: take properties a and b out of an object
      invalidatesTags: (_r, _e, { id }) => [LIST, { type: 'Product', id }, 'Analytics'],
    }),
    // build.mutation = define a CHANGE request (POST/PATCH/DELETE): turned into a useXxxMutation hook
    addVariant: build.mutation({
      // query = build the request (URL, method, body) from the hook's argument
      // => = an arrow function (a short function)
      // { a, b } = destructuring: take properties a and b out of an object
      // ...rest = collect the remaining items/properties
      // `text ${x}` = a template string: text with values inserted
      query: ({ productId, ...body }) => ({ url: `/admin/products/${productId}/variants`, method: 'POST', body }),
      // transformResponse = reshape the server answer before it is cached
      // => = an arrow function (a short function)
      transformResponse: (res) => res.product,
      // invalidatesTags = after this change, refetch every query with these labels
      // => = an arrow function (a short function)
      // { a, b } = destructuring: take properties a and b out of an object
      invalidatesTags: (_r, _e, { productId }) => [LIST, { type: 'Product', id: productId }, 'Analytics'],
    }),
    // build.mutation = define a CHANGE request (POST/PATCH/DELETE): turned into a useXxxMutation hook
    updateVariant: build.mutation({
      // query = build the request (URL, method, body) from the hook's argument
      // => = an arrow function (a short function)
      // { a, b } = destructuring: take properties a and b out of an object
      query: ({ variantId, name, price }) => ({
        // `text ${x}` = a template string: text with values inserted
        url: `/admin/products/variants/${variantId}`,
        method: 'PATCH',
        body: { name, price },
      }),
      // transformResponse = reshape the server answer before it is cached
      // => = an arrow function (a short function)
      transformResponse: (res) => res.product,
      // invalidatesTags = after this change, refetch every query with these labels
      // => = an arrow function (a short function)
      // { a, b } = destructuring: take properties a and b out of an object
      invalidatesTags: (_r, _e, { productId }) => [LIST, { type: 'Product', id: productId }],
    }),
    // build.mutation = define a CHANGE request (POST/PATCH/DELETE): turned into a useXxxMutation hook
    deleteVariant: build.mutation({
      // query = build the request (URL, method, body) from the hook's argument
      // => = an arrow function (a short function)
      // { a, b } = destructuring: take properties a and b out of an object
      // `text ${x}` = a template string: text with values inserted
      query: ({ variantId }) => ({ url: `/admin/products/variants/${variantId}`, method: 'DELETE' }),
      // transformResponse = reshape the server answer before it is cached
      // => = an arrow function (a short function)
      transformResponse: (res) => res.product,
      // invalidatesTags = after this change, refetch every query with these labels
      // => = an arrow function (a short function)
      // { a, b } = destructuring: take properties a and b out of an object
      invalidatesTags: (_r, _e, { productId }) => [LIST, { type: 'Product', id: productId }, 'Analytics'],
    }),
    // build.mutation = define a CHANGE request (POST/PATCH/DELETE): turned into a useXxxMutation hook
    adjustStock: build.mutation({
      // query = build the request (URL, method, body) from the hook's argument
      // => = an arrow function (a short function)
      // { a, b } = destructuring: take properties a and b out of an object
      query: ({ variantId, delta }) => ({
        // `text ${x}` = a template string: text with values inserted
        url: `/admin/products/variants/${variantId}/stock`,
        method: 'POST',
        body: { delta },
      }),
      // transformResponse = reshape the server answer before it is cached
      // => = an arrow function (a short function)
      transformResponse: (res) => res.product,
      // invalidatesTags = after this change, refetch every query with these labels
      // => = an arrow function (a short function)
      // { a, b } = destructuring: take properties a and b out of an object
      invalidatesTags: (_r, _e, { productId }) => [LIST, { type: 'Product', id: productId }, 'Analytics'],
    }),
  }),
});

// export = other files can import this
// const = a name for a value that is never reassigned
// { a, b } = destructuring: take properties a and b out of an object
export const {
  // useGetProductsQuery = generated by RTK Query from the endpoint: gives { data, isLoading, isFetching, error } and caches it
  useGetProductsQuery,
  // useGetProductQuery = generated by RTK Query from the endpoint: gives { data, isLoading, isFetching, error } and caches it
  useGetProductQuery,
  // useGetCategoriesQuery = generated by RTK Query from the endpoint: gives { data, isLoading, isFetching, error } and caches it
  useGetCategoriesQuery,
  // useCreateProductMutation = generated by RTK Query: gives [trigger, { isLoading }]; calling trigger sends the change
  useCreateProductMutation,
  // useUpdateProductMutation = generated by RTK Query: gives [trigger, { isLoading }]; calling trigger sends the change
  useUpdateProductMutation,
  // useAddVariantMutation = generated by RTK Query: gives [trigger, { isLoading }]; calling trigger sends the change
  useAddVariantMutation,
  // useUpdateVariantMutation = generated by RTK Query: gives [trigger, { isLoading }]; calling trigger sends the change
  useUpdateVariantMutation,
  // useDeleteVariantMutation = generated by RTK Query: gives [trigger, { isLoading }]; calling trigger sends the change
  useDeleteVariantMutation,
  // useAdjustStockMutation = generated by RTK Query: gives [trigger, { isLoading }]; calling trigger sends the change
  useAdjustStockMutation,
} = productsApi;
