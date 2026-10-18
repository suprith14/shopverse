import { create } from 'zustand';
import { isAxiosError } from 'axios';

// "The server broke" (HTTP 5xx) is shown ONCE, as a popup with a retry button
// (components/layout/ServerErrorDialog.jsx), instead of an "Internal server error" box on every
// widget that failed. The API client reports it; the inline error box and the error toast stay
// quiet for these errors, so the customer sees one clear message instead of several.

export const useServerError = create(() => ({ open: false }));

export const reportServerError = () => useServerError.setState({ open: true });
export const dismissServerError = () => useServerError.setState({ open: false });

// 500 Internal Server Error, 502 Bad Gateway, 503 Unavailable, 504 Timeout...
export const isServerError = (error) => isAxiosError(error) && (error.response?.status ?? 0) >= 500;
