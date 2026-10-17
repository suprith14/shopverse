import { api } from '@/app/api';
import { sessionEnded, sessionStarted } from './authSlice';

// Auth endpoints, added to the shared api. Each one becomes a hook:
//   login   -> useLoginMutation()
//   logout  -> useLogoutMutation()
//   restore -> useRestoreSessionMutation()
export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      // After the request: only admins may use this app.
      async onQueryStarted(_input, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;
        if (data.user.role === 'ADMIN') {
          dispatch(sessionStarted(data));
        } else {
          // Correct password, wrong kind of account: end that session right away.
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          dispatch(sessionEnded());
        }
      },
    }),

    logout: build.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_input, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch(() => undefined);
        dispatch(sessionEnded());
        dispatch(api.util.resetApiState()); // forget every cached admin response
      },
    }),

    // On page load: try to get a session from the refresh cookie.
    restoreSession: build.mutation({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      async onQueryStarted(_input, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        // No cookie, expired, or a customer session from the store tab: not logged in here.
        dispatch(data && data.user.role === 'ADMIN' ? sessionStarted(data) : sessionEnded());
      },
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useRestoreSessionMutation } = authApi;
