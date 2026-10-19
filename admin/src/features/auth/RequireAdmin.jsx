// import = bring in code from another file or package
// Navigate = redirect to another URL as soon as it is drawn
// useLocation = the current URL (pathname, search) and any state passed to it
import { Navigate, useLocation } from 'react-router';
// import = bring in code from another file or package
import { Spinner } from '@/components/ui/States';
// import = bring in code from another file or package
// useAppSelector = our useSelector (app/hooks.js)
import { useAppSelector } from '@/app/hooks';

// Route guard for every admin page. It only decides what to SHOW: the real protection is
// the backend's requireRole('ADMIN') on /api/admin. Even if someone bypassed this in their
// browser, every API call would answer 403.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// children = whatever is written between this component's opening and closing tags
export function RequireAdmin({ children }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // useAppSelector = our useSelector (app/hooks.js)
  // => = an arrow function (a short function)
  const { status, user } = useAppSelector((s) => s.auth);
  // const = a name for a value that is never reassigned
  // useLocation = the current URL (pathname, search) and any state passed to it
  const location = useLocation();

  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  if (status === 'loading') return <Spinner label="Checking session..." />;
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // a || b = OR: a if it is truthy, else b
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // !== = not strictly equal
  if (status === 'guest' || user?.role !== 'ADMIN') {
    // return = give this value back and stop the function here
    // Navigate = redirect to another URL as soon as it is drawn
    // { } in JSX = run JavaScript here and show its result
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  // return = give this value back and stop the function here
  // <> </> = a fragment: groups elements without adding an extra HTML element
  // { } in JSX = run JavaScript here and show its result
  // children = whatever is written between this component's opening and closing tags
  return <>{children}</>;
}
