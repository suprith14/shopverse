import { create } from 'zustand';

// Global auth state.
// The access token is kept in memory only (not localStorage), so a malicious script
// can't steal it from storage. After a page reload we get a new one from /auth/refresh,
// which uses the httpOnly refresh cookie.

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  // 'loading' until the first refresh answers, then 'authenticated' or 'guest'
  status: 'loading',
  // after login, register, refresh or password reset
  setSession: (user, accessToken) => set({ user, accessToken, status: 'authenticated' }),
  // after logout, or when the refresh fails
  clearSession: () => set({ user: null, accessToken: null, status: 'guest' }),
}));
