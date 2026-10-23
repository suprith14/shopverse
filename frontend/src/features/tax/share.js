// Share link: the inputs travel in the URL hash (#s=...), so they never reach any server (the part
// after # is not sent in requests). Only fields that differ from EMPTY_INPUT are kept, as base64url
// JSON. Decoding trusts nothing: unknown keys, wrong types and odd values are dropped.

import { EMPTY_INPUT } from './taxEngine.js';

const CHOICES = {
  age: ['below60', 'senior', 'superSenior'],
  companyCar: ['none', 'small', 'large'],
  disabilitySelf: ['none', 'disabled', 'severe'],
  disabilityDependant: ['none', 'disabled', 'severe'],
};

const toBase64Url = (text) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(text)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const fromBase64Url = (text) =>
  new TextDecoder().decode(Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));

export function encodeInput(input) {
  const changed = Object.fromEntries(
    Object.entries(input).filter(([key, value]) => key in EMPTY_INPUT && value !== EMPTY_INPUT[key]),
  );
  return toBase64Url(JSON.stringify(changed));
}

// Returns a full input, or null when the text is not a valid share code
export function decodeInput(code) {
  try {
    const data = JSON.parse(fromBase64Url(code));
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const clean = {};
    for (const [key, value] of Object.entries(data)) {
      if (!(key in EMPTY_INPUT) || typeof value !== typeof EMPTY_INPUT[key]) continue;
      if (typeof value === 'number' && !(Number.isFinite(value) && value >= 0 && value < 1e11)) continue;
      if (typeof value === 'string' && !CHOICES[key]?.includes(value)) continue;
      clean[key] = value;
    }
    return { ...EMPTY_INPUT, ...clean };
  } catch {
    return null;
  }
}
