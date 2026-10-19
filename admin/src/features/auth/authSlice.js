// import = bring in code from another file or package
// createSlice = one part of the Redux state + the functions (reducers) that change it
import { createSlice } from '@reduxjs/toolkit';

// A "slice" = one section of the Redux store: its data + the only functions allowed to change it.
//
// Like the store frontend, the access token lives in memory only (never localStorage), so a
// malicious script can't read it from storage. After a page reload we get a new one from
// /auth/refresh using the httpOnly cookie.

// const = a name for a value that is never reassigned
// initialState = the state before anything has happened
const initialState = { user: null, accessToken: null, status: 'loading' };

// export = other files can import this
// const = a name for a value that is never reassigned
// createSlice = one part of the Redux state + the functions (reducers) that change it
export const authSlice = createSlice({
  name: 'auth',
  // initialState = the state before anything has happened
  initialState,
  // Reducers: (current state, action) -> new state. Redux Toolkit lets us write it as if we
  // were changing `state` directly; behind the scenes (Immer) it builds a new copy.
  // reducers = functions that take the old state + an action and make the new state
  reducers: {
    sessionStarted(state, action) {
      // payload = the data that travels with an action
      state.user = action.payload.user;
      // payload = the data that travels with an action
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
// export = other files can import this
// const = a name for a value that is never reassigned
// { a, b } = destructuring: take properties a and b out of an object
export const { sessionStarted, sessionEnded } = authSlice.actions;
// export default = the file's main export
export default authSlice.reducer;
