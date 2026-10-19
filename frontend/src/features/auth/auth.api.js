// import = bring in code from another file or package
// useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
import { useMutation } from '@tanstack/react-query';
// import = bring in code from another file or package
// api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
import { api } from '@/lib/api-client';
// import = bring in code from another file or package
import { useAuthStore } from './auth.store';

// Each feature has an *.api.ts file: plain functions that call the backend,
// wrapped in React Query hooks that components use.

// export = other files can import this
// function = a named, reusable block of code
export function useLogin() {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const setSession = useAuthStore((s) => s.setSession);
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    mutationFn: async (input) => (await api.post('/auth/login', input)).data,
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    onSuccess: (data) => setSession(data.user, data.accessToken),
  });
}

// export = other files can import this
// function = a named, reusable block of code
export function useRegister() {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const setSession = useAuthStore((s) => s.setSession);
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    mutationFn: async (input) => (await api.post('/auth/register', input)).data,
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    onSuccess: (data) => setSession(data.user, data.accessToken),
  });
}

// Change password. The server signs out every other device and returns a fresh session for
// this one (new access token here, new refresh cookie set by the response).
// export = other files can import this
// function = a named, reusable block of code
export function useChangePassword() {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const setSession = useAuthStore((s) => s.setSession);
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    mutationFn: async (input) => (await api.post('/auth/change-password', input)).data,
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    onSuccess: (data) => setSession(data.user, data.accessToken),
  });
}

// Forgot password, step 1: email me a code. The server answers the same way whether or not
// the account exists, so the page can't (and doesn't) say "no such account".
// export = other files can import this
// function = a named, reusable block of code
export function useForgotPassword() {
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    mutationFn: async (input) => (await api.post('/auth/forgot-password', input)).data,
  });
}

// Step 2: code + new password. Success logs you straight in on this device.
// export = other files can import this
// function = a named, reusable block of code
export function useResetPassword() {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const setSession = useAuthStore((s) => s.setSession);
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    mutationFn: async (input) => (await api.post('/auth/reset-password', input)).data,
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    onSuccess: (data) => setSession(data.user, data.accessToken),
  });
}

// export = other files can import this
// function = a named, reusable block of code
export function useLogout() {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const clearSession = useAuthStore((s) => s.clearSession);
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    mutationFn: () => api.post('/auth/logout'),
    // => = an arrow function (a short function)
    onSettled: () => clearSession(),
  });
}
