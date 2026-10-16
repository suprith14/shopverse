import { createBrowserRouter } from 'react-router';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ComingSoon } from '@/components/layout/ComingSoon';
import { NotFound } from '@/components/layout/NotFound';
import { LoginPage } from '@/features/auth/LoginPage';
import { RequireAdmin } from '@/features/auth/RequireAdmin';
import { ProductsPage } from '@/features/products/ProductsPage';
import { ProductCreatePage, ProductEditPage } from '@/features/products/ProductEditPage';

// Every page except /login is inside RequireAdmin + the admin layout.
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAdmin><AdminLayout /></RequireAdmin>,
    children: [
      { path: '/', element: <ComingSoon title="Dashboard" step="step 5" /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/new', element: <ProductCreatePage /> },
      { path: '/products/:id', element: <ProductEditPage /> },
      { path: '/orders', element: <ComingSoon title="Orders" step="step 4" /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
