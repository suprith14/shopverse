import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Spinner } from '@/components/ui/States';
import { useAppSelector } from '@/app/hooks';

// Route guard for every admin page. It only decides what to SHOW: the real protection is
// the backend's requireRole('ADMIN') on /api/admin. Even if someone bypassed this in their
// browser, every API call would answer 403.
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, user } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (status === 'loading') return <Spinner label="Checking session..." />;
  if (status === 'guest' || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
