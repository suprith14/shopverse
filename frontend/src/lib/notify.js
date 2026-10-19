// import = bring in code from another file or package
import { toast } from 'sonner';
// import = bring in code from another file or package
import { reportApiError } from './api-error';

// One place for toast notifications, so every page words and styles them the same way.
// Rule: toasts confirm quick actions ("Added to cart"); failures open the error popup
// (lib/api-error.js), which stays until it's read instead of disappearing like a toast.
// export = other files can import this
// const = a name for a value that is never reassigned
export const notify = {
  // => = an arrow function (a short function)
  success: (message, action) => toast.success(message, { action }),
  // Any failure: the error popup with a fitting message (shown once, even if TanStack Query
  // reports the same error too)
  // => = an arrow function (a short function)
  // reportApiError = open the error popup for this error (lib/api-error.js)
  error: (error) => reportApiError(error),
};
