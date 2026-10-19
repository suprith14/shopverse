// import = bring in code from another file or package
// api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
import { api } from './api-client';

// Downloads a file from our API and saves it.
// A plain <a href="/api/..."> can't send our Authorization header, and putting the token in
// the URL would leak it into browser history and server logs. So: fetch it with the token,
// turn the response into a temporary local URL, "click" a hidden link to save it, clean up.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function downloadFile(url, fallbackName) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  const res = await api.get(url, { responseType: 'blob' }).catch(async (err) => {
    // With responseType 'blob' even an error body arrives as a Blob: read the backend's
    // { error: { message } } back out of it so the user sees the real reason.
    // const = a name for a value that is never reassigned
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    const body = err?.response?.data;
    // if (...) = run the next part only when the condition is true
    if (body instanceof Blob) {
      // const = a name for a value that is never reassigned
      // await = wait for a Promise (async result) before continuing
      const message = await body
        .text()
        // => = an arrow function (a short function)
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
        // JSON.parse / JSON.stringify = text <-> object
        .then((t) => JSON.parse(t)?.error?.message)
        // => = an arrow function (a short function)
        .catch(() => null);
      // if (...) = run the next part only when the condition is true
      // throw = stop here with an error
      // new = create an object from a class (e.g. new Date())
      if (message) throw new Error(message);
    }
    // throw = stop here with an error
    throw err;
  });
  // Use the server's file name ("INV-2026-00042.pdf") when it sends one.
  // const = a name for a value that is never reassigned
  // obj[key] = read the property whose name is stored in key
  // a ?? b = a, unless a is null/undefined, then b
  const match = /filename="([^"]+)"/.exec(String(res.headers['content-disposition'] ?? ''));
  // const = a name for a value that is never reassigned
  // URL.createObjectURL = a temporary URL for a file/blob in memory
  const objectUrl = URL.createObjectURL(res.data);
  // const = a name for a value that is never reassigned
  // document = the current web page (its HTML elements)
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // a ?? b = a, unless a is null/undefined, then b
  const link = Object.assign(document.createElement('a'), { href: objectUrl, download: match?.[1] ?? fallbackName });
  // document = the current web page (its HTML elements)
  document.body.appendChild(link);
  link.click();
  link.remove();
  // URL.revokeObjectURL = free the memory of a temporary URL
  URL.revokeObjectURL(objectUrl); // free the memory
}
