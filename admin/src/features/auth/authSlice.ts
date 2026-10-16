import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/api';

// A "slice" = one section of the Redux store: its data + the only functions allowed to change it.
//
// Like the store frontend, the access token lives in memory only (never localStorage), so a
// malicious script can't read it from storage. After a page reload we get a new one from
// /auth/refresh using the httpOnly cookie.

type Status = 'loading' | 'authenticated' | 'guest';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: Status;
}

const initialState: AuthState = { user: null, accessToken: null, status: 'loading' };

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  // Reducers: (current state, action) -> new state. Redux Toolkit lets us write it as if we
  // were changing `state` directly; behind the scenes (Immer) it builds a new copy.
  reducers: {
    sessionStarted(state, action: PayloadAction<{ user: User; accessToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = 'authenticated';
    },
    sessionEnded(state) {
      state.user = null;
      state.accessToken = null;
      state.status = 'guest';
    },
  },
});

// Action creators: dispatch(sessionStarted({ user, accessToken })) from anywhere.
export const { sessionStarted, sessionEnded } = authSlice.actions;
export default authSlice.reducer;
