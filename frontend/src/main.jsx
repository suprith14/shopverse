import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './i18n'; // load translations before anything renders
import { router } from './router';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // treat data as fresh for 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);

// The app has rendered: fade out the start-up loader from index.html, then remove it.
// requestAnimationFrame waits for the first frame to be painted, so there's no blank flash.
requestAnimationFrame(() => {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.classList.add('splash-hide'); // CSS fades it out over 0.3 s
  splash.addEventListener('transitionend', () => splash.remove(), { once: true });
  setTimeout(() => splash.remove(), 600); // in case the transition doesn't run (e.g. reduced motion)
});
