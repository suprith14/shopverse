# ShopVerse glossary

Every keyword used in the ShopVerse code, explained once, with where it appears.
The same notes sit above each line of code on the `learning` branch (`git switch learning`);
`main` keeps the code clean, with comments that explain *why*, not *what*.

**Apps:** store = `frontend/` (customer shop), admin = `admin/` (staff portal), API = `backend/` (Express + Prisma).

## Contents
- [JavaScript syntax](#javascript-syntax)
- [JavaScript built-ins](#javascript-built-ins)
- [React](#react)
- [React Router](#react-router)
- [TanStack Query (store data fetching)](#tanstack-query-store-data-fetching)
- [Zustand (small global stores)](#zustand-small-global-stores)
- [Translations (react-i18next)](#translations-react-i18next)
- [HTTP requests](#http-requests)
- [Browser APIs](#browser-apis)
- [HTML elements](#html-elements)
- [JSX attributes & accessibility](#jsx-attributes--accessibility)
- [Redux Toolkit (admin state)](#redux-toolkit-admin-state)
- [RTK Query (admin data fetching)](#rtk-query-admin-data-fetching)
- [Charts (recharts)](#charts-recharts)
- [Node.js](#nodejs)
- [Express](#express)
- [Prisma](#prisma)
- [Zod (validation)](#zod-validation)
- [Auth & security](#auth--security)
- [Cookies & tokens](#cookies--tokens)
- [Payments, PDF & email](#payments-pdf--email)
- [Libraries](#libraries)
- [Testing](#testing)
- [ShopVerse helpers (store)](#shopverse-helpers-store)
- [ShopVerse helpers (backend)](#shopverse-helpers-backend)

## JavaScript syntax

| Keyword | Meaning | Used in |
|---|---|---|
| `!` | NOT: flips true/false | admin, API, store: [api.js](../admin/src/app/api.js), [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx) +74 |
| `!!x` | turn any value into true/false | admin, API, store: [OrderDetailPage.jsx](../admin/src/features/orders/OrderDetailPage.jsx), [reviews.service.js](../backend/src/modules/reviews/reviews.service.js) +6 |
| `!==` | not strictly equal | admin, API, store: [api.js](../admin/src/app/api.js), [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx) +35 |
| `?.` | optional chaining: stop (undefined) instead of crashing if the left side is null/undefined | admin, API, store: [api.js](../admin/src/app/api.js), [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx) +64 |
| `?.()` | call only if the function exists | admin, API, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +21 |
| `...rest` | collect the remaining items/properties | admin, API, store: [Button.jsx](../admin/src/components/ui/Button.jsx), [Input.jsx](../admin/src/components/ui/Input.jsx) +12 |
| `...x` | spread: copy all items/properties of x into here | admin, API, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +42 |
| `[a, b]` | destructuring: take the first and second items of an array | admin, API, store: [App.jsx](../admin/src/App.jsx), [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx) +52 |
| `{ } in JSX` | run JavaScript here and show its result | admin, store: [App.jsx](../admin/src/App.jsx), [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx) +67 |
| `{ a, b }` | destructuring: take properties a and b out of an object | admin, API, store: [api.js](../admin/src/app/api.js), [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx) +102 |
| `{...rest}` | pass all the other props on to this element | admin, store: [Button.jsx](../admin/src/components/ui/Button.jsx), [Input.jsx](../admin/src/components/ui/Input.jsx) +2 |
| ``text ${x}`` | a template string: text with values inserted | admin, API, store: [api.js](../admin/src/app/api.js), [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx) +99 |
| `<> </>` | a fragment: groups elements without adding an extra HTML element | admin, store: [App.jsx](../admin/src/App.jsx), [RequireAdmin.jsx](../admin/src/features/auth/RequireAdmin.jsx) +9 |
| `===` | strictly equal (same value AND same type) | admin, API, store: [api.js](../admin/src/app/api.js), [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx) +81 |
| `=>` | an arrow function (a short function) | admin, API, store: [App.jsx](../admin/src/App.jsx), [api.js](../admin/src/app/api.js) +144 |
| `a ? b : c` | ternary: if a then b else c | admin, API, store: [api.js](../admin/src/app/api.js), [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx) +76 |
| `a ?? b` | a, unless a is null/undefined, then b | admin, API, store: [Input.jsx](../admin/src/components/ui/Input.jsx), [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx) +54 |
| `a && b` | AND; in JSX: show b only when a is true | admin, API, store: [api.js](../admin/src/app/api.js), [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx) +73 |
| `a \|\| b` | OR: a if it is truthy, else b | admin, API, store: [api.js](../admin/src/app/api.js), [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx) +52 |
| `async` | this function works with await and returns a Promise | admin, API, store: [api.js](../admin/src/app/api.js), [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx) +73 |
| `await` | wait for a Promise (async result) before continuing | admin, API, store: [api.js](../admin/src/app/api.js), [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx) +74 |
| `const` | a name for a value that is never reassigned | admin, API, store: [App.jsx](../admin/src/App.jsx), [api.js](../admin/src/app/api.js) +188 |
| `export` | other files can import this | admin, API, store: [App.jsx](../admin/src/App.jsx), [api.js](../admin/src/app/api.js) +183 |
| `export default` | the file's main export | admin, API, store: [authSlice.js](../admin/src/features/auth/authSlice.js), [global-setup.js](../backend/tests/api/global-setup.js) +2 |
| `function` | a named, reusable block of code | admin, API, store: [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx), [download.js](../admin/src/lib/download.js) +70 |
| `function Name()` | a React component (capital letter): returns what to show (JSX) | admin, store: [App.jsx](../admin/src/App.jsx), [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx) +66 |
| `if (...)` | run the next part only when the condition is true | admin, API, store: [api.js](../admin/src/app/api.js), [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx) +90 |
| `import` | bring in code from another file or package | admin, API, store: [App.jsx](../admin/src/App.jsx), [api.js](../admin/src/app/api.js) +191 |
| `let` | a name whose value can be changed later | admin, API, store: [api.js](../admin/src/app/api.js), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +19 |
| `new` | create an object from a class (e.g. new Date()) | admin, API, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx) +49 |
| `obj[key]` | read the property whose name is stored in key | admin, API, store: [Button.jsx](../admin/src/components/ui/Button.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +33 |
| `return` | give this value back and stop the function here | admin, API, store: [App.jsx](../admin/src/App.jsx), [api.js](../admin/src/app/api.js) +124 |
| `throw` | stop here with an error | admin, API, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [download.js](../admin/src/lib/download.js) +26 |
| `try / catch` | if the code inside fails, run the catch part instead of crashing | admin, API, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +15 |
| `x` | value (in parameters) = the default used when x is not given | admin, API, store: [Button.jsx](../admin/src/components/ui/Button.jsx), [Input.jsx](../admin/src/components/ui/Input.jsx) +36 |

## JavaScript built-ins

| Keyword | Meaning | Used in |
|---|---|---|
| `.filter` | keep only the items that pass a test | admin, API, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx) +11 |
| `.find` | the first item that passes a test (or undefined) | admin, API, store: [DashboardPage.jsx](../admin/src/features/dashboard/DashboardPage.jsx), [OrdersPage.jsx](../admin/src/features/orders/OrdersPage.jsx) +5 |
| `.findIndex` | the position of the first matching item (-1 if none) | admin: [OrderDetailPage.jsx](../admin/src/features/orders/OrderDetailPage.jsx) |
| `.flatMap` | map, then flatten one level | API, store: [seed.js](../backend/prisma/seed.js), [ProductDetailPage.jsx](../frontend/src/features/catalog/ProductDetailPage.jsx) |
| `.includes` | true if the array/string contains the value | admin, API, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [DashboardPage.jsx](../admin/src/features/dashboard/DashboardPage.jsx) +7 |
| `.join` | turn an array into one string with a separator | admin, API, store: [ProductForm.jsx](../admin/src/features/products/ProductForm.jsx), [format.js](../admin/src/lib/format.js) +15 |
| `.map` | make a new array by transforming each item (in JSX: one element per item) | admin, store: [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +37 |
| `.map` | make a new array by transforming each item | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +17 |
| `.padStart` | pad a string at the start to a length | API, store: [password-reset.js](../backend/src/modules/auth/password-reset.js), [invoice.js](../backend/src/modules/orders/invoice.js) +1 |
| `.reduce` | combine all items into one value (e.g. a sum) | admin, API, store: [OrdersPage.jsx](../admin/src/features/orders/OrdersPage.jsx), [seed-orders.js](../backend/prisma/seed-orders.js) +4 |
| `.slice` | a copy of part of an array/string | admin, API, store: [format.js](../admin/src/lib/format.js), [auth.js](../backend/src/middleware/auth.js) +11 |
| `.some` | true if at least one item passes the test | API, store: [products.service.js](../backend/src/modules/admin/products/products.service.js), [cart.service.js](../backend/src/modules/cart/cart.service.js) +4 |
| `.sort` | put the items in order (changes the array) | API: [cloudinary.js](../backend/src/lib/cloudinary.js), [catalog.service.js](../backend/src/modules/catalog/catalog.service.js) +2 |
| `.split` | cut a string into an array | admin, API, store: [ProductForm.jsx](../admin/src/features/products/ProductForm.jsx), [env.js](../backend/src/config/env.js) +4 |
| `.startsWith` | true if the text begins with this | API: [auth.js](../backend/src/middleware/auth.js), [profile.service.js](../backend/src/modules/profile/profile.service.js) +2 |
| `.toFixed(n)` | number as text with n decimals | admin, API, store: [format.js](../admin/src/lib/format.js), [coupons.service.js](../backend/src/modules/coupons/coupons.service.js) +4 |
| `.toLowerCase` | the text in small letters | API: [seed.js](../backend/prisma/seed.js), [env.js](../backend/src/config/env.js) +4 |
| `.toUpperCase` | the text in capital letters | API: [seed.js](../backend/prisma/seed.js), [products.schema.js](../backend/src/modules/admin/products/products.schema.js) +6 |
| `.trim` | remove spaces at both ends | admin, API, store: [CustomerDialogs.jsx](../admin/src/features/customers/CustomerDialogs.jsx), [ProductForm.jsx](../admin/src/features/products/ProductForm.jsx) +10 |
| `Buffer` | raw bytes in Node (files, hashes, images) | API: [password-reset.js](../backend/src/modules/auth/password-reset.js), [invoice.js](../backend/src/modules/orders/invoice.js) |
| `clearInterval` | stop a setInterval | API, store: [expire-orders.job.js](../backend/src/jobs/expire-orders.job.js), [use-retry-countdown.js](../frontend/src/lib/use-retry-countdown.js) |
| `Date` | a point in time | admin, store: [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx), [chartTheme.js](../admin/src/features/dashboard/chartTheme.js) +6 |
| `Date` | a point in time (Date.now() = milliseconds since 1970) | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +17 |
| `encodeURIComponent` | make text safe to put in a URL | store: [SearchBox.jsx](../frontend/src/features/catalog/components/SearchBox.jsx) |
| `Error` | an error object with a message (and a stack trace) | API: [cloudinary.js](../backend/src/lib/cloudinary.js), [email.js](../backend/src/lib/email.js) +3 |
| `fetch` | send an HTTP request (built into Node 18+) | API: [cloudinary.js](../backend/src/lib/cloudinary.js) |
| `Intl` | the browser's built-in formatting for dates, numbers and names per language | admin, store: [chartTheme.js](../admin/src/features/dashboard/chartTheme.js), [format.js](../admin/src/lib/format.js) +2 |
| `JSON.parse / JSON.stringify` | text <-> object | admin, API, store: [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx), [access.test.js](../backend/tests/api/access.test.js) +4 |
| `JSON.stringify` | object -> JSON text | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +1 |
| `Map` | key -> value lookup table | API, store: [activity.js](../backend/src/lib/activity.js), [rate-limiter.js](../backend/src/lib/rate-limiter.js) +3 |
| `Math` | number helpers (min, max, round, floor...) | admin, store: [format.js](../admin/src/lib/format.js), [StarRating.jsx](../frontend/src/components/ui/StarRating.jsx) +8 |
| `Math` | number helpers (min, max, round, floor, ceil...) | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +13 |
| `Object.entries` | [key, value] pairs of an object | admin, API, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [seed.js](../backend/prisma/seed.js) +4 |
| `Object.fromEntries` | build an object from [key, value] pairs | admin, API, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx) +2 |
| `Object.keys` | the property names of an object | admin, API: [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx), [cloudinary.js](../backend/src/lib/cloudinary.js) +3 |
| `Promise` | a value that arrives later; Promise.all waits for several at once | API: [seed-orders.js](../backend/prisma/seed-orders.js), [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js) +7 |
| `Promise` | a value that arrives later (async) | store: [api-client.js](../frontend/src/lib/api-client.js) |
| `Set` | a collection of unique values with fast .has() lookup | admin, store: [server-error.js](../admin/src/lib/server-error.js), [DeliveryAddressPicker.jsx](../frontend/src/features/account/DeliveryAddressPicker.jsx) +1 |
| `setInterval` | run a function repeatedly every N ms | API, store: [expire-orders.job.js](../backend/src/jobs/expire-orders.job.js), [rate-limiter.js](../backend/src/lib/rate-limiter.js) +1 |
| `setTimeout` | run a function once after a delay (ms) | admin, API, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [use-debounce.js](../admin/src/lib/use-debounce.js) +8 |

## React

| Keyword | Meaning | Used in |
|---|---|---|
| `children` | whatever is written between this component's opening and closing tags | admin, store: [Button.jsx](../admin/src/components/ui/Button.jsx), [RequireAdmin.jsx](../admin/src/features/auth/RequireAdmin.jsx) +13 |
| `createRoot` | start React inside an existing HTML element | admin, store: [main.jsx](../admin/src/main.jsx), [main.jsx](../frontend/src/main.jsx) |
| `StrictMode` | extra checks while developing (runs some code twice to catch bugs); no effect in production | admin, store: [main.jsx](../admin/src/main.jsx), [main.jsx](../frontend/src/main.jsx) |
| `useEffect` | run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change | admin, store: [App.jsx](../admin/src/App.jsx), [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx) +17 |
| `useId` | a unique id per component instance (for label/aria links) | store: [SearchBox.jsx](../frontend/src/features/catalog/components/SearchBox.jsx) |
| `useMemo` | remember a calculated value; recalculate only when its [deps] change | store: [use-site-content.js](../frontend/src/content/use-site-content.js), [wishlist.api.js](../frontend/src/features/wishlist/wishlist.api.js) |
| `useRef` | a box (.current) that keeps a value or a DOM element without causing a redraw | admin, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +7 |
| `useState` | a value the component remembers; calling its setter redraws the component | admin, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx) +35 |

## React Router

| Keyword | Meaning | Used in |
|---|---|---|
| `createBrowserRouter` | the list of URLs and the page each one shows | admin, store: [router.jsx](../admin/src/router.jsx), [router.jsx](../frontend/src/router.jsx) |
| `lazy` | load this page's code only when the page is first opened (smaller first download) | admin, store: [router.jsx](../admin/src/router.jsx), [router.jsx](../frontend/src/router.jsx) |
| `Link` | a link to another page of this app (no full page reload) | admin, store: [NotFound.jsx](../admin/src/components/layout/NotFound.jsx), [DashboardPage.jsx](../admin/src/features/dashboard/DashboardPage.jsx) +20 |
| `Navigate` | redirect to another URL as soon as it is drawn | admin, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [RequireAdmin.jsx](../admin/src/features/auth/RequireAdmin.jsx) +1 |
| `NavLink` | a Link that knows if it's the current page (isActive) for highlighting | admin, store: [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx), [Header.jsx](../frontend/src/components/layout/Header.jsx) |
| `Outlet` | where the child route's page appears inside a layout | admin, store: [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx), [RootLayout.jsx](../frontend/src/components/layout/RootLayout.jsx) |
| `RouterProvider` | shows the page that matches the current URL | admin, store: [App.jsx](../admin/src/App.jsx), [main.jsx](../frontend/src/main.jsx) |
| `ScrollRestoration` | new page -> top; Back button -> previous scroll position | store: [RootLayout.jsx](../frontend/src/components/layout/RootLayout.jsx) |
| `useLocation` | the current URL (pathname, search) and any state passed to it | admin, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [RequireAdmin.jsx](../admin/src/features/auth/RequireAdmin.jsx) +8 |
| `useNavigate` | gives navigate(url) to change page from code | admin, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [ProductEditPage.jsx](../admin/src/features/products/ProductEditPage.jsx) +8 |
| `useParams` | the :parts of the URL, e.g. :slug in /products/:slug | admin, store: [OrderDetailPage.jsx](../admin/src/features/orders/OrderDetailPage.jsx), [ProductEditPage.jsx](../admin/src/features/products/ProductEditPage.jsx) +3 |
| `useSearchParams` | read/write the ?query=part of the URL | admin, store: [CustomersPage.jsx](../admin/src/features/customers/CustomersPage.jsx), [DashboardPage.jsx](../admin/src/features/dashboard/DashboardPage.jsx) +5 |

## TanStack Query (store data fetching)

| Keyword | Meaning | Used in |
|---|---|---|
| `enabled` | only fetch when this is true (e.g. once logged in) | store: [account.api.js](../frontend/src/features/account/account.api.js), [cart.api.js](../frontend/src/features/cart/cart.api.js) +5 |
| `invalidateQueries` | mark cached data as old, so screens showing it refetch | store: [OrderDetailPage.jsx](../frontend/src/features/orders/OrderDetailPage.jsx), [orders.api.js](../frontend/src/features/orders/orders.api.js) +1 |
| `isError` | the request failed | store: [AccountPage.jsx](../frontend/src/features/account/AccountPage.jsx), [ForgotPasswordPage.jsx](../frontend/src/features/auth/ForgotPasswordPage.jsx) +14 |
| `isFetching` | a request is running (even if old data is shown) | admin, store: [CustomersPage.jsx](../admin/src/features/customers/CustomersPage.jsx), [OrdersPage.jsx](../admin/src/features/orders/OrdersPage.jsx) +4 |
| `isLoading` | first load, no data yet | admin, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx) +18 |
| `isPending` | the request is running right now | store: [AccountPage.jsx](../frontend/src/features/account/AccountPage.jsx), [DeliveryAddressPicker.jsx](../frontend/src/features/account/DeliveryAddressPicker.jsx) +10 |
| `keepPreviousData` | keep showing the old results while the new ones load | store: [catalog.api.js](../frontend/src/features/catalog/catalog.api.js), [coupons.api.js](../frontend/src/features/coupons/coupons.api.js) +1 |
| `meta` | extra info for the global error handler in main.jsx | store: [coupons.api.js](../frontend/src/features/coupons/coupons.api.js) |
| `mutate` | run the mutation (send the change) | store: [Header.jsx](../frontend/src/components/layout/Header.jsx), [AccountPage.jsx](../frontend/src/features/account/AccountPage.jsx) +11 |
| `mutationFn` | the function that sends the change to the server | store: [account.api.js](../frontend/src/features/account/account.api.js), [auth.api.js](../frontend/src/features/auth/auth.api.js) +5 |
| `onError` | runs if the request failed | store: [CartPage.jsx](../frontend/src/features/cart/CartPage.jsx), [cart.api.js](../frontend/src/features/cart/cart.api.js) +2 |
| `onSuccess` | runs after the request succeeded | store: [AccountPage.jsx](../frontend/src/features/account/AccountPage.jsx), [DeliveryAddressPicker.jsx](../frontend/src/features/account/DeliveryAddressPicker.jsx) +14 |
| `placeholderData` | what to show while the real data loads | store: [catalog.api.js](../frontend/src/features/catalog/catalog.api.js), [coupons.api.js](../frontend/src/features/coupons/coupons.api.js) +1 |
| `QueryCache / MutationCache` | the lists of all queries / mutations; their onError runs for EVERY one | store: [main.jsx](../frontend/src/main.jsx) |
| `QueryClient` | the cache that stores every server answer by its key | store: [main.jsx](../frontend/src/main.jsx) |
| `QueryClientProvider` | makes the cache available to every component | store: [main.jsx](../frontend/src/main.jsx) |
| `queryFn` | the function that actually fetches the data | store: [use-site-content.js](../frontend/src/content/use-site-content.js), [account.api.js](../frontend/src/features/account/account.api.js) +7 |
| `queryKey` | the name of this data in the cache; same key = same cached answer | store: [use-site-content.js](../frontend/src/content/use-site-content.js), [account.api.js](../frontend/src/features/account/account.api.js) +8 |
| `refetchInterval` | ask the server again every N ms (polling) | store: [orders.api.js](../frontend/src/features/orders/orders.api.js) |
| `setQueryData` | put a value straight into the cache (no request) | store: [account.api.js](../frontend/src/features/account/account.api.js), [cart.api.js](../frontend/src/features/cart/cart.api.js) +2 |
| `staleTime` | how long cached data counts as fresh (no refetch during that time) | store: [use-site-content.js](../frontend/src/content/use-site-content.js), [catalog.api.js](../frontend/src/features/catalog/catalog.api.js) +1 |
| `useMutation` | CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending | store: [account.api.js](../frontend/src/features/account/account.api.js), [auth.api.js](../frontend/src/features/auth/auth.api.js) +5 |
| `useQuery` | READ server data with caching, loading and error states | store: [use-site-content.js](../frontend/src/content/use-site-content.js), [account.api.js](../frontend/src/features/account/account.api.js) +7 |
| `useQueryClient` | the shared cache, to update or refresh cached data | store: [account.api.js](../frontend/src/features/account/account.api.js), [cart.api.js](../frontend/src/features/cart/cart.api.js) +4 |

## Zustand (small global stores)

| Keyword | Meaning | Used in |
|---|---|---|
| `create (zustand)` | make a small global store any component can read | store: [auth.store.js](../frontend/src/features/auth/auth.store.js), [coupon.store.js](../frontend/src/features/coupons/coupon.store.js) +5 |
| `getState` | read the store outside React | store: [coupon.store.js](../frontend/src/features/coupons/coupon.store.js), [onboarding.store.js](../frontend/src/features/onboarding/onboarding.store.js) +3 |
| `setState` | change the store; components using it redraw | store: [api-error.js](../frontend/src/lib/api-error.js), [network-status.js](../frontend/src/lib/network-status.js) +1 |
| `subscribe` | run a function whenever the store changes | store: [coupon.store.js](../frontend/src/features/coupons/coupon.store.js), [onboarding.store.js](../frontend/src/features/onboarding/onboarding.store.js) |

## Translations (react-i18next)

| Keyword | Meaning | Used in |
|---|---|---|
| `i18n` | the translation library instance (current language, changeLanguage) | store: [LanguageSwitch.jsx](../frontend/src/components/layout/LanguageSwitch.jsx), [use-site-content.js](../frontend/src/content/use-site-content.js) +4 |
| `t('key')` | the text for this key in the current language (from i18n/en.js or kn.js) | store: [ApiErrorDialog.jsx](../frontend/src/components/layout/ApiErrorDialog.jsx), [Header.jsx](../frontend/src/components/layout/Header.jsx) +39 |
| `Trans` | a translated sentence with elements (links, bold) inside it; <0> = the first element | store: [ForgotPasswordPage.jsx](../frontend/src/features/auth/ForgotPasswordPage.jsx), [LoginPage.jsx](../frontend/src/features/auth/LoginPage.jsx) +2 |
| `useTranslation` | gives t() for text in the reader's language (English/Kannada) | store: [ApiErrorDialog.jsx](../frontend/src/components/layout/ApiErrorDialog.jsx), [Header.jsx](../frontend/src/components/layout/Header.jsx) +37 |

## HTTP requests

| Keyword | Meaning | Used in |
|---|---|---|
| `AbortSignal` | lets a request be cancelled (e.g. after a timeout) | store: [use-site-content.js](../frontend/src/content/use-site-content.js) |
| `api` | our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js) | store: [account.api.js](../frontend/src/features/account/account.api.js), [auth.api.js](../frontend/src/features/auth/auth.api.js) +10 |
| `axios` | an HTTP client library (sends requests to the API) | store: [api-client.js](../frontend/src/lib/api-client.js) |
| `fetch` | the browser's built-in way to send an HTTP request | admin, store: [authApi.js](../admin/src/features/auth/authApi.js), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +2 |
| `FormData` | form fields + files to send in one request (used for uploads) | admin, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [account.api.js](../frontend/src/features/account/account.api.js) |
| `interceptors` | code that runs on every request/response | store: [api-client.js](../frontend/src/lib/api-client.js) |

## Browser APIs

| Keyword | Meaning | Used in |
|---|---|---|
| `addEventListener` | run a function when an event happens | admin, store: [main.jsx](../admin/src/main.jsx), [Header.jsx](../frontend/src/components/layout/Header.jsx) +5 |
| `clearTimeout` | cancel a setTimeout | admin, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [use-debounce.js](../admin/src/lib/use-debounce.js) +4 |
| `document` | the current web page (its HTML elements) | admin, store: [download.js](../admin/src/lib/download.js), [main.jsx](../admin/src/main.jsx) +7 |
| `focus` | put the keyboard cursor in this element | store: [CartPage.jsx](../frontend/src/features/cart/CartPage.jsx) |
| `getUserMedia` | ask for the camera/microphone stream (needs permission) | store: [PhotoPicker.jsx](../frontend/src/components/ui/PhotoPicker.jsx) |
| `localStorage` | small key-value storage in this browser that survives reloads | store: [use-site-content.js](../frontend/src/content/use-site-content.js), [index.js](../frontend/src/i18n/index.js) +1 |
| `matchMedia` | check a CSS media query in JS, e.g. dark mode or reduced motion | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx), [theme.js](../frontend/src/lib/theme.js) |
| `navigator` | info about the browser/device (languages, camera...) | store: [PhotoPicker.jsx](../frontend/src/components/ui/PhotoPicker.jsx), [index.js](../frontend/src/i18n/index.js) |
| `preventDefault` | stop the browser's default action (form submit reload, link follow) | admin, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx) +13 |
| `removeEventListener` | stop listening (cleanup) | store: [Header.jsx](../frontend/src/components/layout/Header.jsx), [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx) +1 |
| `requestAnimationFrame` | run code right before the next screen paint | admin, store: [main.jsx](../admin/src/main.jsx), [main.jsx](../frontend/src/main.jsx) |
| `scrollIntoView` | scroll the page until this element is visible | store: [CartPage.jsx](../frontend/src/features/cart/CartPage.jsx) |
| `showModal` | open a <dialog> as a modal (dims the page, traps focus) | admin, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [CustomerDialogs.jsx](../admin/src/features/customers/CustomerDialogs.jsx) +3 |
| `stopPropagation` | stop the event reaching parent elements | store: [WishlistButton.jsx](../frontend/src/features/wishlist/WishlistButton.jsx) |
| `URL.createObjectURL` | a temporary URL for a file/blob in memory | admin, store: [download.js](../admin/src/lib/download.js), [PhotoPicker.jsx](../frontend/src/components/ui/PhotoPicker.jsx) +1 |
| `URL.revokeObjectURL` | free the memory of a temporary URL | admin, store: [download.js](../admin/src/lib/download.js), [PhotoPicker.jsx](../frontend/src/components/ui/PhotoPicker.jsx) +1 |
| `window` | the browser tab (location, events, timers) | admin, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [ApiErrorDialog.jsx](../frontend/src/components/layout/ApiErrorDialog.jsx) +5 |

## HTML elements

| Keyword | Meaning | Used in |
|---|---|---|
| `<aside>` | side content next to the main content | admin, store: [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx), [CartPage.jsx](../frontend/src/features/cart/CartPage.jsx) +1 |
| `<dialog>` | the browser's built-in popup (focus trap, Esc to close) | admin, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [CustomerDialogs.jsx](../admin/src/features/customers/CustomerDialogs.jsx) +3 |
| `<dl>` | a list of terms (<dt>) and their values (<dd>) | admin, store: [OrderDetailPage.jsx](../admin/src/features/orders/OrderDetailPage.jsx), [ProductDetailPage.jsx](../frontend/src/features/catalog/ProductDetailPage.jsx) +2 |
| `<fieldset>` | a group of related form fields (with a <legend> title) | admin, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [DeliveryAddressPicker.jsx](../frontend/src/features/account/DeliveryAddressPicker.jsx) |
| `<form>` | groups inputs; Enter or a submit button sends it (onSubmit) | admin, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx) +12 |
| `<iframe>` | a separate page shown inside this one | store: [GuidePage.jsx](../frontend/src/features/guide/GuidePage.jsx) |
| `<label>` | the name of an input; clicking it focuses the input | admin, store: [Input.jsx](../admin/src/components/ui/Input.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +10 |
| `<nav>` | a navigation area (screen readers can jump to it) | admin, store: [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx), [Header.jsx](../frontend/src/components/layout/Header.jsx) +3 |
| `<section>` | a themed part of the page with its own heading | store: [AccountPage.jsx](../frontend/src/features/account/AccountPage.jsx), [HomePage.jsx](../frontend/src/features/catalog/HomePage.jsx) +3 |
| `<select>` | a dropdown list | admin, store: [ProductForm.jsx](../admin/src/features/products/ProductForm.jsx), [ProductsPage.jsx](../admin/src/features/products/ProductsPage.jsx) +2 |
| `<video>` | shows a video or a live camera stream | store: [PhotoPicker.jsx](../frontend/src/components/ui/PhotoPicker.jsx) |

## JSX attributes & accessibility

| Keyword | Meaning | Used in |
|---|---|---|
| `accept` | which file types the file picker shows | admin, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [PhotoPicker.jsx](../frontend/src/components/ui/PhotoPicker.jsx) +2 |
| `alt` | text describing the image for screen readers (empty = decorative) | admin, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [CustomersPage.jsx](../admin/src/features/customers/CustomersPage.jsx) +14 |
| `aria-activedescendant` | which option in the list is highlighted | store: [SearchBox.jsx](../frontend/src/features/catalog/components/SearchBox.jsx) |
| `aria-controls` | the id of the element this button opens/closes | store: [Header.jsx](../frontend/src/components/layout/Header.jsx), [CatalogPage.jsx](../frontend/src/features/catalog/CatalogPage.jsx) +1 |
| `aria-current` | marks the current page/step/item | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx), [Pagination.jsx](../frontend/src/features/catalog/components/Pagination.jsx) +1 |
| `aria-describedby` | the element (by id) that describes this one | admin, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +1 |
| `aria-expanded` | tells screen readers if the controlled panel is open | store: [Header.jsx](../frontend/src/components/layout/Header.jsx), [CatalogPage.jsx](../frontend/src/features/catalog/CatalogPage.jsx) +1 |
| `aria-hidden` | screen readers skip this (decoration) | admin, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +12 |
| `aria-invalid` | this field has an error | admin: [ContentField.jsx](../admin/src/features/content/ContentField.jsx) |
| `aria-label` | the name screen readers read for this element | admin, store: [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +26 |
| `aria-labelledby` | the element (by id) that names this one | admin, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [CustomerDialogs.jsx](../admin/src/features/customers/CustomerDialogs.jsx) +3 |
| `aria-live` | screen readers announce changes to this text | store: [ProductDetailPage.jsx](../frontend/src/features/catalog/ProductDetailPage.jsx) |
| `aria-pressed` | a toggle button's on/off state | store: [ReviewForm.jsx](../frontend/src/features/reviews/ReviewForm.jsx), [WishlistButton.jsx](../frontend/src/features/wishlist/WishlistButton.jsx) |
| `aria-roledescription` | a custom name for the role (e.g. "carousel") | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx) |
| `aria-selected` | which tab/option is selected | admin, store: [CustomersPage.jsx](../admin/src/features/customers/CustomersPage.jsx), [OrdersPage.jsx](../admin/src/features/orders/OrdersPage.jsx) +2 |
| `autoComplete` | tells the browser what to auto-fill (email, password, address...) | admin, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [CustomerDialogs.jsx](../admin/src/features/customers/CustomerDialogs.jsx) +8 |
| `autoFocus` | put the cursor here when it appears | store: [ForgotPasswordPage.jsx](../frontend/src/features/auth/ForgotPasswordPage.jsx), [GuidePage.jsx](../frontend/src/features/guide/GuidePage.jsx) +1 |
| `capture` | open the camera instead of the file picker (phones) | store: [PhotoPicker.jsx](../frontend/src/components/ui/PhotoPicker.jsx) |
| `className` | CSS classes (Tailwind) for this element (class is a JS keyword) | admin, store: [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx), [NotFound.jsx](../admin/src/components/layout/NotFound.jsx) +62 |
| `disabled` | can't be clicked or typed in | admin, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [Button.jsx](../admin/src/components/ui/Button.jsx) +23 |
| `htmlFor` | which input this label belongs to (for in HTML) | admin, store: [Input.jsx](../admin/src/components/ui/Input.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +1 |
| `inert` | can't be focused or clicked (hidden slides) | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx) |
| `inputMode` | which phone keyboard to show (numeric...) | store: [ForgotPasswordPage.jsx](../frontend/src/features/auth/ForgotPasswordPage.jsx) |
| `key` | a stable id for list items so React can track them between redraws | admin, store: [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +33 |
| `lang` | the language of this text (pronunciation, fonts) | admin, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [LanguageSwitch.jsx](../frontend/src/components/layout/LanguageSwitch.jsx) |
| `loading="lazy"` | load the image only when it gets near the screen | admin, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx) +19 |
| `maxLength` | maximum number of characters | admin, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [CustomerDialogs.jsx](../admin/src/features/customers/CustomerDialogs.jsx) +2 |
| `minLength` | minimum number of characters | store: [AccountPage.jsx](../frontend/src/features/account/AccountPage.jsx), [ForgotPasswordPage.jsx](../frontend/src/features/auth/ForgotPasswordPage.jsx) +1 |
| `onBlur` | runs when focus leaves the element | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx) |
| `onChange` | runs on every change of an input | admin, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +26 |
| `onClick` | what happens on click/tap | admin, store: [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx), [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx) +37 |
| `onClose` | runs when the dialog closes | admin, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [CustomerDialogs.jsx](../admin/src/features/customers/CustomerDialogs.jsx) +4 |
| `onFocus` | runs when the element gets keyboard focus | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx), [SearchBox.jsx](../frontend/src/features/catalog/components/SearchBox.jsx) |
| `onKeyDown` | runs when a key is pressed | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx), [SearchBox.jsx](../frontend/src/features/catalog/components/SearchBox.jsx) |
| `onMouseDown` | mouse button pressed (fires before focus moves) | store: [SearchBox.jsx](../frontend/src/features/catalog/components/SearchBox.jsx) |
| `onMouseEnter` | the pointer moved over the element | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx), [SearchBox.jsx](../frontend/src/features/catalog/components/SearchBox.jsx) +1 |
| `onMouseLeave` | the pointer left the element | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx), [ReviewForm.jsx](../frontend/src/features/reviews/ReviewForm.jsx) |
| `onSubmit` | runs when the form is sent (Enter or submit button) | admin, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx) +14 |
| `onTouchEnd` | the finger lifted | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx) |
| `onTouchStart` | a finger touched the screen | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx) |
| `placeholder` | grey hint text inside an empty input | admin, store: [ContentField.jsx](../admin/src/features/content/ContentField.jsx), [CustomerDialogs.jsx](../admin/src/features/customers/CustomerDialogs.jsx) +13 |
| `playsInline` | play inside the page, not full screen (iPhone) | store: [PhotoPicker.jsx](../frontend/src/components/ui/PhotoPicker.jsx) |
| `ref` | after drawing, put this element into a useRef box (.current) | admin, store: [ServerErrorDialog.jsx](../admin/src/components/layout/ServerErrorDialog.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +6 |
| `required` | the browser won't submit the form while this is empty | admin, store: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +9 |
| `role` | tells screen readers what this element is (status, tab, group...) | admin, store: [ContentPage.jsx](../admin/src/features/content/ContentPage.jsx), [CustomersPage.jsx](../admin/src/features/customers/CustomersPage.jsx) +12 |
| `sandbox` | limits what the iframe's content may do | store: [GuidePage.jsx](../frontend/src/features/guide/GuidePage.jsx) |
| `sizes` | how wide the image will be drawn, so srcSet can pick a size | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx) |
| `srcDoc` | HTML to show inside the iframe | store: [GuidePage.jsx](../frontend/src/features/guide/GuidePage.jsx) |
| `srcSet` | several image sizes; the browser downloads the best one for the screen | store: [HeroCarousel.jsx](../frontend/src/features/catalog/components/HeroCarousel.jsx) |

## Redux Toolkit (admin state)

| Keyword | Meaning | Used in |
|---|---|---|
| `configureStore` | create the Redux store: one global object holding the app's shared state | admin: [store.js](../admin/src/app/store.js) |
| `createSlice` | one part of the Redux state + the functions (reducers) that change it | admin: [authSlice.js](../admin/src/features/auth/authSlice.js) |
| `dispatch` | send an action to the store (the only way to change Redux state) | admin: [api.js](../admin/src/app/api.js), [authApi.js](../admin/src/features/auth/authApi.js) +1 |
| `getState` | read the whole Redux state right now | admin: [api.js](../admin/src/app/api.js), [download.js](../admin/src/lib/download.js) |
| `initialState` | the state before anything has happened | admin: [authSlice.js](../admin/src/features/auth/authSlice.js) |
| `middleware` | code that runs on every action before it reaches the reducers | admin: [store.js](../admin/src/app/store.js) |
| `payload` | the data that travels with an action | admin: [authSlice.js](../admin/src/features/auth/authSlice.js), [RankedBars.jsx](../admin/src/features/dashboard/RankedBars.jsx) +1 |
| `Provider` | makes the Redux store available to every component inside it | admin: [main.jsx](../admin/src/main.jsx) |
| `reducers` | functions that take the old state + an action and make the new state | admin: [authSlice.js](../admin/src/features/auth/authSlice.js) |
| `useAppDispatch` | our useDispatch (app/hooks.js) | admin: [hooks.js](../admin/src/app/hooks.js) |
| `useAppSelector` | our useSelector (app/hooks.js) | admin: [hooks.js](../admin/src/app/hooks.js), [AdminLayout.jsx](../admin/src/components/layout/AdminLayout.jsx) +2 |
| `useDispatch` | gives dispatch() to send actions from a component | admin: [hooks.js](../admin/src/app/hooks.js) |
| `useSelector` | read a value from the Redux store; redraws when it changes | admin: [hooks.js](../admin/src/app/hooks.js) |

## RTK Query (admin data fetching)

RTK Query **generates a hook for every endpoint** (30 in the admin portal): `getOrders` -> `useGetOrdersQuery`, `blockCustomer` -> `useBlockCustomerMutation`. A `...Query` hook gives `{ data, isLoading, isFetching, error }` and caches the answer; a `...Mutation` hook gives `[trigger, { isLoading }]` and calling `trigger` sends the change.

| Keyword | Meaning | Used in |
|---|---|---|
| `.unwrap()` | turn the mutation result into a normal Promise: returns data or throws the error | admin: [LoginPage.jsx](../admin/src/features/auth/LoginPage.jsx), [ContentField.jsx](../admin/src/features/content/ContentField.jsx) +6 |
| `api.util.resetApiState` | empty the whole API cache (e.g. on logout) | admin: [authApi.js](../admin/src/features/auth/authApi.js) |
| `baseQuery` | the function every endpoint uses to send its request | admin: [api.js](../admin/src/app/api.js) |
| `build.mutation` | define a CHANGE request (POST/PATCH/DELETE): turned into a useXxxMutation hook | admin: [authApi.js](../admin/src/features/auth/authApi.js), [contentApi.js](../admin/src/features/content/contentApi.js) +3 |
| `build.query` | define a READ request: cached, and turned into a useXxxQuery hook | admin: [analyticsApi.js](../admin/src/features/analytics/analyticsApi.js), [contentApi.js](../admin/src/features/content/contentApi.js) +3 |
| `createApi` | describe the API once; RTK Query generates the hooks, cache and loading states | admin: [api.js](../admin/src/app/api.js) |
| `endpoints` | the list of requests this API can make | admin: [api.js](../admin/src/app/api.js), [analyticsApi.js](../admin/src/features/analytics/analyticsApi.js) +5 |
| `fetchBaseQuery` | a small fetch wrapper: base URL, headers, JSON in/out | admin: [api.js](../admin/src/app/api.js) |
| `injectEndpoints` | add endpoints to the shared API from a feature file | admin: [analyticsApi.js](../admin/src/features/analytics/analyticsApi.js), [authApi.js](../admin/src/features/auth/authApi.js) +4 |
| `invalidatesTags` | after this change, refetch every query with these labels | admin: [contentApi.js](../admin/src/features/content/contentApi.js), [customersApi.js](../admin/src/features/customers/customersApi.js) +2 |
| `isSuccess` | the request finished fine | admin: [ProductEditPage.jsx](../admin/src/features/products/ProductEditPage.jsx) |
| `keepUnusedDataFor` | seconds to keep cache nobody is using | admin: [productsApi.js](../admin/src/features/products/productsApi.js) |
| `pollingInterval` | ask the server again every N ms | admin: [CustomersPage.jsx](../admin/src/features/customers/CustomersPage.jsx), [DashboardPage.jsx](../admin/src/features/dashboard/DashboardPage.jsx) |
| `prepareHeaders` | add headers (e.g. the login token) to every request | admin: [api.js](../admin/src/app/api.js) |
| `providesTags` | label this cached data (e.g. Order 5) so it can be refreshed later | admin: [analyticsApi.js](../admin/src/features/analytics/analyticsApi.js), [contentApi.js](../admin/src/features/content/contentApi.js) +3 |
| `query` | build the request (URL, method, body) from the hook's argument | admin: [analyticsApi.js](../admin/src/features/analytics/analyticsApi.js), [authApi.js](../admin/src/features/auth/authApi.js) +4 |
| `reducerPath` | where this API's cache lives inside the Redux state | admin: [api.js](../admin/src/app/api.js), [store.js](../admin/src/app/store.js) |
| `tagTypes` | the names of data kinds, used to know which cache to refresh | admin: [api.js](../admin/src/app/api.js) |
| `transformResponse` | reshape the server answer before it is cached | admin: [analyticsApi.js](../admin/src/features/analytics/analyticsApi.js), [contentApi.js](../admin/src/features/content/contentApi.js) +2 |
| `useSyncExternalStore` | let React read a store that lives outside React | admin: [server-error.js](../admin/src/lib/server-error.js) |

## Charts (recharts)

| Keyword | Meaning | Used in |
|---|---|---|
| `Bar` | one bar series (dataKey = which field to draw) | admin: [RankedBars.jsx](../admin/src/features/dashboard/RankedBars.jsx) |
| `BarChart` | a chart of bars | admin: [RankedBars.jsx](../admin/src/features/dashboard/RankedBars.jsx) |
| `CartesianGrid` | the background grid lines | admin: [SalesChart.jsx](../admin/src/features/dashboard/SalesChart.jsx) |
| `dataKey` | which field of each data item this part uses | admin: [RankedBars.jsx](../admin/src/features/dashboard/RankedBars.jsx), [SalesChart.jsx](../admin/src/features/dashboard/SalesChart.jsx) |
| `LabelList` | value labels written on the bars | admin: [RankedBars.jsx](../admin/src/features/dashboard/RankedBars.jsx) |
| `Line` | one line series (dataKey = which field to draw) | admin: [SalesChart.jsx](../admin/src/features/dashboard/SalesChart.jsx) |
| `LineChart` | a chart of lines over the x axis | admin: [SalesChart.jsx](../admin/src/features/dashboard/SalesChart.jsx) |
| `ResponsiveContainer` | the chart fills its parent's width and height | admin: [RankedBars.jsx](../admin/src/features/dashboard/RankedBars.jsx), [SalesChart.jsx](../admin/src/features/dashboard/SalesChart.jsx) |
| `Tooltip` | the box with values shown on hover | admin: [RankedBars.jsx](../admin/src/features/dashboard/RankedBars.jsx), [SalesChart.jsx](../admin/src/features/dashboard/SalesChart.jsx) |
| `XAxis` | the horizontal axis | admin: [RankedBars.jsx](../admin/src/features/dashboard/RankedBars.jsx), [SalesChart.jsx](../admin/src/features/dashboard/SalesChart.jsx) |
| `YAxis` | the vertical axis | admin: [RankedBars.jsx](../admin/src/features/dashboard/RankedBars.jsx), [SalesChart.jsx](../admin/src/features/dashboard/SalesChart.jsx) |

## Node.js

| Keyword | Meaning | Used in |
|---|---|---|
| `console.log / warn / error` | print to the server log | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +11 |
| `createHash` | make a one-way fingerprint (hash) of data, e.g. SHA-256 | API: [cloudinary.js](../backend/src/lib/cloudinary.js), [guide.routes.js](../backend/src/modules/guide/guide.routes.js) |
| `createHmac` | a hash with a secret key: proves the data came from us | API: [password-reset.js](../backend/src/modules/auth/password-reset.js) |
| `execSync` | run a terminal command and wait for it | API: [global-setup.js](../backend/tests/api/global-setup.js) |
| `process` | the running Node program (process.env = settings, process.exit = stop) | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +4 |
| `process.env` | settings from the environment (.env locally, the dashboard on Render) | API: [env.js](../backend/src/config/env.js), [global-setup.js](../backend/tests/api/global-setup.js) +1 |
| `process.exit` | stop the program (0 = ok, 1 = error) | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +2 |
| `process.on` | react to a program event (e.g. SIGTERM = the host is stopping us) | API: [server.js](../backend/src/server.js) |
| `process.stdout` | the terminal output | API: [seed-orders.js](../backend/prisma/seed-orders.js) |
| `randomBytes` | cryptographically secure random bytes (for tokens) | API: [customers.service.js](../backend/src/modules/admin/customers/customers.service.js), [invoice.js](../backend/src/modules/orders/invoice.js) |
| `randomInt` | a secure random whole number (for codes) | API: [password-reset.js](../backend/src/modules/auth/password-reset.js) |
| `randomUUID` | a random unique id, e.g. "3b241101-e2bb-..." | API: [helpers.js](../backend/tests/api/helpers.js) |
| `readFileSync` | read a whole file from disk (blocks until done; fine at startup) | API: [guide.routes.js](../backend/src/modules/guide/guide.routes.js), [global-setup.js](../backend/tests/api/global-setup.js) +1 |
| `timingSafeEqual` | compare secrets in constant time (no timing leaks) | API: [password-reset.js](../backend/src/modules/auth/password-reset.js), [guide.routes.js](../backend/src/modules/guide/guide.routes.js) |

## Express

| Keyword | Meaning | Used in |
|---|---|---|
| `.delete(path, ...)` | handle DELETE requests (remove) | API: [customers.routes.js](../backend/src/modules/admin/customers/customers.routes.js), [products.routes.js](../backend/src/modules/admin/products/products.routes.js) +4 |
| `.get(path, ...handlers)` | handle GET requests (read) to this path | API: [app.js](../backend/src/app.js), [analytics.routes.js](../backend/src/modules/admin/analytics/analytics.routes.js) +12 |
| `.listen(port)` | start the HTTP server on this port | API: [server.js](../backend/src/server.js) |
| `.patch(path, ...)` | handle PATCH requests (change some fields) | API: [orders.routes.js](../backend/src/modules/admin/orders/orders.routes.js), [products.routes.js](../backend/src/modules/admin/products/products.routes.js) +2 |
| `.post(path, ...)` | handle POST requests (create / do something) | API: [app.js](../backend/src/app.js), [customers.routes.js](../backend/src/modules/admin/customers/customers.routes.js) +7 |
| `.put(path, ...)` | handle PUT requests (set to this value; repeat-safe) | API: [profile.routes.js](../backend/src/modules/profile/profile.routes.js), [reviews.routes.js](../backend/src/modules/reviews/reviews.routes.js) +1 |
| `.use` | add middleware (runs for every request) or mount a router under a path | API: [app.js](../backend/src/app.js), [admin.routes.js](../backend/src/modules/admin/admin.routes.js) +4 |
| `app.set` | an Express setting ('trust proxy' = believe Render's proxy about the client IP) | API: [app.js](../backend/src/app.js) |
| `cookieParser` | reads cookies into req.cookies | API: [app.js](../backend/src/app.js) |
| `cors` | which other websites may call this API from a browser | API: [app.js](../backend/src/app.js) |
| `express` | the web framework: receives HTTP requests and sends responses | API: [app.js](../backend/src/app.js) |
| `express.json` | middleware: read JSON request bodies into req.body | API: [app.js](../backend/src/app.js) |
| `express.raw` | keep the body as raw bytes (Stripe needs them to check the signature) | API: [app.js](../backend/src/app.js) |
| `helmet` | adds security headers to every response | API: [app.js](../backend/src/app.js) |
| `next()` | pass to the next middleware; next(error) = jump to the error handler | API: [auth.js](../backend/src/middleware/auth.js), [validate.js](../backend/src/middleware/validate.js) +1 |
| `req.body` | the JSON sent with POST/PUT/PATCH | API: [stripe-webhook.js](../backend/src/modules/webhooks/stripe-webhook.js) |
| `req.cookies` | the cookies the browser sent | API: [auth.controller.js](../backend/src/modules/auth/auth.controller.js) |
| `req.get(name)` | read one request header | API: [orders.controller.js](../backend/src/modules/orders/orders.controller.js) |
| `req.headers` | the request headers | API: [auth.js](../backend/src/middleware/auth.js), [stripe-webhook.js](../backend/src/modules/webhooks/stripe-webhook.js) |
| `req.ip` | the client's IP address | API: [auth.controller.js](../backend/src/modules/auth/auth.controller.js) |
| `req.method` | GET, POST... | API: [error-handler.js](../backend/src/middleware/error-handler.js) |
| `req.path` | the URL path | API: [error-handler.js](../backend/src/middleware/error-handler.js) |
| `res.clearCookie` | tell the browser to delete the cookie | API: [auth.controller.js](../backend/src/modules/auth/auth.controller.js) |
| `res.cookie` | send a cookie for the browser to store | API: [auth.controller.js](../backend/src/modules/auth/auth.controller.js) |
| `res.json` | send this object as JSON (status 200 unless set) | API: [app.js](../backend/src/app.js), [analytics.controller.js](../backend/src/modules/admin/analytics/analytics.controller.js) +14 |
| `res.locals` | data for this one request (the validated input, the logged-in user) | API: [auth.js](../backend/src/middleware/auth.js), [validate.js](../backend/src/middleware/validate.js) +14 |
| `res.locals.user` | the logged-in user (set by requireAuth from the access token) | API: [auth.js](../backend/src/middleware/auth.js), [customers.controller.js](../backend/src/modules/admin/customers/customers.controller.js) +8 |
| `res.set` | set a response header | API: [auth.controller.js](../backend/src/modules/auth/auth.controller.js), [guide.routes.js](../backend/src/modules/guide/guide.routes.js) +1 |
| `res.status(code)` | set the HTTP status code (201 created, 404...) | API: [cloudinary.js](../backend/src/lib/cloudinary.js), [send-pdf.js](../backend/src/lib/send-pdf.js) +8 |
| `Router` | a group of routes mounted under one path (e.g. /api/cart) | API: [admin.routes.js](../backend/src/modules/admin/admin.routes.js), [analytics.routes.js](../backend/src/modules/admin/analytics/analytics.routes.js) +13 |

## Prisma

`prisma.<model>` is one database table (a `model` in `backend/prisma/schema.prisma`). Used in the code: `address`, `cartItem`, `category`, `coupon`, `invoiceCounter`, `order`, `orderItem`, `passwordResetCode`, `processedWebhookEvent`, `product`, `productVariant`, `refreshToken`, `review`, `stockReservation`, `user`, `wishlistItem`. Inside `prisma.$transaction(async (tx) => ...)` the same tables are reached through `tx`, so every query joins the transaction.

| Keyword | Meaning | Used in |
|---|---|---|
| `_avg` | Prisma: average of a column | API: [reviews.service.js](../backend/src/modules/reviews/reviews.service.js) |
| `_count` | Prisma: count rows (or related rows) | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [customers.service.js](../backend/src/modules/admin/customers/customers.service.js) +4 |
| `_sum` | Prisma: add up a column | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [customers.service.js](../backend/src/modules/admin/customers/customers.service.js) |
| `aggregate` | sums/averages/counts over rows | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [products.service.js](../backend/src/modules/admin/products/products.service.js) +1 |
| `by` | Prisma groupBy: the columns to group on | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [customers.service.js](../backend/src/modules/admin/customers/customers.service.js) +2 |
| `contains` | Prisma: text includes this (SQL LIKE %x%) | API: [customers.service.js](../backend/src/modules/admin/customers/customers.service.js), [orders.service.js](../backend/src/modules/admin/orders/orders.service.js) +1 |
| `count` | how many rows match | API: [seed.js](../backend/prisma/seed.js), [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js) +8 |
| `create` | insert one new row (INSERT) | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +10 |
| `createMany` | insert many rows in one go | API: [seed.js](../backend/prisma/seed.js) |
| `data` | Prisma: the values to write | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +16 |
| `decrement` | Prisma: subtract from the number in the database | API: [orders.service.js](../backend/src/modules/orders/orders.service.js) |
| `delete` | remove one row by a unique field (DELETE) | API: [customers.service.js](../backend/src/modules/admin/customers/customers.service.js), [products.service.js](../backend/src/modules/admin/products/products.service.js) +1 |
| `deleteMany` | remove every row that matches; no error if none | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +7 |
| `distinct` | Prisma: drop duplicate rows by these columns | API: [search.js](../backend/src/modules/catalog/search.js) |
| `findFirst` | read the first row that matches (null if none) | API: [customers.service.js](../backend/src/modules/admin/customers/customers.service.js), [password-reset.js](../backend/src/modules/auth/password-reset.js) +6 |
| `findMany` | read many rows (SELECT ... WHERE) | API: [seed-orders.js](../backend/prisma/seed-orders.js), [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js) +10 |
| `findUnique` | read one row by a unique field (id, email); null if missing | API: [seed-orders.js](../backend/prisma/seed-orders.js), [account-status.js](../backend/src/lib/account-status.js) +12 |
| `findUniqueOrThrow` | like findUnique, but throws if the row is missing | API: [products.service.js](../backend/src/modules/admin/products/products.service.js), [order-emails.js](../backend/src/modules/orders/order-emails.js) +3 |
| `groupBy` | totals per group (GROUP BY) | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [customers.service.js](../backend/src/modules/admin/customers/customers.service.js) +2 |
| `gt` | greater than (>) | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [password-reset.js](../backend/src/modules/auth/password-reset.js) |
| `gte` | greater than or equal (>=) | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [customers.service.js](../backend/src/modules/admin/customers/customers.service.js) +3 |
| `in` | Prisma: the value is one of this list | API: [seed-orders.js](../backend/prisma/seed-orders.js), [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js) +6 |
| `include` | Prisma: also load the related rows (a JOIN) | API: [orders.service.js](../backend/src/modules/admin/orders/orders.service.js), [products.service.js](../backend/src/modules/admin/products/products.service.js) +10 |
| `increment` | Prisma: add to the number in the database (safe with many users) | API: [orders.service.js](../backend/src/modules/admin/orders/orders.service.js), [products.service.js](../backend/src/modules/admin/products/products.service.js) +1 |
| `lt` | less than (<) | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [orders.service.js](../backend/src/modules/orders/orders.service.js) |
| `lte` | less than or equal (<=) | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [products.service.js](../backend/src/modules/admin/products/products.service.js) +1 |
| `mode` | Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment | API: [customers.service.js](../backend/src/modules/admin/customers/customers.service.js), [orders.service.js](../backend/src/modules/admin/orders/orders.service.js) +4 |
| `not` | Prisma: is not this value | API: [customers.service.js](../backend/src/modules/admin/customers/customers.service.js), [catalog.service.js](../backend/src/modules/catalog/catalog.service.js) |
| `OR` | Prisma: any of these conditions | API: [customers.service.js](../backend/src/modules/admin/customers/customers.service.js), [orders.service.js](../backend/src/modules/admin/orders/orders.service.js) +1 |
| `orderBy` | Prisma: sort order (asc / desc) | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [customers.service.js](../backend/src/modules/admin/customers/customers.service.js) +9 |
| `prisma.$disconnect` | close the database connections | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +3 |
| `prisma.$executeRaw` | run a hand-written SQL command | API: [seed-orders.js](../backend/prisma/seed-orders.js), [orders.service.js](../backend/src/modules/orders/orders.service.js) +1 |
| `prisma.$executeRawUnsafe` | run SQL text as-is (only with trusted text!) | API: [global-setup.js](../backend/tests/api/global-setup.js) |
| `prisma.$queryRaw` | run hand-written SQL (values are escaped safely) | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [search.js](../backend/src/modules/catalog/search.js) +3 |
| `prisma.$transaction` | run several queries as ONE unit: all succeed or none are saved | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [customers.service.js](../backend/src/modules/admin/customers/customers.service.js) +8 |
| `select` | Prisma: return only these columns | API: [seed-orders.js](../backend/prisma/seed-orders.js), [account-status.js](../backend/src/lib/account-status.js) +15 |
| `skip` | Prisma: skip the first N rows (OFFSET, for pages) | API: [customers.service.js](../backend/src/modules/admin/customers/customers.service.js), [orders.service.js](../backend/src/modules/admin/orders/orders.service.js) +3 |
| `some` | Prisma: at least one related row matches | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [products.service.js](../backend/src/modules/admin/products/products.service.js) +1 |
| `startsWith` | Prisma: text begins with this | API: [search.js](../backend/src/modules/catalog/search.js) |
| `take` | Prisma: at most N rows (LIMIT) | API: [analytics.service.js](../backend/src/modules/admin/analytics/analytics.service.js), [customers.service.js](../backend/src/modules/admin/customers/customers.service.js) +6 |
| `update` | change one row found by a unique field (UPDATE) | API: [activity.js](../backend/src/lib/activity.js), [customers.service.js](../backend/src/modules/admin/customers/customers.service.js) +11 |
| `updateMany` | change every row that matches; returns { count } | API: [orders.service.js](../backend/src/modules/admin/orders/orders.service.js), [products.service.js](../backend/src/modules/admin/products/products.service.js) +2 |
| `upsert` | update the row if it exists, otherwise create it | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +3 |
| `where` | Prisma filter: which rows | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +23 |

## Zod (validation)

| Keyword | Meaning | Used in |
|---|---|---|
| `.default` | the value used when it's left out | API: [env.js](../backend/src/config/env.js), [analytics.schema.js](../backend/src/modules/admin/analytics/analytics.schema.js) +6 |
| `.int` | must be a whole number | API: [env.js](../backend/src/config/env.js), [analytics.schema.js](../backend/src/modules/admin/analytics/analytics.schema.js) +6 |
| `.max` | at most this many (characters, or this value) | API: [env.js](../backend/src/config/env.js), [analytics.schema.js](../backend/src/modules/admin/analytics/analytics.schema.js) +11 |
| `.min` | at least this many (characters, or this value) | API: [env.js](../backend/src/config/env.js), [analytics.schema.js](../backend/src/modules/admin/analytics/analytics.schema.js) +12 |
| `.nullable` | may be null | API: [products.schema.js](../backend/src/modules/admin/products/products.schema.js), [profile.schema.js](../backend/src/modules/profile/profile.schema.js) |
| `.omit` | the same object without these fields | API: [products.schema.js](../backend/src/modules/admin/products/products.schema.js) |
| `.optional` | may be left out | API: [env.js](../backend/src/config/env.js), [customers.schema.js](../backend/src/modules/admin/customers/customers.schema.js) +5 |
| `.partial` | every field becomes optional (for "update some fields") | API: [products.schema.js](../backend/src/modules/admin/products/products.schema.js) |
| `.refine` | a custom check written as a function | API: [analytics.schema.js](../backend/src/modules/admin/analytics/analytics.schema.js), [products.schema.js](../backend/src/modules/admin/products/products.schema.js) +2 |
| `.regex` | must match this pattern | API: [env.js](../backend/src/config/env.js), [auth.schema.js](../backend/src/modules/auth/auth.schema.js) +2 |
| `.toLowerCase` | convert to small letters (emails) | API: [auth.schema.js](../backend/src/modules/auth/auth.schema.js) |
| `.transform` | change the value after it passed the checks | API: [env.js](../backend/src/config/env.js), [products.schema.js](../backend/src/modules/admin/products/products.schema.js) +1 |
| `.trim` | remove spaces at both ends before checking | API: [customers.schema.js](../backend/src/modules/admin/customers/customers.schema.js), [orders.schema.js](../backend/src/modules/admin/orders/orders.schema.js) +7 |
| `result.data` | the checked (cleaned, converted) data | API: [validate.js](../backend/src/middleware/validate.js) |
| `result.error` | what was wrong (Zod) | API: [validate.js](../backend/src/middleware/validate.js) |
| `result.success` | did the Zod check pass? | API: [validate.js](../backend/src/middleware/validate.js) |
| `z.array` | a list of items of this type | API: [products.schema.js](../backend/src/modules/admin/products/products.schema.js) |
| `z.boolean` | must be true/false | API: [orders.schema.js](../backend/src/modules/admin/orders/orders.schema.js), [products.schema.js](../backend/src/modules/admin/products/products.schema.js) +1 |
| `z.coerce` | convert first (e.g. "5" from the URL -> 5), then check | API: [env.js](../backend/src/config/env.js), [analytics.schema.js](../backend/src/modules/admin/analytics/analytics.schema.js) +6 |
| `z.email` | must look like an email address | API: [env.js](../backend/src/config/env.js), [auth.schema.js](../backend/src/modules/auth/auth.schema.js) |
| `z.enum` | must be one of these values | API: [env.js](../backend/src/config/env.js), [customers.schema.js](../backend/src/modules/admin/customers/customers.schema.js) +4 |
| `z.number` | must be a number | API: [env.js](../backend/src/config/env.js), [analytics.schema.js](../backend/src/modules/admin/analytics/analytics.schema.js) +6 |
| `z.object` | an object with these fields | API: [env.js](../backend/src/config/env.js), [analytics.schema.js](../backend/src/modules/admin/analytics/analytics.schema.js) +13 |
| `z.record` | an object with any keys, values of this type | API: [products.schema.js](../backend/src/modules/admin/products/products.schema.js) |
| `z.string` | must be text | API: [env.js](../backend/src/config/env.js), [customers.schema.js](../backend/src/modules/admin/customers/customers.schema.js) +12 |
| `z.unknown` | anything (checked later) | API: [products.schema.js](../backend/src/modules/admin/products/products.schema.js) |
| `z.url` | must be a valid URL | API: [products.schema.js](../backend/src/modules/admin/products/products.schema.js), [profile.schema.js](../backend/src/modules/profile/profile.schema.js) |

## Auth & security

| Keyword | Meaning | Used in |
|---|---|---|
| `bcrypt.compare` | does this password match the stored hash? | API: [auth.service.js](../backend/src/modules/auth/auth.service.js) |
| `bcrypt.hash` | turn the password into a salted hash (store this, never the password) | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +2 |
| `crypto.createHash` | a one-way fingerprint (hash) of data | API: [auth.tokens.js](../backend/src/modules/auth/auth.tokens.js) |
| `crypto.randomBytes` | cryptographically secure random bytes (for tokens) | API: [auth.tokens.js](../backend/src/modules/auth/auth.tokens.js) |
| `jwt.sign` | create a signed token with this data (only someone with the secret can make one) | API: [auth.tokens.js](../backend/src/modules/auth/auth.tokens.js) |
| `jwt.verify` | check the signature and expiry; throws if forged or expired | API: [auth.tokens.js](../backend/src/modules/auth/auth.tokens.js) |

## Cookies & tokens

| Keyword | Meaning | Used in |
|---|---|---|
| `expiresIn` | how long the token is valid (e.g. "15m") | API: [auth.tokens.js](../backend/src/modules/auth/auth.tokens.js) |
| `httpOnly` | JavaScript in the page can't read the cookie (stops token theft by XSS) | API: [auth.controller.js](../backend/src/modules/auth/auth.controller.js) |
| `maxAge` | how long the cookie lives (ms) | API: [auth.controller.js](../backend/src/modules/auth/auth.controller.js) |
| `path` | the cookie is only sent to URLs under this path | API: [auth.controller.js](../backend/src/modules/auth/auth.controller.js), [auth.schema.js](../backend/src/modules/auth/auth.schema.js) +1 |
| `sameSite` | when the browser sends the cookie with requests from other sites | API: [auth.controller.js](../backend/src/modules/auth/auth.controller.js) |
| `secure` | the cookie is only sent over HTTPS | API: [auth.controller.js](../backend/src/modules/auth/auth.controller.js) |

## Payments, PDF & email

| Keyword | Meaning | Used in |
|---|---|---|
| `doc.end` | finish the PDF | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `doc.fillColor` | colour for what follows | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `doc.font` | font for what follows | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `doc.heightOfString` | how tall this text will be | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `doc.image` | place an image on the PDF | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `doc.moveTo` | start a line here | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `doc.on` | react to PDF events (data chunks, end) | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `doc.text` | write text on the PDF | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `doc.y` | the current vertical position on the page | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `QRCode.toBuffer` | draw the QR code as PNG bytes | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `resend.emails.send` | send an email through Resend | API: [email.js](../backend/src/lib/email.js) |
| `stripe.checkout.sessions` | Stripe's hosted payment page | API: [payments.service.js](../backend/src/modules/payments/payments.service.js) |
| `stripe.coupons` | discounts on the Stripe side | API: [payments.service.js](../backend/src/modules/payments/payments.service.js) |
| `stripe.paymentIntents` | one payment attempt and its status | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `stripe.refunds` | give money back for a payment | API: [orders.service.js](../backend/src/modules/admin/orders/orders.service.js), [orders.service.js](../backend/src/modules/orders/orders.service.js) |
| `stripe.webhooks.constructEvent` | check the event really came from Stripe (signature) | API: [stripe-webhook.js](../backend/src/modules/webhooks/stripe-webhook.js) |

## Libraries

| Keyword | Meaning | Used in |
|---|---|---|
| `bcrypt` | slow, salted password hashing (hard to brute-force) | API: [seed-orders.js](../backend/prisma/seed-orders.js), [seed.js](../backend/prisma/seed.js) +2 |
| `jwt` | JSON Web Tokens: signed login tokens | API: [auth.tokens.js](../backend/src/modules/auth/auth.tokens.js) |
| `PDFDocument` | pdfkit: draws a PDF page by page | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `QRCode` | draws a QR code image | API: [invoice.js](../backend/src/modules/orders/invoice.js) |
| `Resend` | the email-sending service client | API: [email.js](../backend/src/lib/email.js) |
| `Stripe` | the payments service client | API: [stripe.js](../backend/src/lib/stripe.js) |
| `z` | Zod: describe the shape of data and check it | API: [env.js](../backend/src/config/env.js), [analytics.schema.js](../backend/src/modules/admin/analytics/analytics.schema.js) +13 |

## Testing

| Keyword | Meaning | Used in |
|---|---|---|
| `.expect` | supertest: fail if the response doesn't match | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +4 |
| `.not` | the opposite of the next check | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +1 |
| `.query` | add ?key=value to the URL | API: [customers.test.js](../backend/tests/api/customers.test.js), [protected.test.js](../backend/tests/api/protected.test.js) |
| `.send` | the JSON body of the request | API: [auth.test.js](../backend/tests/api/auth.test.js), [cart.test.js](../backend/tests/api/cart.test.js) +4 |
| `.set` | add a request header (e.g. Authorization: Bearer <token>) | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +4 |
| `.toBe` | exactly equal (===) | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +6 |
| `.toBeGreaterThan` | is a bigger number | API: [auth.test.js](../backend/tests/api/auth.test.js), [guide.test.js](../backend/tests/api/guide.test.js) +1 |
| `.toBeNull` | is null | API: [customers.test.js](../backend/tests/api/customers.test.js), [protected.test.js](../backend/tests/api/protected.test.js) |
| `.toBeUndefined` | is undefined | API: [auth.test.js](../backend/tests/api/auth.test.js), [customers.test.js](../backend/tests/api/customers.test.js) +1 |
| `.toContain` | the list/text contains this | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +2 |
| `.toContainEqual` | the list contains an item equal to this | API: [auth.test.js](../backend/tests/api/auth.test.js) |
| `.toEqual` | same contents (deep compare) | API: [auth.test.js](../backend/tests/api/auth.test.js), [customers.test.js](../backend/tests/api/customers.test.js) |
| `.toHaveLength` | has exactly N items | API: [cart.test.js](../backend/tests/api/cart.test.js), [customers.test.js](../backend/tests/api/customers.test.js) |
| `.toMatchObject` | has at least these properties | API: [auth.test.js](../backend/tests/api/auth.test.js), [customers.test.js](../backend/tests/api/customers.test.js) +1 |
| `.toThrow` | the function throws an error | API: [coupons.test.js](../backend/tests/unit/coupons.test.js) |
| `afterAll` | run once after all tests in this file | API: [setup.js](../backend/tests/api/setup.js) |
| `afterEach` | run after every test | API: [rate-limiter.test.js](../backend/tests/unit/rate-limiter.test.js) |
| `api.delete` | send a DELETE request into the app | API: [customers.test.js](../backend/tests/api/customers.test.js), [protected.test.js](../backend/tests/api/protected.test.js) |
| `api.get` | send a GET request into the app (no real server needed) | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +3 |
| `api.post` | send a POST request into the app | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +5 |
| `beforeAll` | run once before all tests in this file | API: [protected.test.js](../backend/tests/api/protected.test.js) |
| `beforeEach` | run before every test | API: [rate-limiter.test.js](../backend/tests/unit/rate-limiter.test.js) |
| `defineConfig` | the vitest/vite settings (with editor autocomplete) | API: [vitest.config.js](../backend/vitest.config.js) |
| `describe` | a group of related tests | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +6 |
| `expect(value)` | check a value; the test fails if the check is false | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +6 |
| `res.body` | the JSON the API answered | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +5 |
| `res.headers` | the response headers | API: [auth.test.js](../backend/tests/api/auth.test.js), [guide.test.js](../backend/tests/api/guide.test.js) +1 |
| `res.status` | the HTTP status code of the response | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +5 |
| `test` | one test | API: [access.test.js](../backend/tests/api/access.test.js), [auth.test.js](../backend/tests/api/auth.test.js) +6 |
| `vi` | vitest helpers: fake timers, mocks | API: [rate-limiter.test.js](../backend/tests/unit/rate-limiter.test.js) |
| `vi.advanceTimersByTime` | move the fake clock forward N ms | API: [rate-limiter.test.js](../backend/tests/unit/rate-limiter.test.js) |
| `vi.setSystemTime` | set the fake clock to this date | API: [rate-limiter.test.js](../backend/tests/unit/rate-limiter.test.js) |
| `vi.useFakeTimers` | fake clock: time only moves when the test says so | API: [rate-limiter.test.js](../backend/tests/unit/rate-limiter.test.js) |
| `vi.useRealTimers` | back to the real clock | API: [rate-limiter.test.js](../backend/tests/unit/rate-limiter.test.js) |

## ShopVerse helpers (store)

| Keyword | Meaning | Used in |
|---|---|---|
| `reportApiError` | open the error popup for this error (lib/api-error.js) | store: [notify.js](../frontend/src/lib/notify.js), [main.jsx](../frontend/src/main.jsx) |

## ShopVerse helpers (backend)

| Keyword | Meaning | Used in |
|---|---|---|
| `badRequest` | HttpError 400: the request is invalid | API: [http-error.js](../backend/src/lib/http-error.js), [validate.js](../backend/src/middleware/validate.js) +11 |
| `conflict` | HttpError 409: clashes with existing data (e.g. email taken) | API: [http-error.js](../backend/src/lib/http-error.js), [products.service.js](../backend/src/modules/admin/products/products.service.js) +2 |
| `env` | the checked settings from .env (config/env.js) | API: [app.js](../backend/src/app.js), [env.js](../backend/src/config/env.js) +15 |
| `forbidden` | HttpError 403: logged in, but not allowed | API: [account-status.js](../backend/src/lib/account-status.js), [http-error.js](../backend/src/lib/http-error.js) +6 |
| `HttpError` | an error with an HTTP status; the error handler sends it as JSON | API: [cloudinary.js](../backend/src/lib/cloudinary.js), [http-error.js](../backend/src/lib/http-error.js) +3 |
| `notFound` | HttpError 404: doesn't exist | API: [http-error.js](../backend/src/lib/http-error.js), [customers.service.js](../backend/src/modules/admin/customers/customers.service.js) +11 |
| `requireAuth` | middleware: needs a valid access token; puts the user on res.locals.user | API: [auth.js](../backend/src/middleware/auth.js), [admin.routes.js](../backend/src/modules/admin/admin.routes.js) +8 |
| `requireRole` | middleware: the user must have this role (e.g. ADMIN) | API: [auth.js](../backend/src/middleware/auth.js), [admin.routes.js](../backend/src/modules/admin/admin.routes.js) |
| `tooManyRequests` | HttpError 429: slow down (rate limit) | API: [http-error.js](../backend/src/lib/http-error.js), [auth.controller.js](../backend/src/modules/auth/auth.controller.js) +1 |
| `unauthorized` | HttpError 401: not logged in / bad token | API: [http-error.js](../backend/src/lib/http-error.js), [auth.js](../backend/src/middleware/auth.js) +2 |
| `validate(schema, part)` | check req.body/query/params with Zod; result in res.locals | API: [validate.js](../backend/src/middleware/validate.js), [analytics.routes.js](../backend/src/modules/admin/analytics/analytics.routes.js) +13 |
