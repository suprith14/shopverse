import { toast } from 'sonner';
import { getErrorMessage } from './format';

// One place for toast notifications, so every page words and styles them the same way.
// Rule: toasts confirm quick actions ("Added to cart"); form validation errors stay inline,
// next to the field to fix (a toast would disappear before you fixed it).
export const notify = {
  success: (message, action) => toast.success(message, { action }),
  error: (error) => toast.error(getErrorMessage(error)),
};
