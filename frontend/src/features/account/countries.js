import { currentLocale } from '@/i18n';

// The countries we deliver to (same list as the backend's profile.schema.ts).
// The backend is the real check; this list just fills the dropdown.
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
export function countryName(code) {
  try {
    return new Intl.DisplayNames([currentLocale()], { type: 'region' }).of(code) ?? code;
  } catch {
    return COUNTRIES.find((c) => c.code === code)?.name ?? code;
  }
}
