import { useSyncExternalStore } from 'react';

// "The server broke" (HTTP 5xx) is shown ONCE, as a popup with a retry button
// (components/layout/ServerErrorDialog.jsx), instead of an error box on every widget that failed.
// app/api.js reports it; getErrorMessage() returns nothing for these errors, so the inline
// <ErrorState> stays empty and the admin sees one clear message.
//
// A tiny store of its own (not Redux): it's one true/false flag, and React's built-in
// useSyncExternalStore is all a component needs to follow it.

let open = false;
const listeners = new Set();
const set = (value) => {
  open = value;
  listeners.forEach((listener) => listener());
};

export const reportServerError = () => set(true);
export const dismissServerError = () => set(false);

export const useServerErrorOpen = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => open,
  );

// RTK Query error shapes: { status: 500, data } or, when the body isn't JSON (a proxy's error
// page), { status: 'PARSING_ERROR', originalStatus: 502 }.
export const isServerError = (error) => {
  const status = typeof error?.status === 'number' ? error.status : error?.originalStatus;
  return typeof status === 'number' && status >= 500;
};
