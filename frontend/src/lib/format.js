// import = bring in code from another file or package
import { isAxiosError } from 'axios';
// import = bring in code from another file or package
// i18n = the translation library instance (current language, changeLanguage)
import i18n, { currentLocale } from '@/i18n';

// Prices stay in US-style dollars in every language ("$129.99"): the store charges in USD, and
// the same digits and symbol everywhere avoid any doubt about the amount.
// const = a name for a value that is never reassigned
// new = create an object from a class (e.g. new Date())
// Intl = the browser's built-in formatting for dates, numbers and names per language
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// 12999 (cents) -> "$129.99"
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
export const formatPrice = (cents) => currency.format(cents / 100);

// Dates follow the reader's language: "19 Oct 2026" / "19 ಅಕ್ಟೋ 2026".
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// x = value (in parameters) = the default used when x is not given
export const formatDate = (iso, options = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  // new = create an object from a class (e.g. new Date())
  // Date = a point in time
  new Date(iso).toLocaleDateString(currentLocale(), options);

// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
export const formatDateTime = (iso) =>
  // new = create an object from a class (e.g. new Date())
  // Date = a point in time
  new Date(iso).toLocaleString(currentLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Turns any thrown error into a message we can show the user.
// Messages written by the API (e.g. "Only 2 left in stock") arrive in English.
// export = other files can import this
// function = a named, reusable block of code
export function getErrorMessage(error) {
  // if (...) = run the next part only when the condition is true
  if (isAxiosError(error)) {
    // const = a name for a value that is never reassigned
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    const body = error.response?.data?.error;
    // if (...) = run the next part only when the condition is true
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // return = give this value back and stop the function here
    // .map = make a new array by transforming each item (in JSX: one element per item)
    // => = an arrow function (a short function)
    // .join = turn an array into one string with a separator
    if (body?.details?.length) return body.details.map((d) => d.message).join(', ');
    // if (...) = run the next part only when the condition is true
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // return = give this value back and stop the function here
    if (body?.message) return body.message;
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // return = give this value back and stop the function here
    // i18n = the translation library instance (current language, changeLanguage)
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    if (!error.response) return i18n.t('errors.cannotReach');
  }
  // return = give this value back and stop the function here
  // a ? b : c = ternary: if a then b else c
  // i18n = the translation library instance (current language, changeLanguage)
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  return error instanceof Error ? error.message : i18n.t('errors.generic');
}
