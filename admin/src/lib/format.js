import { isServerError } from './server-error';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// 12999 (cents) -> "$129.99"
export const formatPrice = (cents) => currency.format(cents / 100);

// Price inputs are typed in dollars, the API speaks cents: "129.99" <-> 12999.
export const toCents = (dollars) => Math.round(Number(dollars) * 100);
export const toDollars = (cents) => (cents / 100).toFixed(2);

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// "just now", "12 min ago", "3 h ago", "2 days ago", then the date
export function formatTimeAgo(iso) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

// "cmvaj3k50000jgqj4rhxb9nej" -> "#RHXB9NEJ" (the short number customers see)
export const orderNumber = (id) => `#${id.slice(-8).toUpperCase()}`;

// RTK Query errors come in two shapes: an HTTP error from the backend (with our
// { error: { message } } body), or a network/JS error. Turn either into readable text.
// Server failures (5xx) return null: the server-error popup explains those instead.
export function getErrorMessage(error) {
  if (!error) return 'Something went wrong';
  if (isServerError(error)) return null;
  if ('status' in error) {
    if (error.status === 'FETCH_ERROR') return 'Cannot reach the server. Is the backend running?';
    const body = error.data;
    if (body?.error?.details?.length) return body.error.details.map((d) => `${d.field}: ${d.message}`).join(', ');
    if (body?.error?.message) return body.error.message;
    return `Request failed (${error.status})`;
  }
  return error.message ?? 'Something went wrong';
}
