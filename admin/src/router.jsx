// import = bring in code from another file or package
// createBrowserRouter = the list of URLs and the page each one shows
import { createBrowserRouter } from 'react-router';
// import = bring in code from another file or package
import { AdminLayout } from '@/components/layout/AdminLayout';
// import = bring in code from another file or package
import { NotFound } from '@/components/layout/NotFound';
// import = bring in code from another file or package
import { LoginPage } from '@/features/auth/LoginPage';
// import = bring in code from another file or package
import { RequireAdmin } from '@/features/auth/RequireAdmin';
// import = bring in code from another file or package
import { ProductsPage } from '@/features/products/ProductsPage';
// import = bring in code from another file or package
import { ProductCreatePage, ProductEditPage } from '@/features/products/ProductEditPage';
// import = bring in code from another file or package
import { OrdersPage } from '@/features/orders/OrdersPage';
// import = bring in code from another file or package
import { OrderDetailPage } from '@/features/orders/OrderDetailPage';
// import = bring in code from another file or package
import { ContentPage } from '@/features/content/ContentPage';
// import = bring in code from another file or package
import { CustomersPage } from '@/features/customers/CustomersPage';

// Every page except /login is inside RequireAdmin + the admin layout.
// export = other files can import this
// const = a name for a value that is never reassigned
// createBrowserRouter = the list of URLs and the page each one shows
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    // children = whatever is written between this component's opening and closing tags
    children: [
      // Code splitting: the dashboard (and its big chart library) is downloaded only when it's
      // opened, so the login, products and orders pages load faster.
      {
        path: '/',
        // lazy = load this page's code only when the page is first opened (smaller first download)
        // => = an arrow function (a short function)
        // async = this function works with await and returns a Promise
        // await = wait for a Promise (async result) before continuing
        lazy: async () => ({ Component: (await import('@/features/dashboard/DashboardPage')).DashboardPage }),
      },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/new', element: <ProductCreatePage /> },
      { path: '/products/:id', element: <ProductEditPage /> },
      { path: '/orders', element: <OrdersPage /> },
      { path: '/orders/:id', element: <OrderDetailPage /> },
      { path: '/customers', element: <CustomersPage /> },
      { path: '/content', element: <ContentPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
