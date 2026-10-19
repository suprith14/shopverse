import { toast } from 'sonner';
import { reportApiError } from './api-error';

// One place for toast notifications, so every page words and styles them the same way.
// Rule: toasts confirm quick actions ("Added to cart"); failures open the error popup
// (lib/api-error.js), which stays until it's read instead of disappearing like a toast.
export const notify = {
  success: (message, action) => toast.success(message, { action }),
  // Any failure: the error popup with a fitting message (shown once, even if TanStack Query
  // reports the same error too)
  error: (error) => reportApiError(error),
};
