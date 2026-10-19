// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// createBrowserRouter = the list of URLs and the page each one shows
// Link = a link to another page of this app (no full page reload)
import { createBrowserRouter, Link } from 'react-router';
// import = bring in code from another file or package
import { RootLayout } from '@/components/layout/RootLayout';
// import = bring in code from another file or package
import { HomePage } from '@/features/catalog/HomePage';
// import = bring in code from another file or package
import { CatalogPage } from '@/features/catalog/CatalogPage';
// import = bring in code from another file or package
import { ProductDetailPage } from '@/features/catalog/ProductDetailPage';
// import = bring in code from another file or package
import { RequireAuth } from '@/features/auth/RequireAuth';
// import = bring in code from another file or package
import { CartPage } from '@/features/cart/CartPage';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';
// import = bring in code from another file or package
import { Spinner } from '@/components/ui/States';

// All routes in one place. Protected pages are wrapped in <RequireAuth>.
//
// Code splitting: the pages almost every visitor sees (home, shop, product, cart) are in the
// main bundle. The rest is downloaded only when first opened (`lazy`), so the first visit is lighter.
// export = other files can import this
// const = a name for a value that is never reassigned
// createBrowserRouter = the list of URLs and the page each one shows
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    // Shown on a first visit straight to a lazy page (e.g. a bookmarked /orders) while its code loads.
    hydrateFallbackElement: <Spinner />,
    // children = whatever is written between this component's opening and closing tags
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
        // lazy = load this page's code only when the page is first opened (smaller first download)
        // => = an arrow function (a short function)
        // async = this function works with await and returns a Promise
        lazy: async () => {
          // const = a name for a value that is never reassigned
          // { a, b } = destructuring: take properties a and b out of an object
          // await = wait for a Promise (async result) before continuing
          const { WishlistPage } = await import('@/features/wishlist/WishlistPage');
          // return = give this value back and stop the function here
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
        // lazy = load this page's code only when the page is first opened (smaller first download)
        // => = an arrow function (a short function)
        // async = this function works with await and returns a Promise
        lazy: async () => {
          // const = a name for a value that is never reassigned
          // { a, b } = destructuring: take properties a and b out of an object
          // await = wait for a Promise (async result) before continuing
          const { OrdersPage } = await import('@/features/orders/OrdersPage');
          // return = give this value back and stop the function here
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
        // lazy = load this page's code only when the page is first opened (smaller first download)
        // => = an arrow function (a short function)
        // async = this function works with await and returns a Promise
        lazy: async () => {
          // const = a name for a value that is never reassigned
          // { a, b } = destructuring: take properties a and b out of an object
          // await = wait for a Promise (async result) before continuing
          const { OrderDetailPage } = await import('@/features/orders/OrderDetailPage');
          // return = give this value back and stop the function here
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
        // lazy = load this page's code only when the page is first opened (smaller first download)
        // => = an arrow function (a short function)
        // async = this function works with await and returns a Promise
        lazy: async () => {
          // const = a name for a value that is never reassigned
          // { a, b } = destructuring: take properties a and b out of an object
          // await = wait for a Promise (async result) before continuing
          const { AccountPage } = await import('@/features/account/AccountPage');
          // return = give this value back and stop the function here
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
        // lazy = load this page's code only when the page is first opened (smaller first download)
        // => = an arrow function (a short function)
        // async = this function works with await and returns a Promise
        lazy: async () => {
          // const = a name for a value that is never reassigned
          // { a, b } = destructuring: take properties a and b out of an object
          // await = wait for a Promise (async result) before continuing
          const { GuidePage } = await import('@/features/guide/GuidePage');
          // return = give this value back and stop the function here
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
        // lazy = load this page's code only when the page is first opened (smaller first download)
        // => = an arrow function (a short function)
        // async = this function works with await and returns a Promise
        // await = wait for a Promise (async result) before continuing
        lazy: async () => ({ Component: (await import('@/features/invoices/VerifyInvoicePage')).VerifyInvoicePage }),
      },
      {
        path: '/forgot-password',
        // lazy = load this page's code only when the page is first opened (smaller first download)
        // => = an arrow function (a short function)
        // async = this function works with await and returns a Promise
        // await = wait for a Promise (async result) before continuing
        lazy: async () => ({ Component: (await import('@/features/auth/ForgotPasswordPage')).ForgotPasswordPage }),
      },
      // lazy = load this page's code only when the page is first opened (smaller first download)
      // => = an arrow function (a short function)
      // async = this function works with await and returns a Promise
      // await = wait for a Promise (async result) before continuing
      { path: '/login', lazy: async () => ({ Component: (await import('@/features/auth/LoginPage')).LoginPage }) },
      {
        path: '/register',
        // lazy = load this page's code only when the page is first opened (smaller first download)
        // => = an arrow function (a short function)
        // async = this function works with await and returns a Promise
        // await = wait for a Promise (async result) before continuing
        lazy: async () => ({ Component: (await import('@/features/auth/RegisterPage')).RegisterPage }),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

// function Name() = a React component (capital letter): returns what to show (JSX)
function NotFound() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="py-24 text-center">
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <PageTitle title={t('notFound.title')} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <h1 className="text-4xl font-bold">404</h1>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <p className="mt-2 text-slate-500">{t('notFound.text')}</p>
      {/* Link = a link to another page of this app (no full page reload)
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <Link to="/" className="mt-6 inline-block text-brand-600 dark:text-brand-300 hover:underline">
        {/* { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {t('notFound.goHome')}
      </Link>
    </div>
  );
}
