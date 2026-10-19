import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router';
import { Spinner } from '@/components/ui/States';
import { useAuthStore } from './auth.store';

// Route guard: wrap any page that needs a logged-in user (cart, orders, admin...).
// Note: this only improves UX. Real protection is on the backend (requireAuth / requireRole).
export function RequireAuth({ children, role }) {
  const { t } = useTranslation();
  const { status, user } = useAuthStore();
  const location = useLocation();

  // Still asking the server "am I logged in?" (the first refresh): wait, don't redirect yet
  if (status === 'loading') return <Spinner label={t('auth.checkingSession')} />;
  // Not logged in: go to /login and remember where we were, so login can send us back
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  // Logged in but without the needed role: back to the home page
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
