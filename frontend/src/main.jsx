// The app's starting point: Vite loads this file first (index.html has <script src="/src/main.jsx">).
// It creates the React root, plugs in the data cache (TanStack Query) and the router, and removes
// the start-up loader once the first frame is painted.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { reportApiError } from './lib/api-error';
import './i18n'; // load translations before anything renders
import { router } from './router';
import './index.css';

// One cache for all server data (products, cart, orders...). Components ask for data with
// useQuery(); the cache shares one request between components and remembers the answer.
const queryClient = new QueryClient({
  // Any failed request -> the error popup (components/layout/ApiErrorDialog.jsx).
  // onError here runs once per failure, AFTER retries. meta = extra info a query/mutation can
  // carry: meta: { errorPopup: false } = "this screen explains the error itself, no popup".
  queryCache: new QueryCache({ onError: (error, query) => query.meta?.errorPopup !== false && reportApiError(error) }),
  // the same for mutations (the 4th argument is the mutation itself)
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => mutation.meta?.errorPopup !== false && reportApiError(error),
  }),
  defaultOptions: {
    queries: {
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
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);

// The app has rendered: fade out the start-up loader from index.html, then remove it.
// requestAnimationFrame waits for the first frame to be painted, so there's no blank flash.
// iPhone Safari only shows :active (pressed) styles when the page listens for touches. An empty
// passive listener is the standard switch: it does nothing and never blocks scrolling.
document.addEventListener('touchstart', () => {}, { passive: true });

requestAnimationFrame(() => {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.classList.add('splash-hide'); // CSS fades it out over 0.3 s
  splash.addEventListener('transitionend', () => splash.remove(), { once: true });
  setTimeout(() => splash.remove(), 600); // in case the transition doesn't run (e.g. reduced motion)
});
