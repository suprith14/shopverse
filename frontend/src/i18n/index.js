import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
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

export const LANGUAGES = {
  en: { name: 'English', locale: 'en-US' },
  kn: { name: 'ಕನ್ನಡ', locale: 'kn-IN' },
};

const STORAGE_KEY = 'shopverse:lang';

function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved in LANGUAGES) return saved;
  } catch {
    // storage blocked: fall through to the browser's preference
  }
  return navigator.languages?.some((l) => l.toLowerCase().startsWith('kn')) ? 'kn' : 'en';
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, kn: { translation: kn } },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes text, so no double escaping
});

const applyLanguage = (lng) => {
  document.documentElement.lang = lng;
};
applyLanguage(i18n.language);

export function setLanguage(lng) {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // not saved, but still switched for this visit
  }
  i18n.changeLanguage(lng);
  applyLanguage(lng);
}

// For formatting outside components (prices, dates): the current language's locale.
export const currentLocale = () => LANGUAGES[i18n.language]?.locale ?? 'en-US';

export default i18n;
