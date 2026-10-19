// import = bring in code from another file or package
// i18n = the translation library instance (current language, changeLanguage)
import i18n from '@/i18n';
// import = bring in code from another file or package
// useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
// useQuery = READ server data with caching, loading and error states
// useQueryClient = the shared cache, to update or refresh cached data
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import = bring in code from another file or package
// api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
import { api } from '@/lib/api-client';
// import = bring in code from another file or package
import { useAuthStore } from '@/features/auth/auth.store';

// "My account" data: profile details, photo and address book. Every endpoint returns the
// whole updated profile, which goes straight into the cache (no extra GET needed).

// function = a named, reusable block of code
function useProfileKey() {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  const userId = useAuthStore((s) => s.user?.id);
  // return = give this value back and stop the function here
  return ['profile', userId];
}

// export = other files can import this
// function = a named, reusable block of code
export function useProfile() {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const status = useAuthStore((s) => s.status);
  // return = give this value back and stop the function here
  // useQuery = READ server data with caching, loading and error states
  return useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: useProfileKey(),
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    queryFn: async () => (await api.get('/profile')).data.profile,
    // enabled = only fetch when this is true (e.g. once logged in)
    // === = strictly equal (same value AND same type)
    enabled: status === 'authenticated',
  });
}

// function = a named, reusable block of code
function useProfileMutation(request) {
  // const = a name for a value that is never reassigned
  // useQueryClient = the shared cache, to update or refresh cached data
  const queryClient = useQueryClient();
  // const = a name for a value that is never reassigned
  const key = useProfileKey();
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const setSession = useAuthStore((s) => s.setSession);
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const accessToken = useAuthStore((s) => s.accessToken);
  // return = give this value back and stop the function here
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  return useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    mutationFn: async (input) => (await request(input)).data.profile,
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    onSuccess: (profile) => {
      // setQueryData = put a value straight into the cache (no request)
      queryClient.setQueryData(key, profile);
      // Keep the name shown in the header in sync after a rename.
      // if (...) = run the next part only when the condition is true
      if (accessToken)
        setSession({ id: profile.id, name: profile.name, email: profile.email, role: profile.role }, accessToken);
    },
  });
}

// export = other files can import this
// function = a named, reusable block of code
export function useUpdateProfile() {
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
  return useProfileMutation((input) => api.patch('/profile', input));
}

// export = other files can import this
// function = a named, reusable block of code
export function useAddAddress() {
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
  return useProfileMutation((input) => api.post('/profile/addresses', input));
}

// export = other files can import this
// function = a named, reusable block of code
export function useUpdateAddress() {
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // { a, b } = destructuring: take properties a and b out of an object
  // ...rest = collect the remaining items/properties
  // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
  // `text ${x}` = a template string: text with values inserted
  return useProfileMutation(({ id, ...input }) => api.patch(`/profile/addresses/${id}`, input));
}

// export = other files can import this
// function = a named, reusable block of code
export function useSetDefaultAddress() {
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
  // `text ${x}` = a template string: text with values inserted
  return useProfileMutation((id) => api.post(`/profile/addresses/${id}/default`));
}

// export = other files can import this
// function = a named, reusable block of code
export function useDeleteAddress() {
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
  // `text ${x}` = a template string: text with values inserted
  return useProfileMutation((id) => api.delete(`/profile/addresses/${id}`));
}

// Profile photo, in 3 steps:
//  1. ask OUR API for a signed upload permission
//  2. upload the file DIRECTLY to Cloudinary (plain fetch: we must not send our auth token to another site)
//  3. tell our API the resulting URL
// export = other files can import this
// function = a named, reusable block of code
export function useUploadAvatar() {
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  return useProfileMutation(async (file) => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    const { data: signed } = await api.post('/profile/avatar/signature');
    // const = a name for a value that is never reassigned
    // new = create an object from a class (e.g. new Date())
    // FormData = form fields + files to send in one request (used for uploads)
    const form = new FormData();
    // const = a name for a value that is never reassigned
    // [a, b] = destructuring: take the first and second items of an array
    // Object.entries = [key, value] pairs of an object
    for (const [key, value] of Object.entries(signed.fields)) form.append(key, String(value));
    form.append('file', file);
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // fetch = the browser's built-in way to send an HTTP request
    const res = await fetch(signed.uploadUrl, { method: 'POST', body: form });
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const uploaded = await res.json();
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // a || b = OR: a if it is truthy, else b
    // throw = stop here with an error
    // new = create an object from a class (e.g. new Date())
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    // i18n = the translation library instance (current language, changeLanguage)
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    if (!res.ok || !uploaded.secure_url) throw new Error(uploaded.error?.message ?? i18n.t('account.uploadFailed'));
    // return = give this value back and stop the function here
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    return api.put('/profile/avatar', { url: uploaded.secure_url });
  });
}

// export = other files can import this
// function = a named, reusable block of code
export function useRemoveAvatar() {
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
  return useProfileMutation(() => api.delete('/profile/avatar'));
}
