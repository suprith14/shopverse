// import = bring in code from another file or package
import { currentLocale } from '@/i18n';

// The countries we deliver to (same list as the backend's profile.schema.ts).
// The backend is the real check; this list just fills the dropdown.
// export = other files can import this
// const = a name for a value that is never reassigned
export const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
];

// The country's name in the reader's language ("Germany" / "ಜರ್ಮನಿ"). The browser already knows
// every country's name in every language (Intl.DisplayNames), so nothing needs translating here.
// The English names above are the fallback for very old browsers.
// export = other files can import this
// function = a named, reusable block of code
export function countryName(code) {
  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // return = give this value back and stop the function here
    // new = create an object from a class (e.g. new Date())
    // Intl = the browser's built-in formatting for dates, numbers and names per language
    // a ?? b = a, unless a is null/undefined, then b
    return new Intl.DisplayNames([currentLocale()], { type: 'region' }).of(code) ?? code;
  } catch {
    // return = give this value back and stop the function here
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // .find = the first item that passes a test (or undefined)
    // => = an arrow function (a short function)
    // === = strictly equal (same value AND same type)
    // a ?? b = a, unless a is null/undefined, then b
    return COUNTRIES.find((c) => c.code === code)?.name ?? code;
  }
}
