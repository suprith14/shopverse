import { createHash } from 'node:crypto';
import { env } from '../config/env.js';
import { HttpError } from './http-error.js';

// Cloudinary stores and serves images. We only need two things from it, so instead of the
// full SDK we use its HTTP API directly with Node's built-in crypto:
//   1. sign an upload, so the BROWSER can upload straight to Cloudinary (our server never
//      handles the file, and nobody can upload without our permission)
//   2. delete an image

function config() {
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = env;
  if (!cloudName || !apiKey || !apiSecret) throw new HttpError(503, 'Photo uploads are not configured');
  return { cloudName, apiKey, apiSecret };
}

// Cloudinary's signing rule: sort the parameters by name, join as "a=1&b=2", append the
// API secret, SHA-1 it. Cloudinary does the same on its side; if anything was changed
// (folder, size, formats...), the signatures don't match and the upload is rejected.
function sign(params: Record<string, string | number>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(toSign + apiSecret).digest('hex');
}

export function signImageUpload(options: { publicId: string; transformation: string; allowedFormats: string }) {
  const { cloudName, apiKey, apiSecret } = config();
  const params = {
    public_id: options.publicId,
    overwrite: 'true', // a new upload replaces the old image at the same id
    invalidate: 'true', // and clears Cloudinary's CDN cache so the new one shows right away
    transformation: options.transformation, // applied BEFORE storing (a 5 MB photo is stored as a small one)
    allowed_formats: options.allowedFormats,
    timestamp: Math.floor(Date.now() / 1000), // signatures expire after about an hour
  };
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    // Everything the browser must send along with the file, unchanged:
    fields: { ...params, api_key: apiKey, signature: sign(params, apiSecret) },
  };
}

export async function deleteImage(publicId: string) {
  const { cloudName, apiKey, apiSecret } = config();
  const params = { public_id: publicId, invalidate: 'true', timestamp: Math.floor(Date.now() / 1000) };
  const body = new URLSearchParams({ ...params, timestamp: String(params.timestamp), api_key: apiKey, signature: sign(params, apiSecret) });
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: 'POST', body });
  if (!res.ok) throw new Error(`Cloudinary delete failed: ${res.status} ${await res.text()}`);
}

// The start of every image URL in OUR Cloudinary account, e.g.
// https://res.cloudinary.com/<cloud>/image/upload/v1729000000/shopverse/avatars/<userId>.jpg
export function imageUrlPrefix() {
  return `https://res.cloudinary.com/${config().cloudName}/image/upload/`;
}
