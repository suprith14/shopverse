import { useEffect } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { Toaster } from 'sonner';
import { refreshSession } from '@/lib/api-client';
import { Header } from './Header';
import { SlowServerBanner } from './SlowServerBanner';
import { ApiErrorDialog } from './ApiErrorDialog';
import { OnboardingDialog } from '@/features/onboarding/OnboardingDialog';
import { useSiteContent } from '@/content/use-site-content';
import { useTheme } from '@/lib/theme';

// The frame around every page: banner, header, the current page (<Outlet />), footer, plus the
// popups that can appear anywhere (toasts, onboarding wizard, API error dialog).
// router.jsx uses it as the parent of every route.
export function RootLayout() {
  // footer text from the CMS (in the reader's language)
  const { footer } = useSiteContent();
  // 'light' or 'dark' right now, passed to the toasts so they match
  const theme = useTheme((s) => s.resolved);
  // On first load, try to restore the session from the refresh cookie.
  // Success -> logged in; failure -> guest. Until then, auth status is "loading".
  useEffect(() => {
    void refreshSession();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Only visible while a request takes over 4 seconds (free server waking up) */}
      <SlowServerBanner />
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {/* The page matching the URL renders here (HomePage, CartPage, ...) */}
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-surface py-6 text-center text-sm text-slate-500">
        {footer.text}
      </footer>
      {/* New page -> start at the top. Back button -> return to where you were. */}
      <ScrollRestoration />
      {/* Toasts appear bottom-centre: easy to reach with a thumb on phones and they don't cover the
           header's cart icon. richColors = green for success, red for errors (plus an icon, never colour alone). */}
      <Toaster position="bottom-center" richColors closeButton duration={4000} theme={theme} />
      {/* The "set up your profile" wizard after sign-up (renders nothing until opened) */}
      <OnboardingDialog />
      {/* The popup for every failed API request, with a message that fits the error */}
      <ApiErrorDialog />
    </div>
  );
}
