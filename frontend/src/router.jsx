import { useTranslation } from 'react-i18next';
import { createBrowserRouter, Link } from 'react-router';
import { RootLayout } from '@/components/layout/RootLayout';
import { HomePage } from '@/features/catalog/HomePage';
import { CatalogPage } from '@/features/catalog/CatalogPage';
import { ProductDetailPage } from '@/features/catalog/ProductDetailPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { CartPage } from '@/features/cart/CartPage';
import { PageTitle } from '@/components/layout/PageTitle';
import { Spinner } from '@/components/ui/States';

// All routes in one place. Protected pages are wrapped in <RequireAuth>.
//
// Code splitting: the pages almost every visitor sees (home, shop, product, cart) are in the
// main bundle. The rest is downloaded only when first opened (`lazy`), so the first visit is lighter.
export const router = createBrowserRouter([
  // The training portal: a full page of its own (no store header/footer), opened in a new tab from
  // My account. Public: it holds no personal data, and links to lessons can be shared.
  {
    path: '/training',
    lazy: async () => ({ Component: (await import('@/features/training/TrainingPage')).TrainingPage }),
    hydrateFallbackElement: <Spinner />,
  },
  // The two source documents (Feature Spec, Pro Guide) as web pages. Each loads its own content
  // only when opened. key = a fresh page (contents, scroll) when switching between them.
  // Every short form used in the training (RFP, SOW, MoM...), searchable
  {
    path: '/training/glossary',
    lazy: async () => ({ Component: (await import('@/features/training/GlossaryPage')).GlossaryPage }),
    hydrateFallbackElement: <Spinner />,
  },
  {
    path: '/training/spec',
    lazy: async () => {
      const [{ DocumentPage }, { SPEC }] = await Promise.all([
        import('@/features/training/DocumentPage'),
        import('@/features/training/docs/spec'),
      ]);
      return { element: <DocumentPage key="spec" doc={SPEC} /> };
    },
    hydrateFallbackElement: <Spinner />,
  },
  {
    path: '/training/guide',
    lazy: async () => {
      const [{ DocumentPage }, { GUIDE }] = await Promise.all([
        import('@/features/training/DocumentPage'),
        import('@/features/training/docs/guide'),
      ]);
      return { element: <DocumentPage key="guide" doc={GUIDE} /> };
    },
    hydrateFallbackElement: <Spinner />,
  },
  {
    element: <RootLayout />,
    // Shown on a first visit straight to a lazy page (e.g. a bookmarked /orders) while its code loads.
    hydrateFallbackElement: <Spinner />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/shop', element: <CatalogPage /> },
      { path: '/products/:slug', element: <ProductDetailPage /> },
      {
        path: '/cart',
        element: (
          <RequireAuth>
            <CartPage />
          </RequireAuth>
        ),
      },
      {
        path: '/wishlist',
        lazy: async () => {
          const { WishlistPage } = await import('@/features/wishlist/WishlistPage');
          return {
            element: (
              <RequireAuth>
                <WishlistPage />
              </RequireAuth>
            ),
          };
        },
      },
      {
        path: '/orders',
        lazy: async () => {
          const { OrdersPage } = await import('@/features/orders/OrdersPage');
          return {
            element: (
              <RequireAuth>
                <OrdersPage />
              </RequireAuth>
            ),
          };
        },
      },
      {
        path: '/orders/:id',
        lazy: async () => {
          const { OrderDetailPage } = await import('@/features/orders/OrderDetailPage');
          return {
            element: (
              <RequireAuth>
                <OrderDetailPage />
              </RequireAuth>
            ),
          };
        },
      },
      {
        path: '/account',
        lazy: async () => {
          const { AccountPage } = await import('@/features/account/AccountPage');
          return {
            element: (
              <RequireAuth>
                <AccountPage />
              </RequireAuth>
            ),
          };
        },
      },
      // The project guide, behind a password the server checks (see backend modules/guide)
      {
        path: '/account/guide',
        lazy: async () => {
          const { GuidePage } = await import('@/features/guide/GuidePage');
          return {
            element: (
              <RequireAuth>
                <GuidePage />
              </RequireAuth>
            ),
          };
        },
      },
      // Public (no RequireAuth): opened by scanning an invoice's QR code.
      {
        path: '/verify/:token',
        lazy: async () => ({ Component: (await import('@/features/invoices/VerifyInvoicePage')).VerifyInvoicePage }),
      },
      {
        path: '/forgot-password',
        lazy: async () => ({ Component: (await import('@/features/auth/ForgotPasswordPage')).ForgotPasswordPage }),
      },
      { path: '/login', lazy: async () => ({ Component: (await import('@/features/auth/LoginPage')).LoginPage }) },
      {
        path: '/register',
        lazy: async () => ({ Component: (await import('@/features/auth/RegisterPage')).RegisterPage }),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="py-24 text-center">
      <PageTitle title={t('notFound.title')} />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-slate-500">{t('notFound.text')}</p>
      <Link to="/" className="mt-6 inline-block text-brand-600 dark:text-brand-300 hover:underline">
        {t('notFound.goHome')}
      </Link>
    </div>
  );
}
