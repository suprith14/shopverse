// import = bring in code from another file or package
import { api, cmsApi } from '@/app/api';
// import = bring in code from another file or package
import { sessionEnded, sessionStarted } from './authSlice';

// Auth endpoints, added to the shared api. Each one becomes a hook:
//   login   -> useLoginMutation()
//   logout  -> useLogoutMutation()
//   restore -> useRestoreSessionMutation()
// export = other files can import this
// const = a name for a value that is never reassigned
// injectEndpoints = add endpoints to the shared API from a feature file
export const authApi = api.injectEndpoints({
  // endpoints = the list of requests this API can make
  // => = an arrow function (a short function)
  endpoints: (build) => ({
    // build.mutation = define a CHANGE request (POST/PATCH/DELETE): turned into a useXxxMutation hook
    login: build.mutation({
      // query = build the request (URL, method, body) from the hook's argument
      // => = an arrow function (a short function)
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      // After the request: only admins may use this app.
      // { a, b } = destructuring: take properties a and b out of an object
      // dispatch = send an action to the store (the only way to change Redux state)
      async onQueryStarted(_input, { dispatch, queryFulfilled }) {
        // const = a name for a value that is never reassigned
        // { a, b } = destructuring: take properties a and b out of an object
        // await = wait for a Promise (async result) before continuing
        // => = an arrow function (a short function)
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        // if (...) = run the next part only when the condition is true
        // ! = NOT: flips true/false
        // return = give this value back and stop the function here
        if (!data) return;
        // if (...) = run the next part only when the condition is true
        // === = strictly equal (same value AND same type)
        if (data.user.role === 'ADMIN') {
          // dispatch = send an action to the store (the only way to change Redux state)
          dispatch(sessionStarted(data));
        } else {
          // Correct password, wrong kind of account: end that session right away.
          // await = wait for a Promise (async result) before continuing
          // fetch = the browser's built-in way to send an HTTP request
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          // dispatch = send an action to the store (the only way to change Redux state)
          dispatch(sessionEnded());
        }
      },
    }),

    // build.mutation = define a CHANGE request (POST/PATCH/DELETE): turned into a useXxxMutation hook
    logout: build.mutation({
      // query = build the request (URL, method, body) from the hook's argument
      // => = an arrow function (a short function)
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      // { a, b } = destructuring: take properties a and b out of an object
      // dispatch = send an action to the store (the only way to change Redux state)
      async onQueryStarted(_input, { dispatch, queryFulfilled }) {
        // await = wait for a Promise (async result) before continuing
        // => = an arrow function (a short function)
        await queryFulfilled.catch(() => undefined);
        // dispatch = send an action to the store (the only way to change Redux state)
        dispatch(sessionEnded());
        // dispatch = send an action to the store (the only way to change Redux state)
        // api.util.resetApiState = empty the whole API cache (e.g. on logout)
        dispatch(api.util.resetApiState()); // forget every cached admin response
        // dispatch = send an action to the store (the only way to change Redux state)
        // api.util.resetApiState = empty the whole API cache (e.g. on logout)
        dispatch(cmsApi.util.resetApiState()); // and the CMS's
      },
    }),

    // On page load: try to get a session from the refresh cookie.
    // build.mutation = define a CHANGE request (POST/PATCH/DELETE): turned into a useXxxMutation hook
    restoreSession: build.mutation({
      // query = build the request (URL, method, body) from the hook's argument
      // => = an arrow function (a short function)
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      // { a, b } = destructuring: take properties a and b out of an object
      // dispatch = send an action to the store (the only way to change Redux state)
      async onQueryStarted(_input, { dispatch, queryFulfilled }) {
        // const = a name for a value that is never reassigned
        // { a, b } = destructuring: take properties a and b out of an object
        // await = wait for a Promise (async result) before continuing
        // => = an arrow function (a short function)
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        // No cookie, expired, or a customer session from the store tab: not logged in here.
        // dispatch = send an action to the store (the only way to change Redux state)
        // a ? b : c = ternary: if a then b else c
        // a && b = AND; in JSX: show b only when a is true
        // === = strictly equal (same value AND same type)
        dispatch(data && data.user.role === 'ADMIN' ? sessionStarted(data) : sessionEnded());
      },
    }),
  }),
});

// export = other files can import this
// const = a name for a value that is never reassigned
// { a, b } = destructuring: take properties a and b out of an object
// useLoginMutation = generated by RTK Query: gives [trigger, { isLoading }]; calling trigger sends the change
// useLogoutMutation = generated by RTK Query: gives [trigger, { isLoading }]; calling trigger sends the change
// useRestoreSessionMutation = generated by RTK Query: gives [trigger, { isLoading }]; calling trigger sends the change
export const { useLoginMutation, useLogoutMutation, useRestoreSessionMutation } = authApi;
