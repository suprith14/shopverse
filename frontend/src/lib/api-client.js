// import = bring in code from another file or package
// axios = an HTTP client library (sends requests to the API)
import axios from 'axios';
// import = bring in code from another file or package
import { useAuthStore } from '@/features/auth/auth.store';
// import = bring in code from another file or package
import { track } from './network-status';

// A single axios instance used by every feature's *.api.ts file.
// export = other files can import this
// const = a name for a value that is never reassigned
// api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
// axios = an HTTP client library (sends requests to the API)
// create (zustand) = make a small global store any component can read
export const api = axios.create({
  // a ?? b = a, unless a is null/undefined, then b
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true, // send the httpOnly refresh-token cookie
});

// 1) Attach the access token to every request, and start the "is the server slow?" timer.
// api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
// interceptors = code that runs on every request/response
// => = an arrow function (a short function)
api.interceptors.request.use((config) => {
  // const = a name for a value that is never reassigned
  // getState = read the store outside React
  const token = useAuthStore.getState().accessToken;
  // if (...) = run the next part only when the condition is true
  // `text ${x}` = a template string: text with values inserted
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config._done = track();
  // return = give this value back and stop the function here
  return config;
});

// 2) Silent refresh: when a request fails with 401 (access token expired), get a new
//    access token using the refresh cookie, then retry the original request once.
//    If several requests fail at the same time, they all wait for ONE refresh call.
// let = a name whose value can be changed later
let refreshPromise = null;

// export = other files can import this
// function = a named, reusable block of code
export function refreshSession() {
  // const = a name for a value that is never reassigned
  const done = track(); // this is the very first request on page load: often the one waking the server
  // axios = an HTTP client library (sends requests to the API)
  refreshPromise ??= axios
    // `text ${x}` = a template string: text with values inserted
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    .post(`${api.defaults.baseURL}/auth/refresh`, null, { withCredentials: true })
    // => = an arrow function (a short function)
    // { a, b } = destructuring: take properties a and b out of an object
    .then(({ data }) => {
      // getState = read the store outside React
      useAuthStore.getState().setSession(data.user, data.accessToken);
      // return = give this value back and stop the function here
      return data.accessToken;
    })
    // => = an arrow function (a short function)
    .catch(() => {
      // getState = read the store outside React
      useAuthStore.getState().clearSession();
      // return = give this value back and stop the function here
      return null;
    })
    // => = an arrow function (a short function)
    .finally(() => {
      refreshPromise = null;
    });
  // return = give this value back and stop the function here
  return refreshPromise.finally(done);
}

// api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
// interceptors = code that runs on every request/response
api.interceptors.response.use(
  // => = an arrow function (a short function)
  (response) => {
    // ?.() = call only if the function exists
    response.config._done?.();
    // return = give this value back and stop the function here
    return response;
  },
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  async (error) => {
    // const = a name for a value that is never reassigned
    const original = error.config;
    // ?.() = call only if the function exists
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    original?._done?.();
    // const = a name for a value that is never reassigned
    // ?.() = call only if the function exists
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    const isAuthCall = original?.url?.startsWith('/auth/');

    // Failures are NOT reported here: a query may retry, and this would fire on every attempt.
    // TanStack Query reports each failure once, after retries (main.jsx -> lib/api-error.js).

    // if (...) = run the next part only when the condition is true
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // === = strictly equal (same value AND same type)
    // ! = NOT: flips true/false
    // a && b = AND; in JSX: show b only when a is true
    if (error.response?.status === 401 && !original._retried && !isAuthCall) {
      original._retried = true;
      // const = a name for a value that is never reassigned
      // await = wait for a Promise (async result) before continuing
      const newToken = await refreshSession();
      // if (...) = run the next part only when the condition is true
      if (newToken) {
        // ...x = spread: copy all items/properties of x into here
        // `text ${x}` = a template string: text with values inserted
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        // return = give this value back and stop the function here
        // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
        return api(original);
      }
    }
    // return = give this value back and stop the function here
    // Promise = a value that arrives later (async)
    return Promise.reject(error);
  },
);
