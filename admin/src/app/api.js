// import = bring in code from another file or package
// createApi = describe the API once; RTK Query generates the hooks, cache and loading states
// fetchBaseQuery = a small fetch wrapper: base URL, headers, JSON in/out
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import = bring in code from another file or package
import { sessionEnded, sessionStarted } from '@/features/auth/authSlice';
// import = bring in code from another file or package
import { isServerError, reportServerError } from '@/lib/server-error';

// RTK Query: describes every backend call once, then gives components ready-made hooks
// (useGetProductsQuery, useUpdateOrderStatusMutation...) with loading/error state and caching.
// It replaces both React Query and axios from the store frontend.

// Attach the access token from the Redux store to every request.
// const = a name for a value that is never reassigned
// prepareHeaders = add headers (e.g. the login token) to every request
// => = an arrow function (a short function)
// { a, b } = destructuring: take properties a and b out of an object
// getState = read the whole Redux state right now
const prepareHeaders = (headers, { getState }) => {
  // const = a name for a value that is never reassigned
  // getState = read the whole Redux state right now
  const token = getState().auth.accessToken;
  // if (...) = run the next part only when the condition is true
  // `text ${x}` = a template string: text with values inserted
  if (token) headers.set('Authorization', `Bearer ${token}`);
  // return = give this value back and stop the function here
  return headers;
};

// The shop API (backend/). /api is forwarded to it by the Vite proxy (Vercel rewrite live).
// const = a name for a value that is never reassigned
// fetchBaseQuery = a small fetch wrapper: base URL, headers, JSON in/out
const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include', // send the httpOnly refresh-token cookie
  // prepareHeaders = add headers (e.g. the login token) to every request
  prepareHeaders,
});

// The CMS (cms/), a separate service. It accepts the SAME access token: both services know the
// secret it's signed with. Logging in and refreshing always go through the shop API.
// const = a name for a value that is never reassigned
// fetchBaseQuery = a small fetch wrapper: base URL, headers, JSON in/out
// prepareHeaders = add headers (e.g. the login token) to every request
const cmsRawBaseQuery = fetchBaseQuery({ baseUrl: '/cms', prepareHeaders });

// Several requests can fail with 401 at the same moment (the dashboard loads 6 widgets).
// They all wait for this ONE refresh instead of each starting their own.
// let = a name whose value can be changed later
let refreshing = null;

// Wraps every request: on 401 (access token expired), refresh once using the cookie and retry.
// The admin app only accepts ADMIN sessions: a customer session (e.g. from the store tab,
// which shares cookies on localhost) is treated as logged out.
// Works for either service: `baseQuery` sends the request, the refresh always goes to the shop API.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// baseQuery = the function every endpoint uses to send its request
// async = this function works with await and returns a Promise
const withReauth = (baseQuery) => async (args, api, extra) => {
  // let = a name whose value can be changed later
  // await = wait for a Promise (async result) before continuing
  // baseQuery = the function every endpoint uses to send its request
  let result = await baseQuery(args, api, extra);
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // === = strictly equal (same value AND same type)
  const url = typeof args === 'string' ? args : args.url;

  // if (...) = run the next part only when the condition is true
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // === = strictly equal (same value AND same type)
  // a && b = AND; in JSX: show b only when a is true
  // ! = NOT: flips true/false
  if (result.error?.status === 401 && !url.startsWith('/auth/')) {
    // Resolves to 'ok', 'ended' (really logged out) or the refresh's error (the shop API is down).
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    refreshing ??= (async () => {
      // const = a name for a value that is never reassigned
      // await = wait for a Promise (async result) before continuing
      const refresh = await rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, extra);
      // const = a name for a value that is never reassigned
      const data = refresh.data;
      // if (...) = run the next part only when the condition is true
      // a && b = AND; in JSX: show b only when a is true
      // === = strictly equal (same value AND same type)
      if (data && data.user.role === 'ADMIN') {
        // dispatch = send an action to the store (the only way to change Redux state)
        api.dispatch(sessionStarted(data));
        // return = give this value back and stop the function here
        return 'ok';
      }
      // The shop API is down or unreachable (5xx / no answer): the session may be perfectly fine,
      // so DON'T log the admin out. Report the server error instead (popup + retry).
      // if (...) = run the next part only when the condition is true
      // a || b = OR: a if it is truthy, else b
      // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
      // === = strictly equal (same value AND same type)
      // return = give this value back and stop the function here
      if (isServerError(refresh.error) || refresh.error?.status === 'FETCH_ERROR') return refresh.error;
      // dispatch = send an action to the store (the only way to change Redux state)
      api.dispatch(sessionEnded());
      // return = give this value back and stop the function here
      return 'ended';
    // => = an arrow function (a short function)
    })().finally(() => {
      refreshing = null;
    });

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const outcome = await refreshing;
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    // await = wait for a Promise (async result) before continuing
    // baseQuery = the function every endpoint uses to send its request
    if (outcome === 'ok') result = await baseQuery(args, api, extra); // retry with the new token
    // if (...) = run the next part only when the condition is true
    // !== = not strictly equal
    else if (outcome !== 'ended') result = { error: outcome }; // show WHY: the server, not the login
  }
  // The server failed (5xx): one popup for the whole app, see lib/server-error.js
  // if (...) = run the next part only when the condition is true
  if (isServerError(result.error)) reportServerError();
  // return = give this value back and stop the function here
  return result;
};

// export = other files can import this
// const = a name for a value that is never reassigned
export const baseQueryWithReauth = withReauth(rawBaseQuery);

// export = other files can import this
// const = a name for a value that is never reassigned
// createApi = describe the API once; RTK Query generates the hooks, cache and loading states
export const api = createApi({
  // reducerPath = where this API's cache lives inside the Redux state
  reducerPath: 'api',
  // baseQuery = the function every endpoint uses to send its request
  baseQuery: baseQueryWithReauth,
  // Tags connect queries to mutations: when a mutation "invalidates" Product, every query that
  // "provides" Product refetches automatically. (Like invalidateQueries in React Query.)
  // tagTypes = the names of data kinds, used to know which cache to refresh
  tagTypes: ['Product', 'Order', 'Analytics', 'Customer'],
  // Endpoints are added per feature with api.injectEndpoints (see features/*/...Api.ts).
  // endpoints = the list of requests this API can make
  // => = an arrow function (a short function)
  endpoints: () => ({}),
});

// A second API slice for the CMS: a different service gets its own cache and tags.
// Endpoints are added in features/content/contentApi.js.
// export = other files can import this
// const = a name for a value that is never reassigned
// createApi = describe the API once; RTK Query generates the hooks, cache and loading states
export const cmsApi = createApi({
  // reducerPath = where this API's cache lives inside the Redux state
  reducerPath: 'cmsApi',
  // baseQuery = the function every endpoint uses to send its request
  baseQuery: withReauth(cmsRawBaseQuery),
  // tagTypes = the names of data kinds, used to know which cache to refresh
  tagTypes: ['Content'],
  // endpoints = the list of requests this API can make
  // => = an arrow function (a short function)
  endpoints: () => ({}),
});
