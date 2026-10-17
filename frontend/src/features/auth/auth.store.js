import { create } from 'zustand';

// Global auth state.
// The access token is kept in memory only (not localStorage), so a malicious script
// can't steal it from storage. After a page reload we get a new one from /auth/refresh,
// which uses the httpOnly refresh cookie.

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  status: 'loading',
  setSession: (user, accessToken) => set({ user, accessToken, status: 'authenticated' }),
  clearSession: () => set({ user: null, accessToken: null, status: 'guest' }),
}));
