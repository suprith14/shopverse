import { env, isProd } from '../config/env.js';

// Where should Stripe send the customer back after paying?
//
// Normally CLIENT_URL. But when testing on a phone over Wi-Fi (vite --host), the store is at
// e.g. http://192.168.31.234:5173, and "localhost" on a phone means the phone itself.
// So we use the address the customer actually came from (the request's Origin header),
// but ONLY if it's on the allow-list. Blindly trusting it would be an "open redirect":
// anyone could make Stripe send our customers to a look-alike site.
//
// Allowed: CLIENT_URL always; in development also localhost and private network addresses.
const LOCALHOST = /^http:\/\/localhost:\d+$/;
const PRIVATE_NETWORK = /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+):\d+$/;

export function storeOrigin(requestOrigin) {
  if (!requestOrigin || requestOrigin === env.CLIENT_URL) return env.CLIENT_URL;
  if (!isProd && (LOCALHOST.test(requestOrigin) || PRIVATE_NETWORK.test(requestOrigin))) return requestOrigin;
  return env.CLIENT_URL; // anything else: ignore it
}
