import { createBrowserRouter } from 'react-router';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { NotFound } from '@/components/layout/NotFound';
import { LoginPage } from '@/features/auth/LoginPage';
import { RequireAdmin } from '@/features/auth/RequireAdmin';
import { ProductsPage } from '@/features/products/ProductsPage';
import { ProductCreatePage, ProductEditPage } from '@/features/products/ProductEditPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { OrderDetailPage } from '@/features/orders/OrderDetailPage';

// Every page except /login is inside RequireAdmin + the admin layout.
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAdmin><AdminLayout /></RequireAdmin>,
    children: [
      // Code splitting: the dashboard (and its big chart library) is downloaded only when it's
      // opened, so the login, products and orders pages load faster.
      { path: '/', lazy: async () => ({ Component: (await import('@/features/dashboard/DashboardPage')).DashboardPage }) },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/new', element: <ProductCreatePage /> },
      { path: '/products/:id', element: <ProductEditPage /> },
      { path: '/orders', element: <OrdersPage /> },
      { path: '/orders/:id', element: <OrderDetailPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
