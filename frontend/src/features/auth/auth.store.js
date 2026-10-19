// import = bring in code from another file or package
// create (zustand) = make a small global store any component can read
import { create } from 'zustand';

// Global auth state.
// The access token is kept in memory only (not localStorage), so a malicious script
// can't steal it from storage. After a page reload we get a new one from /auth/refresh,
// which uses the httpOnly refresh cookie.

// export = other files can import this
// const = a name for a value that is never reassigned
// create (zustand) = make a small global store any component can read
// => = an arrow function (a short function)
export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  // 'loading' until the first refresh answers, then 'authenticated' or 'guest'
  status: 'loading',
  // after login, register, refresh or password reset
  // => = an arrow function (a short function)
  setSession: (user, accessToken) => set({ user, accessToken, status: 'authenticated' }),
  // after logout, or when the refresh fails
  // => = an arrow function (a short function)
  clearSession: () => set({ user: null, accessToken: null, status: 'guest' }),
}));
