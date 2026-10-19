// The app's starting point: Vite loads this file first (index.html has <script src="/src/main.jsx">).
// It creates the React root, plugs in the data cache (TanStack Query) and the router, and removes
// the start-up loader once the first frame is painted.

// import = bring in code from another file or package
// StrictMode = extra checks while developing (runs some code twice to catch bugs); no effect in production
import { StrictMode } from 'react';
// import = bring in code from another file or package
// createRoot = start React inside an existing HTML element
import { createRoot } from 'react-dom/client';
// import = bring in code from another file or package
// RouterProvider = shows the page that matches the current URL
import { RouterProvider } from 'react-router';
// import = bring in code from another file or package
// QueryClient = the cache that stores every server answer by its key
// QueryClientProvider = makes the cache available to every component
// QueryCache / MutationCache = the lists of all queries / mutations; their onError runs for EVERY one
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import = bring in code from another file or package
// reportApiError = open the error popup for this error (lib/api-error.js)
import { reportApiError } from './lib/api-error';
// import = bring in code from another file or package
import './i18n'; // load translations before anything renders
// import = bring in code from another file or package
import { router } from './router';
// import = bring in code from another file or package
import './index.css';

// One cache for all server data (products, cart, orders...). Components ask for data with
// useQuery(); the cache shares one request between components and remembers the answer.
// const = a name for a value that is never reassigned
// new = create an object from a class (e.g. new Date())
// QueryClient = the cache that stores every server answer by its key
const queryClient = new QueryClient({
  // Any failed request -> the error popup (components/layout/ApiErrorDialog.jsx).
  // onError here runs once per failure, AFTER retries. meta = extra info a query/mutation can
  // carry: meta: { errorPopup: false } = "this screen explains the error itself, no popup".
  // new = create an object from a class (e.g. new Date())
  // => = an arrow function (a short function)
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // !== = not strictly equal
  // a && b = AND; in JSX: show b only when a is true
  queryCache: new QueryCache({ onError: (error, query) => query.meta?.errorPopup !== false && reportApiError(error) }),
  // the same for mutations (the 4th argument is the mutation itself)
  // new = create an object from a class (e.g. new Date())
  // => = an arrow function (a short function)
  mutationCache: new MutationCache({
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // !== = not strictly equal
    // a && b = AND; in JSX: show b only when a is true
    onError: (error, _variables, _context, mutation) => mutation.meta?.errorPopup !== false && reportApiError(error),
  }),
  defaultOptions: {
    queries: {
      // staleTime = how long cached data counts as fresh (no refetch during that time)
      staleTime: 60 * 1000, // treat data as fresh for 1 minute
      // a failed request is tried once more before showing an error
      retry: 1,
      // don't reload everything each time the tab is focused
      refetchOnWindowFocus: false,
    },
  },
});

// Mount React into <div id="root">. StrictMode runs extra checks while developing (only in dev).
// QueryClientProvider makes the cache available everywhere; RouterProvider shows the page for the URL.
// createRoot = start React inside an existing HTML element
// document = the current web page (its HTML elements)
createRoot(document.getElementById('root')).render(
  // StrictMode = extra checks while developing (runs some code twice to catch bugs); no effect in production
  <StrictMode>
    {/* QueryClientProvider = makes the cache available to every component
       { } in JSX = run JavaScript here and show its result */}
    <QueryClientProvider client={queryClient}>
      {/* RouterProvider = shows the page that matches the current URL
         { } in JSX = run JavaScript here and show its result */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);

// The app has rendered: fade out the start-up loader from index.html, then remove it.
// requestAnimationFrame waits for the first frame to be painted, so there's no blank flash.
// requestAnimationFrame = run code right before the next screen paint
// => = an arrow function (a short function)
requestAnimationFrame(() => {
  // const = a name for a value that is never reassigned
  // document = the current web page (its HTML elements)
  const splash = document.getElementById('splash');
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  if (!splash) return;
  splash.classList.add('splash-hide'); // CSS fades it out over 0.3 s
  // addEventListener = run a function when an event happens
  // => = an arrow function (a short function)
  splash.addEventListener('transitionend', () => splash.remove(), { once: true });
  // setTimeout = run a function once after a delay (ms)
  // => = an arrow function (a short function)
  setTimeout(() => splash.remove(), 600); // in case the transition doesn't run (e.g. reduced motion)
});
