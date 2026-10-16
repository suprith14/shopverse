import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import type { ApiErrorBody } from '@/types/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// 12999 (cents) -> "$129.99"
export const formatPrice = (cents: number) => currency.format(cents / 100);

// Price inputs are typed in dollars, the API speaks cents: "129.99" <-> 12999.
export const toCents = (dollars: string) => Math.round(Number(dollars) * 100);
export const toDollars = (cents: number) => (cents / 100).toFixed(2);

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// "cmvaj3k50000jgqj4rhxb9nej" -> "#RHXB9NEJ" (the short number customers see)
export const orderNumber = (id: string) => `#${id.slice(-8).toUpperCase()}`;

// RTK Query errors come in two shapes: an HTTP error from the backend (with our
// { error: { message } } body), or a network/JS error. Turn either into readable text.
export function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return 'Something went wrong';
  if ('status' in error) {
    if (error.status === 'FETCH_ERROR') return 'Cannot reach the server. Is the backend running?';
    const body = error.data as ApiErrorBody | undefined;
    if (body?.error?.details?.length) return body.error.details.map((d) => `${d.field}: ${d.message}`).join(', ');
    if (body?.error?.message) return body.error.message;
    return `Request failed (${error.status})`;
  }
  return error.message ?? 'Something went wrong';
}
