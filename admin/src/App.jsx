import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { useRestoreSessionMutation } from '@/features/auth/authApi';
import { router } from '@/router';
import { ServerErrorDialog } from '@/components/layout/ServerErrorDialog';

// On first load, try to restore the admin session from the refresh cookie.
// Until it answers, auth status is "loading" and pages show "Checking session...".
export function App() {
  const [restoreSession] = useRestoreSessionMutation();
  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);
  return (
    <>
      <RouterProvider router={router} />
      {/* "Something went wrong, retry" popup for server errors (5xx), on every page incl. login */}
      <ServerErrorDialog />
    </>
  );
}
