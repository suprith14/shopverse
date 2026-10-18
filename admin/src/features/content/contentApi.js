import { cmsApi } from '@/app/api';

// Store text, from the CMS (cms/), not the shop API.
export const contentApi = cmsApi.injectEndpoints({
  endpoints: (build) => ({
    // Every content type with its field descriptions and current values: what the editor draws.
    getEditorContent: build.query({
      query: () => '/admin/content',
      transformResponse: (res) => res.types,
      providesTags: ['Content'],
    }),
    // Saves ALL fields of one type at once (the CMS validates them together).
    saveContent: build.mutation({
      query: ({ type, values }) => ({ url: `/admin/content/${type}`, method: 'PUT', body: values }),
      invalidatesTags: ['Content'], // refetch, so "last saved" and every form show what's really stored
    }),
  }),
});

export const { useGetEditorContentQuery, useSaveContentMutation } = contentApi;
