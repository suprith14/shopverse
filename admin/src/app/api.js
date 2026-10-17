import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { sessionEnded, sessionStarted } from '@/features/auth/authSlice';

// RTK Query: describes every backend call once, then gives components ready-made hooks
// (useGetProductsQuery, useUpdateOrderStatusMutation...) with loading/error state and caching.
// It replaces both React Query and axios from the store frontend.

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api', // forwarded to the backend by the Vite proxy
  credentials: 'include', // send the httpOnly refresh-token cookie
  // Attach the access token from the Redux store to every request.
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Several requests can fail with 401 at the same moment (the dashboard loads 6 widgets).
// They all wait for this ONE refresh instead of each starting their own.
let refreshing = null;

// Wraps every request: on 401 (access token expired), refresh once using the cookie and retry.
// The admin app only accepts ADMIN sessions: a customer session (e.g. from the store tab,
// which shares cookies on localhost) is treated as logged out.
export const baseQueryWithReauth = async (args, api, extra) => {
  let result = await rawBaseQuery(args, api, extra);
  const url = typeof args === 'string' ? args : args.url;

  if (result.error?.status === 401 && !url.startsWith('/auth/')) {
    refreshing ??= (async () => {
      const refresh = await rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, extra);
      const data = refresh.data;
      if (data && data.user.role === 'ADMIN') {
        api.dispatch(sessionStarted(data));
        return true;
      }
      api.dispatch(sessionEnded());
      return false;
    })().finally(() => {
      refreshing = null;
    });

    if (await refreshing) result = await rawBaseQuery(args, api, extra); // retry with the new token
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  // Tags connect queries to mutations: when a mutation "invalidates" Product, every query that
  // "provides" Product refetches automatically. (Like invalidateQueries in React Query.)
  tagTypes: ['Product', 'Order', 'Analytics'],
  // Endpoints are added per feature with api.injectEndpoints (see features/*/...Api.ts).
  endpoints: () => ({}),
});
