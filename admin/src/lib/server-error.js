// import = bring in code from another file or package
// useSyncExternalStore = let React read a store that lives outside React
import { useSyncExternalStore } from 'react';

// "The server broke" (HTTP 5xx) is shown ONCE, as a popup with a retry button
// (components/layout/ServerErrorDialog.jsx), instead of an error box on every widget that failed.
// app/api.js reports it; getErrorMessage() returns nothing for these errors, so the inline
// <ErrorState> stays empty and the admin sees one clear message.
//
// A tiny store of its own (not Redux): it's one true/false flag, and React's built-in
// useSyncExternalStore is all a component needs to follow it.

// let = a name whose value can be changed later
let open = false;
// const = a name for a value that is never reassigned
// new = create an object from a class (e.g. new Date())
// Set = a collection of unique values with fast .has() lookup
const listeners = new Set();
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const set = (value) => {
  open = value;
  // => = an arrow function (a short function)
  listeners.forEach((listener) => listener());
};

// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
export const reportServerError = () => set(true);
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
export const dismissServerError = () => set(false);

// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
export const useServerErrorOpen = () =>
  // useSyncExternalStore = let React read a store that lives outside React
  useSyncExternalStore(
    // => = an arrow function (a short function)
    (listener) => {
      listeners.add(listener);
      // return = give this value back and stop the function here
      // => = an arrow function (a short function)
      return () => listeners.delete(listener);
    },
    // => = an arrow function (a short function)
    () => open,
  );

// RTK Query error shapes: { status: 500, data } or, when the body isn't JSON (a proxy's error
// page), { status: 'PARSING_ERROR', originalStatus: 502 }.
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
export const isServerError = (error) => {
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // === = strictly equal (same value AND same type)
  const status = typeof error?.status === 'number' ? error.status : error?.originalStatus;
  // return = give this value back and stop the function here
  // === = strictly equal (same value AND same type)
  // a && b = AND; in JSX: show b only when a is true
  return typeof status === 'number' && status >= 500;
};
