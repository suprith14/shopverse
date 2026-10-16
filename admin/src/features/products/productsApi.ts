import { api } from '@/app/api';
import type { AdminProduct, AdminProductListItem, Category, Paginated } from '@/types/api';

export interface ProductListParams {
  q?: string;
  category?: string;
  status?: 'all' | 'active' | 'hidden';
  lowStock?: boolean;
  page?: number;
}

export interface VariantInput {
  sku: string;
  name: string;
  price: number; // cents
  stock: number;
}

export interface ProductInput {
  name: string;
  description: string;
  brand: string | null;
  categoryId: string;
  images: string[];
  isActive: boolean;
}

// Cache tags: lists "provide" Product:LIST, a single product provides Product:<id>.
// Mutations "invalidate" the tags they affect, and RTK Query refetches whatever is on screen.
// Stock and prices also feed the dashboard (low stock), so those invalidate Analytics too.
const LIST = { type: 'Product' as const, id: 'LIST' };

export const productsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Queries = reading data. Each becomes a hook: useGetProductsQuery(params)
    getProducts: build.query<Paginated<AdminProductListItem>, ProductListParams>({
      query: (params) => ({ url: '/admin/products', params: { ...params, lowStock: params.lowStock || undefined } }),
      providesTags: (result) => [LIST, ...(result?.items.map((p) => ({ type: 'Product' as const, id: p.id })) ?? [])],
    }),
    getProduct: build.query<AdminProduct, string>({
      query: (id) => `/admin/products/${id}`,
      transformResponse: (res: { product: AdminProduct }) => res.product,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    getCategories: build.query<Category[], void>({
      query: () => '/admin/products/categories',
      transformResponse: (res: { categories: Category[] }) => res.categories,
      keepUnusedDataFor: 600, // categories rarely change: keep them cached 10 minutes
    }),

    // Mutations = changing data. Each becomes a hook: const [createProduct, state] = useCreateProductMutation()
    createProduct: build.mutation<AdminProduct, ProductInput & { variants: VariantInput[] }>({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      transformResponse: (res: { product: AdminProduct }) => res.product,
      invalidatesTags: [LIST, 'Analytics'],
    }),
    updateProduct: build.mutation<AdminProduct, { id: string } & Partial<ProductInput>>({
      query: ({ id, ...body }) => ({ url: `/admin/products/${id}`, method: 'PATCH', body }),
      transformResponse: (res: { product: AdminProduct }) => res.product,
      invalidatesTags: (_r, _e, { id }) => [LIST, { type: 'Product', id }, 'Analytics'],
    }),
    addVariant: build.mutation<AdminProduct, { productId: string } & VariantInput>({
      query: ({ productId, ...body }) => ({ url: `/admin/products/${productId}/variants`, method: 'POST', body }),
      transformResponse: (res: { product: AdminProduct }) => res.product,
      invalidatesTags: (_r, _e, { productId }) => [LIST, { type: 'Product', id: productId }, 'Analytics'],
    }),
    updateVariant: build.mutation<AdminProduct, { productId: string; variantId: string; name?: string; price?: number }>({
      query: ({ variantId, name, price }) => ({ url: `/admin/products/variants/${variantId}`, method: 'PATCH', body: { name, price } }),
      transformResponse: (res: { product: AdminProduct }) => res.product,
      invalidatesTags: (_r, _e, { productId }) => [LIST, { type: 'Product', id: productId }],
    }),
    deleteVariant: build.mutation<AdminProduct, { productId: string; variantId: string }>({
      query: ({ variantId }) => ({ url: `/admin/products/variants/${variantId}`, method: 'DELETE' }),
      transformResponse: (res: { product: AdminProduct }) => res.product,
      invalidatesTags: (_r, _e, { productId }) => [LIST, { type: 'Product', id: productId }, 'Analytics'],
    }),
    adjustStock: build.mutation<AdminProduct, { productId: string; variantId: string; delta: number }>({
      query: ({ variantId, delta }) => ({ url: `/admin/products/variants/${variantId}/stock`, method: 'POST', body: { delta } }),
      transformResponse: (res: { product: AdminProduct }) => res.product,
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
