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

export const countryName = (code) => COUNTRIES.find((c) => c.code === code)?.name ?? code;
