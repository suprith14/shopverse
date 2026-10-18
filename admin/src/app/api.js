import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { sessionEnded, sessionStarted } from '@/features/auth/authSlice';
import { isServerError, reportServerError } from '@/lib/server-error';

// RTK Query: describes every backend call once, then gives components ready-made hooks
// (useGetProductsQuery, useUpdateOrderStatusMutation...) with loading/error state and caching.
// It replaces both React Query and axios from the store frontend.

// Attach the access token from the Redux store to every request.
const prepareHeaders = (headers, { getState }) => {
  const token = getState().auth.accessToken;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
};

// The shop API (backend/). /api is forwarded to it by the Vite proxy (Vercel rewrite live).
const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include', // send the httpOnly refresh-token cookie
  prepareHeaders,
});

// The CMS (cms/), a separate service. It accepts the SAME access token: both services know the
// secret it's signed with. Logging in and refreshing always go through the shop API.
const cmsRawBaseQuery = fetchBaseQuery({ baseUrl: '/cms', prepareHeaders });

// Several requests can fail with 401 at the same moment (the dashboard loads 6 widgets).
// They all wait for this ONE refresh instead of each starting their own.
let refreshing = null;

// Wraps every request: on 401 (access token expired), refresh once using the cookie and retry.
// The admin app only accepts ADMIN sessions: a customer session (e.g. from the store tab,
// which shares cookies on localhost) is treated as logged out.
// Works for either service: `baseQuery` sends the request, the refresh always goes to the shop API.
const withReauth = (baseQuery) => async (args, api, extra) => {
  let result = await baseQuery(args, api, extra);
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

    if (await refreshing) result = await baseQuery(args, api, extra); // retry with the new token
  }
  // The server failed (5xx): one popup for the whole app, see lib/server-error.js
  if (isServerError(result.error)) reportServerError();
  return result;
};

export const baseQueryWithReauth = withReauth(rawBaseQuery);

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  // Tags connect queries to mutations: when a mutation "invalidates" Product, every query that
  // "provides" Product refetches automatically. (Like invalidateQueries in React Query.)
  tagTypes: ['Product', 'Order', 'Analytics', 'Customer'],
  // Endpoints are added per feature with api.injectEndpoints (see features/*/...Api.ts).
  endpoints: () => ({}),
});

// A second API slice for the CMS: a different service gets its own cache and tags.
// Endpoints are added in features/content/contentApi.js.
export const cmsApi = createApi({
  reducerPath: 'cmsApi',
  baseQuery: withReauth(cmsRawBaseQuery),
  tagTypes: ['Content'],
  endpoints: () => ({}),
});
