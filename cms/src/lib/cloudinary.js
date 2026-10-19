import { createHash, randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { HttpError } from './http-error.js';

// Cloudinary stores and serves the banner images. Same approach as the shop API's profile photos
// (backend/src/lib/cloudinary.js): the BROWSER uploads straight to Cloudinary with a signature
// from us, so files never pass through this server and nobody can upload without our permission.

export const BANNER_FOLDER = 'shopverse/banners';

function config() {
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = env;
  if (!cloudName || !apiKey || !apiSecret) throw new HttpError(503, 'Image uploads are not configured');
  return { cloudName, apiKey, apiSecret };
}

// Cloudinary's signing rule: sort the parameters by name, join as "a=1&b=2", append the API
// secret, SHA-1 it. If the browser changes anything (folder, size, formats), the upload is rejected.
function sign(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1')
    .update(toSign + apiSecret)
    .digest('hex');
}

// Permission for ONE banner upload: a fresh random id in the banners folder, at most 2400x1200
// (big enough for wide screens, and a 10 MB phone photo is stored as a few hundred KB),
// photos only (no SVG: it can contain scripts).
export function signBannerUpload() {
  const { cloudName, apiKey, apiSecret } = config();
  const params = {
    public_id: `${BANNER_FOLDER}/${randomUUID()}`,
    transformation: 'c_limit,w_2400,h_1200,q_auto',
    allowed_formats: 'jpg,jpeg,png,webp',
    timestamp: Math.floor(Date.now() / 1000), // signatures expire after about an hour
  };
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    fields: { ...params, api_key: apiKey, signature: sign(params, apiSecret) },
  };
}

// https://res.cloudinary.com/<cloud>/image/upload/v1729000000/shopverse/banners/<id>.jpg
//   -> "shopverse/banners/<id>", or null if it isn't one of OUR banner images.
export function bannerPublicId(url) {
  const prefix = `https://res.cloudinary.com/${config().cloudName}/image/upload/`;
  if (typeof url !== 'string' || !url.startsWith(prefix)) return null;
  const path = url
    .slice(prefix.length)
    .replace(/^v\d+\//, '')
    .replace(/\.[a-z]+$/i, '');
  return path.startsWith(`${BANNER_FOLDER}/`) ? path : null;
}

export async function deleteImage(publicId) {
  const { cloudName, apiKey, apiSecret } = config();
  const params = { public_id: publicId, invalidate: 'true', timestamp: Math.floor(Date.now() / 1000) };
  const body = new URLSearchParams({
    ...params,
    timestamp: String(params.timestamp),
    api_key: apiKey,
    signature: sign(params, apiSecret),
  });
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: 'POST', body });
  if (!res.ok) throw new Error(`Cloudinary delete failed: ${res.status} ${await res.text()}`);
}
