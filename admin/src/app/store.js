import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import { api, cmsApi } from './api';

// The Redux store: ONE object holding all shared state.
//   state.auth -> who is logged in (authSlice)
//   state.api    -> RTK Query's cache of everything loaded from the shop API
//   state.cmsApi -> the same for the CMS (store text)
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
    [cmsApi.reducerPath]: cmsApi.reducer,
  },
  // RTK Query's middleware handles caching, refetching and cache expiry.
  middleware: (getDefault) => getDefault().concat(api.middleware, cmsApi.middleware),
});
