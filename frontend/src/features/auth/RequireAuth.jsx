import { Navigate, useLocation } from 'react-router';
import { Spinner } from '@/components/ui/States';
import { useAuthStore } from './auth.store';

// Route guard: wrap any page that needs a logged-in user (cart, orders, admin...).
// Note: this only improves UX. Real protection is on the backend (requireAuth / requireRole).
export function RequireAuth({ children, role }) {
  const { status, user } = useAuthStore();
  const location = useLocation();

  if (status === 'loading') return <Spinner label="Checking session..." />;
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
