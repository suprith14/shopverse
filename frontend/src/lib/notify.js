// import = bring in code from another file or package
import { toast } from 'sonner';
// import = bring in code from another file or package
import { getErrorMessage } from './format';
// import = bring in code from another file or package
import { isServerError } from './server-error';

// One place for toast notifications, so every page words and styles them the same way.
// Rule: toasts confirm quick actions ("Added to cart"); form validation errors stay inline,
// next to the field to fix (a toast would disappear before you fixed it).
// export = other files can import this
// const = a name for a value that is never reassigned
export const notify = {
  // => = an arrow function (a short function)
  success: (message, action) => toast.success(message, { action }),
  // Server failures (5xx) open the server-error popup instead, so no toast for those.
  // => = an arrow function (a short function)
  // ! = NOT: flips true/false
  // a && b = AND; in JSX: show b only when a is true
  error: (error) => !isServerError(error) && toast.error(getErrorMessage(error)),
};
