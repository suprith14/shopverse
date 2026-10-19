// import = bring in code from another file or package
// create (zustand) = make a small global store any component can read
import { create } from 'zustand';
// import = bring in code from another file or package
import { isAxiosError } from 'axios';
// import = bring in code from another file or package
import { getErrorMessage } from './format';
// import = bring in code from another file or package
// i18n = the translation library instance (current language, changeLanguage)
import i18n from '@/i18n';

// Every failed API request opens ONE popup (components/layout/ApiErrorDialog.jsx) with a message
// that fits what went wrong: no internet, server down, logged out, not allowed, wrong input...
// Reported from two places:
//   main.jsx  -> TanStack Query's global onError: every query and mutation, once, after retries
//   notify.js -> notify.error(): calls made outside TanStack Query (e.g. the invoice download)
// A query can opt out with meta: { errorPopup: false } when its screen already explains the
// error right where the customer is looking (e.g. "This coupon has expired" under the coupon box).

// export = other files can import this
// const = a name for a value that is never reassigned
// create (zustand) = make a small global store any component can read
// => = an arrow function (a short function)
export const useApiError = create(() => ({ error: null, kind: null, message: '' }));

// Which kind of failure this is. The popup picks its icon, title and buttons from it.
// export = other files can import this
// function = a named, reusable block of code
export function errorKind(error) {
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  if (!isAxiosError(error)) return 'generic';
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  if (!error.response) return 'offline'; // no answer at all: no internet, or the server is unreachable
  // const = a name for a value that is never reassigned
  const status = error.response.status;
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  if (status >= 500) return 'server';
  // 401 from /auth/* = wrong email or password (show the message);
  // 401 anywhere else = the login expired and could not be refreshed
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  // a ? b : c = ternary: if a then b else c
  // ?.() = call only if the function exists
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  if (status === 401) return error.config?.url?.startsWith('/auth/') ? 'invalid' : 'session';
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  // a ? b : c = ternary: if a then b else c
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // a ?? b = a, unless a is null/undefined, then b
  if (status === 403) return /suspended/i.test(error.response.data?.error?.message ?? '') ? 'suspended' : 'forbidden';
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  if (status === 404) return 'notFound';
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  if (status === 429) return 'tooMany';
  // return = give this value back and stop the function here
  return 'invalid'; // 400, 409, 422...: the server says what to fix
}

// let = a name whose value can be changed later
let lastReported = null;

// export = other files can import this
// function = a named, reusable block of code
export function reportApiError(error) {
  // A mutation with onError: notify.error is reported by both places: show it once
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  if (error === lastReported) return;
  // Cancelled on purpose (the page was left, a newer search replaced it): not a failure
  // if (...) = run the next part only when the condition is true
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  if (error?.name === 'CanceledError') return;
  lastReported = error;
  // One popup at a time: a second failure doesn't replace the message being read
  // if (...) = run the next part only when the condition is true
  // getState = read the store outside React
  // return = give this value back and stop the function here
  if (useApiError.getState().error) return;
  // setState = change the store; components using it redraw
  useApiError.setState({ error, kind: errorKind(error), message: getErrorMessage(error) });
}

// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// setState = change the store; components using it redraw
export const dismissApiError = () => useApiError.setState({ error: null, kind: null, message: '' });

// The device lost its internet connection. TanStack Query doesn't FAIL requests then: it pauses
// them and carries on by itself when the connection is back. So nothing would report an error and
// the customer would only see loading boxes. Instead: show "No connection" right away, and close
// it by itself once back online (the paused requests then finish normally).
// window = the browser tab (location, events, timers)
// addEventListener = run a function when an event happens
// => = an arrow function (a short function)
window.addEventListener('offline', () => {
  // if (...) = run the next part only when the condition is true
  // getState = read the store outside React
  // return = give this value back and stop the function here
  if (useApiError.getState().error) return;
  // setState = change the store; components using it redraw
  // new = create an object from a class (e.g. new Date())
  // i18n = the translation library instance (current language, changeLanguage)
  useApiError.setState({ error: new Error('offline'), kind: 'noInternet', message: i18n.t('errors.offlineText') });
});
// window = the browser tab (location, events, timers)
// addEventListener = run a function when an event happens
// => = an arrow function (a short function)
window.addEventListener('online', () => {
  // if (...) = run the next part only when the condition is true
  // getState = read the store outside React
  // === = strictly equal (same value AND same type)
  if (useApiError.getState().kind === 'noInternet') dismissApiError();
});

// Used by the inline error box: 5xx errors are explained by the popup only
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// a && b = AND; in JSX: show b only when a is true
// ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
// a ?? b = a, unless a is null/undefined, then b
export const isServerError = (error) => isAxiosError(error) && (error.response?.status ?? 0) >= 500;
