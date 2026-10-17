import { api } from '@/app/api';

// Cache tags: lists "provide" Product:LIST, a single product provides Product:<id>.
// Mutations "invalidate" the tags they affect, and RTK Query refetches whatever is on screen.
// Stock and prices also feed the dashboard (low stock), so those invalidate Analytics too.
const LIST = { type: 'Product', id: 'LIST' };

export const productsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Queries = reading data. Each becomes a hook: useGetProductsQuery(params)
    getProducts: build.query({
      query: (params) => ({ url: '/admin/products', params: { ...params, lowStock: params.lowStock || undefined } }),
      providesTags: (result) => [LIST, ...(result?.items.map((p) => ({ type: 'Product', id: p.id })) ?? [])],
    }),
    getProduct: build.query({
      query: (id) => `/admin/products/${id}`,
      transformResponse: (res) => res.product,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    getCategories: build.query({
      query: () => '/admin/products/categories',
      transformResponse: (res) => res.categories,
      keepUnusedDataFor: 600, // categories rarely change: keep them cached 10 minutes
    }),

    // Mutations = changing data. Each becomes a hook: const [createProduct, state] = useCreateProductMutation()
    createProduct: build.mutation({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      transformResponse: (res) => res.product,
      invalidatesTags: [LIST, 'Analytics'],
    }),
    updateProduct: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/products/${id}`, method: 'PATCH', body }),
      transformResponse: (res) => res.product,
      invalidatesTags: (_r, _e, { id }) => [LIST, { type: 'Product', id }, 'Analytics'],
    }),
    addVariant: build.mutation({
      query: ({ productId, ...body }) => ({ url: `/admin/products/${productId}/variants`, method: 'POST', body }),
      transformResponse: (res) => res.product,
      invalidatesTags: (_r, _e, { productId }) => [LIST, { type: 'Product', id: productId }, 'Analytics'],
    }),
    updateVariant: build.mutation({
      query: ({ variantId, name, price }) => ({
        url: `/admin/products/variants/${variantId}`,
        method: 'PATCH',
        body: { name, price },
      }),
      transformResponse: (res) => res.product,
      invalidatesTags: (_r, _e, { productId }) => [LIST, { type: 'Product', id: productId }],
    }),
    deleteVariant: build.mutation({
      query: ({ variantId }) => ({ url: `/admin/products/variants/${variantId}`, method: 'DELETE' }),
      transformResponse: (res) => res.product,
      invalidatesTags: (_r, _e, { productId }) => [LIST, { type: 'Product', id: productId }, 'Analytics'],
    }),
    adjustStock: build.mutation({
      query: ({ variantId, delta }) => ({
        url: `/admin/products/variants/${variantId}/stock`,
        method: 'POST',
        body: { delta },
      }),
      transformResponse: (res) => res.product,
      invalidatesTags: (_r, _e, { productId }) => [LIST, { type: 'Product', id: productId }, 'Analytics'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useAddVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
  useAdjustStockMutation,
} = productsApi;
