// Settings that differ between your laptop and the live site.
// Vite exposes environment variables that start with VITE_ to the browser code at BUILD time
// (set them in Vercel's project settings). Without one, the local default is used.

// Where the customer store lives, for "View store" / "View in store" links.
export const STORE_URL = import.meta.env.VITE_STORE_URL ?? 'http://localhost:5173';
