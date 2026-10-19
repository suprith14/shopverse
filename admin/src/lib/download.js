// import = bring in code from another file or package
import { baseQueryWithReauth } from '@/app/api';
// import = bring in code from another file or package
import { store } from '@/app/store';

// Downloads a file from our API and saves it (e.g. an invoice PDF).
// It goes through the SAME base query as every RTK Query call, so the token is attached and an
// expired one is refreshed automatically. A plain <a href> couldn't send the Authorization header.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function downloadFile(url, filename) {
  // const = a name for a value that is never reassigned
  const api = {
    // dispatch = send an action to the store (the only way to change Redux state)
    dispatch: store.dispatch,
    // getState = read the whole Redux state right now
    getState: store.getState,
    // new = create an object from a class (e.g. new Date())
    signal: new AbortController().signal,
    // => = an arrow function (a short function)
    abort: () => undefined,
    extra: undefined,
    endpoint: 'download',
    type: 'query',
  };
  // responseHandler: read the body as a file (Blob) instead of JSON.
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  const result = await baseQueryWithReauth(
    // => = an arrow function (a short function)
    // a ? b : c = ternary: if a then b else c
    { url, responseHandler: (res) => (res.ok ? res.blob() : res.json()) },
    api,
    {},
  );
  // if (...) = run the next part only when the condition is true
  if (result.error) {
    // const = a name for a value that is never reassigned
    const body = result.error.data;
    // throw = stop here with an error
    // new = create an object from a class (e.g. new Date())
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    throw new Error(body?.error?.message ?? 'Download failed');
  }
  // const = a name for a value that is never reassigned
  // URL.createObjectURL = a temporary URL for a file/blob in memory
  const objectUrl = URL.createObjectURL(result.data);
  // const = a name for a value that is never reassigned
  // document = the current web page (its HTML elements)
  const link = Object.assign(document.createElement('a'), { href: objectUrl, download: filename });
  // document = the current web page (its HTML elements)
  document.body.appendChild(link);
  link.click();
  link.remove();
  // URL.revokeObjectURL = free the memory of a temporary URL
  URL.revokeObjectURL(objectUrl);
}
