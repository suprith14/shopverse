import { useEffect } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { Toaster } from 'sonner';
import { refreshSession } from '@/lib/api-client';
import { Header } from './Header';
import { SlowServerBanner } from './SlowServerBanner';
import { OnboardingDialog } from '@/features/onboarding/OnboardingDialog';
import { site } from '@/content/site';

export function RootLayout() {
  // On first load, try to restore the session from the refresh cookie.
  // Success -> logged in; failure -> guest. Until then, auth status is "loading".
  useEffect(() => {
    void refreshSession();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <SlowServerBanner />
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        {site.footer}
      </footer>
      {/* New page -> start at the top. Back button -> return to where you were. */}
      <ScrollRestoration />
      {/* Toasts appear bottom-centre: easy to reach with a thumb on phones and they don't cover the
           header's cart icon. richColors = green for success, red for errors (plus an icon, never colour alone). */}
      <Toaster position="bottom-center" richColors closeButton duration={4000} />
      {/* The "set up your profile" wizard after sign-up (renders nothing until opened) */}
      <OnboardingDialog />
    </div>
  );
}
