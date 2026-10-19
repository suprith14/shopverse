// import = bring in code from another file or package
// create (zustand) = make a small global store any component can read
import { create } from 'zustand';
// import = bring in code from another file or package
import { isAxiosError } from 'axios';

// "The server broke" (HTTP 5xx) is shown ONCE, as a popup with a retry button
// (components/layout/ServerErrorDialog.jsx), instead of an "Internal server error" box on every
// widget that failed. The API client reports it; the inline error box and the error toast stay
// quiet for these errors, so the customer sees one clear message instead of several.

// export = other files can import this
// const = a name for a value that is never reassigned
// create (zustand) = make a small global store any component can read
// => = an arrow function (a short function)
export const useServerError = create(() => ({ open: false }));

// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// setState = change the store; components using it redraw
export const reportServerError = () => useServerError.setState({ open: true });
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// setState = change the store; components using it redraw
export const dismissServerError = () => useServerError.setState({ open: false });

// 500 Internal Server Error, 502 Bad Gateway, 503 Unavailable, 504 Timeout...
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// a && b = AND; in JSX: show b only when a is true
// ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
// a ?? b = a, unless a is null/undefined, then b
export const isServerError = (error) => isAxiosError(error) && (error.response?.status ?? 0) >= 500;
