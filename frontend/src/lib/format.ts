import { isAxiosError } from 'axios';
import type { ApiErrorBody } from '@/types/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// 12999 (cents) -> "$129.99"
export const formatPrice = (cents: number) => currency.format(cents / 100);

// Turns any thrown error into a message we can show the user.
export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data?.error;
    if (body?.details?.length) return body.details.map((d) => d.message).join(', ');
    if (body?.message) return body.message;
    if (!error.response) return 'Cannot reach the server. Is the backend running?';
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}
