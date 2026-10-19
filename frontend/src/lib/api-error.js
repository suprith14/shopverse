import { create } from 'zustand';
import { isAxiosError } from 'axios';
import { getErrorMessage } from './format';
import i18n from '@/i18n';

// Every failed API request opens ONE popup (components/layout/ApiErrorDialog.jsx) with a message
// that fits what went wrong: no internet, server down, logged out, not allowed, wrong input...
// Reported from two places:
//   main.jsx  -> TanStack Query's global onError: every query and mutation, once, after retries
//   notify.js -> notify.error(): calls made outside TanStack Query (e.g. the invoice download)
// A query can opt out with meta: { errorPopup: false } when its screen already explains the
// error right where the customer is looking (e.g. "This coupon has expired" under the coupon box).

export const useApiError = create(() => ({ error: null, kind: null, message: '' }));

// Which kind of failure this is. The popup picks its icon, title and buttons from it.
export function errorKind(error) {
  if (!isAxiosError(error)) return 'generic';
  if (!error.response) return 'offline'; // no answer at all: no internet, or the server is unreachable
  const status = error.response.status;
  if (status >= 500) return 'server';
  // 401 from /auth/* = wrong email or password (show the message);
  // 401 anywhere else = the login expired and could not be refreshed
  if (status === 401) return error.config?.url?.startsWith('/auth/') ? 'invalid' : 'session';
  if (status === 403) return /suspended/i.test(error.response.data?.error?.message ?? '') ? 'suspended' : 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 429) return 'tooMany';
  return 'invalid'; // 400, 409, 422...: the server says what to fix
}

let lastReported = null;

export function reportApiError(error) {
  // A mutation with onError: notify.error is reported by both places: show it once
  if (error === lastReported) return;
  // Cancelled on purpose (the page was left, a newer search replaced it): not a failure
  if (error?.name === 'CanceledError') return;
  lastReported = error;
  // One popup at a time: a second failure doesn't replace the message being read
  if (useApiError.getState().error) return;
  useApiError.setState({ error, kind: errorKind(error), message: getErrorMessage(error) });
}

export const dismissApiError = () => useApiError.setState({ error: null, kind: null, message: '' });

// The device lost its internet connection. TanStack Query doesn't FAIL requests then: it pauses
// them and carries on by itself when the connection is back. So nothing would report an error and
// the customer would only see loading boxes. Instead: show "No connection" right away, and close
// it by itself once back online (the paused requests then finish normally).
window.addEventListener('offline', () => {
  if (useApiError.getState().error) return;
  useApiError.setState({ error: new Error('offline'), kind: 'noInternet', message: i18n.t('errors.offlineText') });
});
window.addEventListener('online', () => {
  if (useApiError.getState().kind === 'noInternet') dismissApiError();
});

// Used by the inline error box: 5xx errors are explained by the popup only
export const isServerError = (error) => isAxiosError(error) && (error.response?.status ?? 0) >= 500;
