// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
import { useEffect } from 'react';
// import = bring in code from another file or package
// Outlet = where the child route's page appears inside a layout
// ScrollRestoration = new page -> top; Back button -> previous scroll position
import { Outlet, ScrollRestoration } from 'react-router';
// import = bring in code from another file or package
import { Toaster } from 'sonner';
// import = bring in code from another file or package
import { refreshSession } from '@/lib/api-client';
// import = bring in code from another file or package
import { Header } from './Header';
// import = bring in code from another file or package
import { SlowServerBanner } from './SlowServerBanner';
// import = bring in code from another file or package
import { ApiErrorDialog } from './ApiErrorDialog';
// import = bring in code from another file or package
import { OnboardingDialog } from '@/features/onboarding/OnboardingDialog';
// import = bring in code from another file or package
import { useSiteContent } from '@/content/use-site-content';
// import = bring in code from another file or package
import { useTheme } from '@/lib/theme';

// The frame around every page: banner, header, the current page (<Outlet />), footer, plus the
// popups that can appear anywhere (toasts, onboarding wizard, API error dialog).
// router.jsx uses it as the parent of every route.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function RootLayout() {
  // footer text from the CMS (in the reader's language)
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { footer } = useSiteContent();
  // 'light' or 'dark' right now, passed to the toasts so they match
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const theme = useTheme((s) => s.resolved);
  // On first load, try to restore the session from the refresh cookie.
  // Success -> logged in; failure -> guest. Until then, auth status is "loading".
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    void refreshSession();
  }, []);

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="flex min-h-screen flex-col">
      {/* Only visible while a request takes over 4 seconds (free server waking up) */}
      <SlowServerBanner />
      <Header />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {/* The page matching the URL renders here (HomePage, CartPage, ...) */}
        {/* Outlet = where the child route's page appears inside a layout */}
        <Outlet />
      </main>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <footer className="border-t border-slate-200 bg-surface py-6 text-center text-sm text-slate-500">
        {/* { } in JSX = run JavaScript here and show its result */}
        {footer.text}
      </footer>
      {/* New page -> start at the top. Back button -> return to where you were. */}
      {/* ScrollRestoration = new page -> top; Back button -> previous scroll position */}
      <ScrollRestoration />
      {/* Toasts appear bottom-centre: easy to reach with a thumb on phones and they don't cover the
           header's cart icon. richColors = green for success, red for errors (plus an icon, never colour alone). */}
      {/* { } in JSX = run JavaScript here and show its result */}
      <Toaster position="bottom-center" richColors closeButton duration={4000} theme={theme} />
      {/* The "set up your profile" wizard after sign-up (renders nothing until opened) */}
      <OnboardingDialog />
      {/* The popup for every failed API request, with a message that fits the error */}
      <ApiErrorDialog />
    </div>
  );
}
