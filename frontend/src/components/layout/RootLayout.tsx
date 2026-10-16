import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { refreshSession } from '@/lib/api-client';
import { Header } from './Header';

export function RootLayout() {
  // On first load, try to restore the session from the refresh cookie.
  // Success -> logged in; failure -> guest. Until then, auth status is "loading".
  useEffect(() => {
    void refreshSession();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        ShopVerse, a portfolio project. Payments run in Stripe test mode.
      </footer>
    </div>
  );
}
