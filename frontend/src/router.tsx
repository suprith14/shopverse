import { createBrowserRouter, Link } from 'react-router';
import { RootLayout } from '@/components/layout/RootLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { HomePage } from '@/features/catalog/HomePage';
import { CatalogPage } from '@/features/catalog/CatalogPage';
import { ProductDetailPage } from '@/features/catalog/ProductDetailPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { CartPage } from '@/features/cart/CartPage';
import { WishlistPage } from '@/features/wishlist/WishlistPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { OrderDetailPage } from '@/features/orders/OrderDetailPage';
import { AccountPage } from '@/features/account/AccountPage';
import { PageTitle } from '@/components/layout/PageTitle';

// All routes in one place. Protected pages get wrapped in <RequireAuth> as they are added.
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/shop', element: <CatalogPage /> },
      { path: '/products/:slug', element: <ProductDetailPage /> },
      { path: '/cart', element: <RequireAuth><CartPage /></RequireAuth> },
      { path: '/wishlist', element: <RequireAuth><WishlistPage /></RequireAuth> },
      { path: '/orders', element: <RequireAuth><OrdersPage /></RequireAuth> },
      { path: '/orders/:id', element: <RequireAuth><OrderDetailPage /></RequireAuth> },
      { path: '/account', element: <RequireAuth><AccountPage /></RequireAuth> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

function NotFound() {
  return (
    <div className="py-24 text-center">
      <PageTitle title="Page not found" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-slate-500">This page doesn't exist.</p>
      <Link to="/" className="mt-6 inline-block text-brand-600 hover:underline">Go home</Link>
    </div>
  );
}
