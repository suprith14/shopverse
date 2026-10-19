// import = bring in code from another file or package
// create (zustand) = make a small global store any component can read
import { create } from 'zustand';

// Light / dark theme.
//   preference: what the visitor chose: 'system' (follow the device, the default), 'light' or 'dark'
//   resolved:   what's showing right now: 'light' or 'dark'
// The theme is the "dark" class on <html> (index.css turns that into dark colours).
//
// index.html runs the same rules in a tiny inline script BEFORE the page is painted, so a
// dark-mode visitor never sees a white flash while this JavaScript is still loading.

// const = a name for a value that is never reassigned
const STORAGE_KEY = 'shopverse:theme';
// const = a name for a value that is never reassigned
// window = the browser tab (location, events, timers)
// matchMedia = check a CSS media query in JS, e.g. dark mode or reduced motion
const deviceDark = window.matchMedia('(prefers-color-scheme: dark)');

// function = a named, reusable block of code
function readPreference() {
  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // const = a name for a value that is never reassigned
    // localStorage = small key-value storage in this browser that survives reloads
    const saved = localStorage.getItem(STORAGE_KEY);
    // return = give this value back and stop the function here
    // a ? b : c = ternary: if a then b else c
    // === = strictly equal (same value AND same type)
    // a || b = OR: a if it is truthy, else b
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    // return = give this value back and stop the function here
    return 'system'; // storage blocked: just follow the device
  }
}

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// a ? b : c = ternary: if a then b else c
// === = strictly equal (same value AND same type)
const resolve = (preference) => (preference === 'system' ? (deviceDark.matches ? 'dark' : 'light') : preference);
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// document = the current web page (its HTML elements)
// === = strictly equal (same value AND same type)
const apply = (resolved) => document.documentElement.classList.toggle('dark', resolved === 'dark');

// export = other files can import this
// const = a name for a value that is never reassigned
// create (zustand) = make a small global store any component can read
// => = an arrow function (a short function)
export const useTheme = create(() => {
  // const = a name for a value that is never reassigned
  const preference = readPreference();
  // return = give this value back and stop the function here
  return { preference, resolved: resolve(preference) };
});

// export = other files can import this
// function = a named, reusable block of code
export function setThemePreference(preference) {
  // try / catch = if the code inside fails, run the catch part instead of crashing
  try {
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    // localStorage = small key-value storage in this browser that survives reloads
    if (preference === 'system') localStorage.removeItem(STORAGE_KEY);
    // localStorage = small key-value storage in this browser that survives reloads
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // not saved, but still applied for this visit
  }
  // const = a name for a value that is never reassigned
  const resolved = resolve(preference);
  apply(resolved);
  // setState = change the store; components using it redraw
  useTheme.setState({ preference, resolved });
}

// "System" follows the device live, e.g. when the phone switches to dark mode at sunset.
// addEventListener = run a function when an event happens
// => = an arrow function (a short function)
deviceDark.addEventListener('change', () => {
  // if (...) = run the next part only when the condition is true
  // getState = read the store outside React
  // !== = not strictly equal
  // return = give this value back and stop the function here
  if (useTheme.getState().preference !== 'system') return;
  // const = a name for a value that is never reassigned
  const resolved = resolve('system');
  apply(resolved);
  // setState = change the store; components using it redraw
  useTheme.setState({ resolved });
});
