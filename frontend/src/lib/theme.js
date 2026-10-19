import { create } from 'zustand';

// Light / dark theme.
//   preference: what the visitor chose: 'system' (follow the device, the default), 'light' or 'dark'
//   resolved:   what's showing right now: 'light' or 'dark'
// The theme is the "dark" class on <html> (index.css turns that into dark colours).
//
// index.html runs the same rules in a tiny inline script BEFORE the page is painted, so a
// dark-mode visitor never sees a white flash while this JavaScript is still loading.

const STORAGE_KEY = 'shopverse:theme';
const deviceDark = window.matchMedia('(prefers-color-scheme: dark)');

function readPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    return 'system'; // storage blocked: just follow the device
  }
}

const resolve = (preference) => (preference === 'system' ? (deviceDark.matches ? 'dark' : 'light') : preference);
const apply = (resolved) => document.documentElement.classList.toggle('dark', resolved === 'dark');

export const useTheme = create(() => {
  const preference = readPreference();
  return { preference, resolved: resolve(preference) };
});

export function setThemePreference(preference) {
  try {
    if (preference === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // not saved, but still applied for this visit
  }
  const resolved = resolve(preference);
  apply(resolved);
  useTheme.setState({ preference, resolved });
}

// "System" follows the device live, e.g. when the phone switches to dark mode at sunset.
deviceDark.addEventListener('change', () => {
  if (useTheme.getState().preference !== 'system') return;
  const resolved = resolve('system');
  apply(resolved);
  useTheme.setState({ resolved });
});
