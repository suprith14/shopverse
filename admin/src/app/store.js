// import = bring in code from another file or package
// configureStore = create the Redux store: one global object holding the app's shared state
import { configureStore } from '@reduxjs/toolkit';
// import = bring in code from another file or package
import authReducer from '@/features/auth/authSlice';
// import = bring in code from another file or package
import { api, cmsApi } from './api';

// The Redux store: ONE object holding all shared state.
//   state.auth -> who is logged in (authSlice)
//   state.api    -> RTK Query's cache of everything loaded from the shop API
//   state.cmsApi -> the same for the CMS (store text)
// export = other files can import this
// const = a name for a value that is never reassigned
// configureStore = create the Redux store: one global object holding the app's shared state
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // reducerPath = where this API's cache lives inside the Redux state
    [api.reducerPath]: api.reducer,
    // reducerPath = where this API's cache lives inside the Redux state
    [cmsApi.reducerPath]: cmsApi.reducer,
  },
  // RTK Query's middleware handles caching, refetching and cache expiry.
  // middleware = code that runs on every action before it reaches the reducers
  // => = an arrow function (a short function)
  middleware: (getDefault) => getDefault().concat(api.middleware, cmsApi.middleware),
});
