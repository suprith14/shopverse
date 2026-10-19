// import = bring in code from another file or package
import { isServerError } from './server-error';

// const = a name for a value that is never reassigned
// new = create an object from a class (e.g. new Date())
// Intl = the browser's built-in formatting for dates, numbers and names per language
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// 12999 (cents) -> "$129.99"
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
export const formatPrice = (cents) => currency.format(cents / 100);

// Price inputs are typed in dollars, the API speaks cents: "129.99" <-> 12999.
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// Math = number helpers (min, max, round, floor...)
export const toCents = (dollars) => Math.round(Number(dollars) * 100);
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// .toFixed(n) = number as text with n decimals
export const toDollars = (cents) => (cents / 100).toFixed(2);

// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
export const formatDateTime = (iso) =>
  // new = create an object from a class (e.g. new Date())
  // Date = a point in time
  new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// "just now", "12 min ago", "3 h ago", "2 days ago", then the date
// export = other files can import this
// function = a named, reusable block of code
export function formatTimeAgo(iso) {
  // const = a name for a value that is never reassigned
  // Math = number helpers (min, max, round, floor...)
  // Date = a point in time
  // new = create an object from a class (e.g. new Date())
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  if (minutes < 1) return 'just now';
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  // `text ${x}` = a template string: text with values inserted
  if (minutes < 60) return `${minutes} min ago`;
  // const = a name for a value that is never reassigned
  // Math = number helpers (min, max, round, floor...)
  const hours = Math.floor(minutes / 60);
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  // `text ${x}` = a template string: text with values inserted
  if (hours < 24) return `${hours} h ago`;
  // const = a name for a value that is never reassigned
  // Math = number helpers (min, max, round, floor...)
  const days = Math.floor(hours / 24);
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  // `text ${x}` = a template string: text with values inserted
  // a ? b : c = ternary: if a then b else c
  // === = strictly equal (same value AND same type)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  // return = give this value back and stop the function here
  // new = create an object from a class (e.g. new Date())
  // Date = a point in time
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

// "cmvaj3k50000jgqj4rhxb9nej" -> "#RHXB9NEJ" (the short number customers see)
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// `text ${x}` = a template string: text with values inserted
// .slice = a copy of part of an array/string
export const orderNumber = (id) => `#${id.slice(-8).toUpperCase()}`;

// RTK Query errors come in two shapes: an HTTP error from the backend (with our
// { error: { message } } body), or a network/JS error. Turn either into readable text.
// Server failures (5xx) return null: the server-error popup explains those instead.
// export = other files can import this
// function = a named, reusable block of code
export function getErrorMessage(error) {
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  if (!error) return 'Something went wrong';
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  if (isServerError(error)) return null;
  // if (...) = run the next part only when the condition is true
  if ('status' in error) {
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    // return = give this value back and stop the function here
    if (error.status === 'FETCH_ERROR') return 'Cannot reach the server. Is the backend running?';
    // const = a name for a value that is never reassigned
    const body = error.data;
    // if (...) = run the next part only when the condition is true
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // return = give this value back and stop the function here
    // .map = make a new array by transforming each item (in JSX: one element per item)
    // => = an arrow function (a short function)
    // `text ${x}` = a template string: text with values inserted
    // .join = turn an array into one string with a separator
    if (body?.error?.details?.length) return body.error.details.map((d) => `${d.field}: ${d.message}`).join(', ');
    // if (...) = run the next part only when the condition is true
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // return = give this value back and stop the function here
    if (body?.error?.message) return body.error.message;
    // return = give this value back and stop the function here
    // `text ${x}` = a template string: text with values inserted
    return `Request failed (${error.status})`;
  }
  // return = give this value back and stop the function here
  // a ?? b = a, unless a is null/undefined, then b
  return error.message ?? 'Something went wrong';
}
