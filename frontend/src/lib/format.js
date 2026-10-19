import { isAxiosError } from 'axios';
import i18n, { currentLocale } from '@/i18n';

// Prices stay in US-style dollars in every language ("$129.99"): the store charges in USD, and
// the same digits and symbol everywhere avoid any doubt about the amount.
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// 12999 (cents) -> "$129.99"
export const formatPrice = (cents) => currency.format(cents / 100);

// Dates follow the reader's language: "19 Oct 2026" / "19 ಅಕ್ಟೋ 2026".
export const formatDate = (iso, options = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(iso).toLocaleDateString(currentLocale(), options);

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(currentLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Turns any thrown error into a message we can show the user.
// Messages written by the API (e.g. "Only 2 left in stock") arrive in English.
export function getErrorMessage(error) {
  if (isAxiosError(error)) {
    const body = error.response?.data?.error;
    if (body?.details?.length) return body.details.map((d) => d.message).join(', ');
    if (body?.message) return body.message;
    if (!error.response) return i18n.t('errors.cannotReach');
  }
  return error instanceof Error ? error.message : i18n.t('errors.generic');
}
