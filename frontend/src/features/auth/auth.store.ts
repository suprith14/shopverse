import { create } from 'zustand';
import type { User } from '@/types/api';

// Global auth state.
// The access token is kept in memory only (not localStorage), so a malicious script
// can't steal it from storage. After a page reload we get a new one from /auth/refresh,
// which uses the httpOnly refresh cookie.

type Status = 'loading' | 'authenticated' | 'guest';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: Status;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'loading',
  setSession: (user, accessToken) => set({ user, accessToken, status: 'authenticated' }),
  clearSession: () => set({ user: null, accessToken: null, status: 'guest' }),
}));
