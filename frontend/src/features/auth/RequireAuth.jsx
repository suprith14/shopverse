// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// Navigate = redirect to another URL as soon as it is drawn
// useLocation = the current URL (pathname, search) and any state passed to it
import { Navigate, useLocation } from 'react-router';
// import = bring in code from another file or package
import { Spinner } from '@/components/ui/States';
// import = bring in code from another file or package
import { useAuthStore } from './auth.store';

// Route guard: wrap any page that needs a logged-in user (cart, orders, admin...).
// Note: this only improves UX. Real protection is on the backend (requireAuth / requireRole).
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// children = whatever is written between this component's opening and closing tags
export function RequireAuth({ children, role }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { status, user } = useAuthStore();
  // const = a name for a value that is never reassigned
  // useLocation = the current URL (pathname, search) and any state passed to it
  const location = useLocation();

  // Still asking the server "am I logged in?" (the first refresh): wait, don't redirect yet
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  if (status === 'loading') return <Spinner label={t('auth.checkingSession')} />;
  // Not logged in: go to /login and remember where we were, so login can send us back
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  // Navigate = redirect to another URL as soon as it is drawn
  // { } in JSX = run JavaScript here and show its result
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  // Logged in but without the needed role: back to the home page
  // if (...) = run the next part only when the condition is true
  // a && b = AND; in JSX: show b only when a is true
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // !== = not strictly equal
  // return = give this value back and stop the function here
  // Navigate = redirect to another URL as soon as it is drawn
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  // return = give this value back and stop the function here
  // <> </> = a fragment: groups elements without adding an extra HTML element
  // { } in JSX = run JavaScript here and show its result
  // children = whatever is written between this component's opening and closing tags
  return <>{children}</>;
}
