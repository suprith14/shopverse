// import = bring in code from another file or package
// useMemo = remember a calculated value; recalculate only when its [deps] change
import { useMemo } from 'react';
// import = bring in code from another file or package
// useQuery = READ server data with caching, loading and error states
import { useQuery } from '@tanstack/react-query';
// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
import { siteDefaults } from './site';

// The store's text, from the CMS, without ever making the page wait for it.
//
//   1. Instantly: the copy this browser saved last time (localStorage), or site.js on a first visit.
//   2. In the background: fetch fresh text from the CMS and swap it in when it arrives.
//   3. CMS down or asleep: keep showing (1). Nothing breaks, nothing waits.
//
// So the CMS being a separate (sleeping) server costs visitors nothing.
// This is "stale-while-revalidate" again, this time inside the browser.

// const = a name for a value that is never reassigned
// a ?? b = a, unless a is null/undefined, then b
const CMS_URL = import.meta.env.VITE_CMS_URL ?? '/cms'; // forwarded to cms/ by Vite (laptop) / Vercel (live)
// const = a name for a value that is never reassigned
const CACHE_KEY = 'shopverse:site-content';

// CMS text on top of the defaults, per type: a field the CMS doesn't send keeps its default.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const withDefaults = (content) =>
  // Object.fromEntries = build an object from [key, value] pairs
  // Object.entries = [key, value] pairs of an object
  // .map = make a new array by transforming each item (in JSX: one element per item)
  // => = an arrow function (a short function)
  // [a, b] = destructuring: take the first and second items of an array
  // ...x = spread: copy all items/properties of x into here
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // obj[key] = read the property whose name is stored in key
  Object.fromEntries(Object.entries(siteDefaults).map(([type, defaults]) => [type, { ...defaults, ...content?.[type] }]));

// Translated CMS text is { en, kn }. Pick the reader's language, or English when that box is empty.
// Plain strings (untranslated fields like the brand name, or older saved copies) pass through.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const isLocalized = (value) =>
  // !== = not strictly equal
  // === = strictly equal (same value AND same type)
  // ! = NOT: flips true/false
  // a && b = AND; in JSX: show b only when a is true
  value !== null && typeof value === 'object' && !Array.isArray(value) && 'en' in value;

// function = a named, reusable block of code
function inLanguage(value, lng) {
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  // a ? b : c = ternary: if a then b else c
  // obj[key] = read the property whose name is stored in key
  // a || b = OR: a if it is truthy, else b
  // .trim = remove spaces at both ends
  if (isLocalized(value)) return (value[lng] || '').trim() ? value[lng] : value.en;
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  // .map = make a new array by transforming each item (in JSX: one element per item)
  // => = an arrow function (a short function)
  if (Array.isArray(value)) return value.map((item) => inLanguage(item, lng));
  // if (...) = run the next part only when the condition is true
  // !== = not strictly equal
  // a && b = AND; in JSX: show b only when a is true
  // === = strictly equal (same value AND same type)
  if (value !== null && typeof value === 'object') {
    // return = give this value back and stop the function here
    // Object.fromEntries = build an object from [key, value] pairs
    // Object.entries = [key, value] pairs of an object
    // .map = make a new array by transforming each item (in JSX: one element per item)
    // => = an arrow function (a short function)
    // [a, b] = destructuring: take the first and second items of an array
    return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, inLanguage(v, lng)]));
  }
  // return = give this value back and stop the function here
  return value;
}

// function = a named, reusable block of code
function readSavedCopy() {
  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // const = a name for a value that is never reassigned
    // localStorage = small key-value storage in this browser that survives reloads
    const saved = localStorage.getItem(CACHE_KEY);
    // return = give this value back and stop the function here
    // a ? b : c = ternary: if a then b else c
    // JSON.parse / JSON.stringify = text <-> object
    return saved ? JSON.parse(saved) : undefined;
  } catch {
    // return = give this value back and stop the function here
    return undefined; // private mode, blocked storage, or a damaged value: just use the defaults
  }
}

// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function fetchContent() {
  // A plain fetch, not the shop's axios client: a slow CMS must not trigger the
  // "waking up the server" banner, which is about the shop API.
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // fetch = the browser's built-in way to send an HTTP request
  // `text ${x}` = a template string: text with values inserted
  // AbortSignal = lets a request be cancelled (e.g. after a timeout)
  const res = await fetch(`${CMS_URL}/content`, { signal: AbortSignal.timeout(15_000) });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // new = create an object from a class (e.g. new Date())
  // `text ${x}` = a template string: text with values inserted
  if (!res.ok) throw new Error(`CMS answered ${res.status}`);
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  const content = withDefaults(await res.json());
  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // localStorage = small key-value storage in this browser that survives reloads
    // JSON.parse / JSON.stringify = text <-> object
    localStorage.setItem(CACHE_KEY, JSON.stringify(content));
  } catch {
    // storage full or blocked: fine, we just won't have a copy next time
  }
  // return = give this value back and stop the function here
  return content;
}

// export = other files can import this
// function = a named, reusable block of code
export function useSiteContent() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // i18n = the translation library instance (current language, changeLanguage)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { i18n } = useTranslation(); // re-renders on a language switch: no new request needed
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // useQuery = READ server data with caching, loading and error states
  const { data } = useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: ['site-content'],
    // queryFn = the function that actually fetches the data
    queryFn: fetchContent,
    // Shown immediately. updatedAt 0 = "old", so React Query still fetches the CMS right away.
    // => = an arrow function (a short function)
    initialData: () => withDefaults(readSavedCopy()),
    initialDataUpdatedAt: 0,
    // staleTime = how long cached data counts as fresh (no refetch during that time)
    staleTime: 5 * 60 * 1000, // then check again at most every 5 minutes
    retry: 1,
  });
  // Both languages are cached; components get plain strings in the current one.
  // return = give this value back and stop the function here
  // useMemo = remember a calculated value; recalculate only when its [deps] change
  // => = an arrow function (a short function)
  // i18n = the translation library instance (current language, changeLanguage)
  return useMemo(() => inLanguage(data, i18n.language), [data, i18n.language]);
}
