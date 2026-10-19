// import = bring in code from another file or package
// i18n = the translation library instance (current language, changeLanguage)
import i18n from 'i18next';
// import = bring in code from another file or package
import { initReactI18next } from 'react-i18next';
// import = bring in code from another file or package
import en from './en';
// import = bring in code from another file or package
import kn from './kn';

// Languages: English and Kannada (ಕನ್ನಡ).
//
// Every piece of text the store shows lives in ./en.js and ./kn.js under the same key.
// Components call t('product.addToCart') instead of writing "Add to cart", and get the
// text in the visitor's language. A key missing in kn.js falls back to English.
//
// Which language: the visitor's saved choice, otherwise Kannada if the browser prefers it,
// otherwise English. The choice is saved, and <html lang> follows it (screen readers use it to
// pronounce the text correctly, and the browser to pick fonts and hyphenation).
//
// Not translated here: product names/descriptions (from the database) and messages written by
// the API (e.g. "Only 2 left in stock"). The CMS text gets its Kannada version in step 3.

// export = other files can import this
// const = a name for a value that is never reassigned
export const LANGUAGES = {
  en: { name: 'English', locale: 'en-US' },
  kn: { name: 'ಕನ್ನಡ', locale: 'kn-IN' },
};

// const = a name for a value that is never reassigned
const STORAGE_KEY = 'shopverse:lang';

// function = a named, reusable block of code
function detectLanguage() {
  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // const = a name for a value that is never reassigned
    // localStorage = small key-value storage in this browser that survives reloads
    const saved = localStorage.getItem(STORAGE_KEY);
    // if (...) = run the next part only when the condition is true
    // return = give this value back and stop the function here
    if (saved in LANGUAGES) return saved;
  } catch {
    // storage blocked: fall through to the browser's preference
  }
  // return = give this value back and stop the function here
  // a ? b : c = ternary: if a then b else c
  // ?.() = call only if the function exists
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // navigator = info about the browser/device (languages, camera...)
  // .some = true if at least one item passes the test
  // => = an arrow function (a short function)
  return navigator.languages?.some((l) => l.toLowerCase().startsWith('kn')) ? 'kn' : 'en';
}

// i18n = the translation library instance (current language, changeLanguage)
i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, kn: { translation: kn } },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes text, so no double escaping
});

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const applyLanguage = (lng) => {
  // document = the current web page (its HTML elements)
  document.documentElement.lang = lng;
};
// i18n = the translation library instance (current language, changeLanguage)
applyLanguage(i18n.language);

// export = other files can import this
// function = a named, reusable block of code
export function setLanguage(lng) {
  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // localStorage = small key-value storage in this browser that survives reloads
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // not saved, but still switched for this visit
  }
  // i18n = the translation library instance (current language, changeLanguage)
  i18n.changeLanguage(lng);
  applyLanguage(lng);
}

// For formatting outside components (prices, dates): the current language's locale.
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
// obj[key] = read the property whose name is stored in key
// i18n = the translation library instance (current language, changeLanguage)
// a ?? b = a, unless a is null/undefined, then b
export const currentLocale = () => LANGUAGES[i18n.language]?.locale ?? 'en-US';

// export default = the file's main export
// i18n = the translation library instance (current language, changeLanguage)
export default i18n;
