import { api } from '@/app/api';

// Block, unblock and delete change the list and the dashboard's customer numbers.
const changed = ['Customer', 'Analytics'];

export const customersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query({
      query: (params) => ({ url: '/admin/customers', params }),
      providesTags: ['Customer'],
    }),
    blockCustomer: build.mutation({
      query: ({ id, reason }) => ({ url: `/admin/customers/${id}/block`, method: 'POST', body: { reason } }),
      invalidatesTags: changed,
    }),
    unblockCustomer: build.mutation({
      query: (id) => ({ url: `/admin/customers/${id}/unblock`, method: 'POST' }),
      invalidatesTags: changed,
    }),
    // Returns { mode: 'deleted' } or { mode: 'anonymised', orderCount }
    deleteCustomer: build.mutation({
      query: (id) => ({ url: `/admin/customers/${id}`, method: 'DELETE' }),
      invalidatesTags: [...changed, 'Order'], // their orders now show "Deleted customer"
    }),
  }),
});

export const { useGetCustomersQuery, useBlockCustomerMutation, useUnblockCustomerMutation, useDeleteCustomerMutation } =
  customersApi;
