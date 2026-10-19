// import = bring in code from another file or package
// createHash = make a one-way fingerprint (hash) of data, e.g. SHA-256
import { createHash } from 'node:crypto';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from '../config/env.js';
// import = bring in code from another file or package
// HttpError = an error with an HTTP status; the error handler sends it as JSON
import { HttpError } from './http-error.js';

// Cloudinary stores and serves images. We only need two things from it, so instead of the
// full SDK we use its HTTP API directly with Node's built-in crypto:
//   1. sign an upload, so the BROWSER can upload straight to Cloudinary (our server never
//      handles the file, and nobody can upload without our permission)
//   2. delete an image

// function = a named, reusable block of code
function config() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // env = the checked settings from .env (config/env.js)
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = env;
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // a || b = OR: a if it is truthy, else b
  // throw = stop here with an error
  // new = create an object from a class (e.g. new Date())
  // HttpError = an error with an HTTP status; the error handler sends it as JSON
  if (!cloudName || !apiKey || !apiSecret) throw new HttpError(503, 'Photo uploads are not configured');
  // return = give this value back and stop the function here
  return { cloudName, apiKey, apiSecret };
}

// Cloudinary's signing rule: sort the parameters by name, join as "a=1&b=2", append the
// API secret, SHA-1 it. Cloudinary does the same on its side; if anything was changed
// (folder, size, formats...), the signatures don't match and the upload is rejected.
// function = a named, reusable block of code
function sign(params, apiSecret) {
  // const = a name for a value that is never reassigned
  // Object.keys = the property names of an object
  const toSign = Object.keys(params)
    // .sort = put the items in order (changes the array)
    .sort()
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    // `text ${x}` = a template string: text with values inserted
    // obj[key] = read the property whose name is stored in key
    .map((key) => `${key}=${params[key]}`)
    // .join = turn an array into one string with a separator
    .join('&');
  // return = give this value back and stop the function here
  // createHash = make a one-way fingerprint (hash) of data, e.g. SHA-256
  return createHash('sha1')
    .update(toSign + apiSecret)
    .digest('hex');
}

// export = other files can import this
// function = a named, reusable block of code
export function signImageUpload(options) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { cloudName, apiKey, apiSecret } = config();
  // const = a name for a value that is never reassigned
  const params = {
    public_id: options.publicId,
    overwrite: 'true', // a new upload replaces the old image at the same id
    invalidate: 'true', // and clears Cloudinary's CDN cache so the new one shows right away
    transformation: options.transformation, // applied BEFORE storing (a 5 MB photo is stored as a small one)
    allowed_formats: options.allowedFormats,
    // Math = number helpers (min, max, round, floor, ceil...)
    // Date = a point in time (Date.now() = milliseconds since 1970)
    timestamp: Math.floor(Date.now() / 1000), // signatures expire after about an hour
  };
  // return = give this value back and stop the function here
  return {
    // `text ${x}` = a template string: text with values inserted
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    // Everything the browser must send along with the file, unchanged:
    // ...x = spread: copy all items/properties of x into here
    fields: { ...params, api_key: apiKey, signature: sign(params, apiSecret) },
  };
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function deleteImage(publicId) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { cloudName, apiKey, apiSecret } = config();
  // const = a name for a value that is never reassigned
  // Math = number helpers (min, max, round, floor, ceil...)
  // Date = a point in time (Date.now() = milliseconds since 1970)
  const params = { public_id: publicId, invalidate: 'true', timestamp: Math.floor(Date.now() / 1000) };
  // const = a name for a value that is never reassigned
  // new = create an object from a class (e.g. new Date())
  const body = new URLSearchParams({
    // ...x = spread: copy all items/properties of x into here
    ...params,
    timestamp: String(params.timestamp),
    api_key: apiKey,
    signature: sign(params, apiSecret),
  });
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // fetch = send an HTTP request (built into Node 18+)
  // `text ${x}` = a template string: text with values inserted
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: 'POST', body });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // new = create an object from a class (e.g. new Date())
  // Error = an error object with a message (and a stack trace)
  // `text ${x}` = a template string: text with values inserted
  // res.status(code) = set the HTTP status code (201 created, 404...)
  // await = wait for a Promise (async result) before continuing
  if (!res.ok) throw new Error(`Cloudinary delete failed: ${res.status} ${await res.text()}`);
}

// The start of every image URL in OUR Cloudinary account, e.g.
// https://res.cloudinary.com/<cloud>/image/upload/v1729000000/shopverse/avatars/<userId>.jpg
// export = other files can import this
// function = a named, reusable block of code
export function imageUrlPrefix() {
  // return = give this value back and stop the function here
  // `text ${x}` = a template string: text with values inserted
  return `https://res.cloudinary.com/${config().cloudName}/image/upload/`;
}
