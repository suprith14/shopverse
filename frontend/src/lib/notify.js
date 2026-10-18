import { toast } from 'sonner';
import { getErrorMessage } from './format';
import { isServerError } from './server-error';

// One place for toast notifications, so every page words and styles them the same way.
// Rule: toasts confirm quick actions ("Added to cart"); form validation errors stay inline,
// next to the field to fix (a toast would disappear before you fixed it).
export const notify = {
  success: (message, action) => toast.success(message, { action }),
  // Server failures (5xx) open the server-error popup instead, so no toast for those.
  error: (error) => !isServerError(error) && toast.error(getErrorMessage(error)),
};
