import { createBrowserRouter } from 'react-router';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ComingSoon } from '@/components/layout/ComingSoon';
import { NotFound } from '@/components/layout/NotFound';
import { LoginPage } from '@/features/auth/LoginPage';
import { RequireAdmin } from '@/features/auth/RequireAdmin';

// Every page except /login is inside RequireAdmin + the admin layout.
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAdmin><AdminLayout /></RequireAdmin>,
    children: [
      { path: '/', element: <ComingSoon title="Dashboard" step="step 5" /> },
      { path: '/products', element: <ComingSoon title="Products" step="step 3" /> },
      { path: '/orders', element: <ComingSoon title="Orders" step="step 4" /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
