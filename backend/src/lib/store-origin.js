// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
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
// const = a name for a value that is never reassigned
const LOCALHOST = /^http:\/\/localhost:\d+$/;
// const = a name for a value that is never reassigned
const PRIVATE_NETWORK = /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+):\d+$/;

// export = other files can import this
// function = a named, reusable block of code
export function storeOrigin(requestOrigin) {
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // a || b = OR: a if it is truthy, else b
  // === = strictly equal (same value AND same type)
  // env = the checked settings from .env (config/env.js)
  // return = give this value back and stop the function here
  if (!requestOrigin || requestOrigin === env.CLIENT_URL) return env.CLIENT_URL;
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // a && b = AND; in JSX: show b only when a is true
  // a || b = OR: a if it is truthy, else b
  // return = give this value back and stop the function here
  if (!isProd && (LOCALHOST.test(requestOrigin) || PRIVATE_NETWORK.test(requestOrigin))) return requestOrigin;
  // return = give this value back and stop the function here
  // env = the checked settings from .env (config/env.js)
  return env.CLIENT_URL; // anything else: ignore it
}
