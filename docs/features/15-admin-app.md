# Admin App (`admin/`)

**Status:** 🚧 In progress (Phase 5). Login and product management are done; orders and the dashboard come next.

A **separate React app** for staff, at `http://localhost:5174`, talking to the same backend as the
store. All admin API calls go to `/api/admin/*` (see [13-admin-api](./13-admin-api.md)).

## Why a separate app

| | Separate admin app (this) | Admin pages inside the store |
|---|---|---|
| Security | Admin code is never downloaded by customers | Hidden pages, but their code ships to everyone |
| Store speed | The store bundle stays small | Admin code makes the store bigger |
| Deploy | Admin and store update independently | One deploy for both |

The real protection is still the backend: every `/api/admin` route requires an `ADMIN` token.

## Tech stack

Same as the store **except state and data fetching**, so the project shows both approaches:

| Job | Store (`frontend/`) | Admin (`admin/`) |
|---|---|---|
| Global state | Zustand | **Redux Toolkit** |
| Loading data | TanStack Query + axios | **RTK Query** (part of Redux Toolkit) |
| Pages, styling, icons | React Router, Tailwind, lucide | same |
| Linting | (Phase 7) | **ESLint** |

Created with `npm create vite@latest admin -- --template react-ts`.

## Structure

```
admin/src/
├── app/
│   ├── store.ts        Redux store: { auth, api }
│   ├── api.ts          RTK Query base: token header, single-flight refresh on 401, admin-only sessions
│   └── hooks.ts        typed useAppSelector / useAppDispatch
├── features/
│   ├── auth/           authSlice (state + reducers), authApi (login/logout/restore), LoginPage, RequireAdmin
│   └── products/       productsApi, ProductsPage (list), ProductEditPage (+ create), ProductForm, VariantsManager
├── components/         layout (sidebar layout, 404) + ui (Button, Input, loading/error/empty states)
├── lib/                format (money, dates, order numbers, RTK errors), useDebounce
├── router.tsx          routes; everything except /login is wrapped in <RequireAdmin>
├── App.tsx             restores the session on load
└── main.tsx            <Provider store={store}>
```

## Redux in this app

- **`authSlice`** holds `{ user, accessToken, status }`. Actions: `sessionStarted`, `sessionEnded`.
  The access token stays in memory only. A reload restores it from the httpOnly refresh cookie.
- **RTK Query** (`app/api.ts`): endpoints are declared per feature with `api.injectEndpoints`, and each
  becomes a hook (`useGetProductsQuery`, `useAdjustStockMutation`, …).
- **`baseQueryWithReauth`**: on a 401 it refreshes the token **once** (all failing requests wait for the
  same refresh), then retries. A refreshed session that isn't `ADMIN` (e.g. a customer logged into the store
  tab, since cookies are shared on localhost) is treated as logged out.
- **Cache tags:** lists provide `Product:LIST`, single products provide `Product:<id>`. Mutations
  invalidate the tags they change, and stock/price changes also invalidate `Analytics`. RTK Query then refetches whatever is on screen.

## Login

Only `ADMIN` accounts can use the app. A customer with the right password sees "This account is not
an admin", and that session is ended immediately. Session restore runs once on load (`App.tsx`).

## Products (`/products`, `/products/new`, `/products/:id`)

- **List:** search (name, brand or **SKU**, debounced), category, status (active/hidden) and a
  "low stock only" filter. Filters live in the URL. The table shows image, brand, variant count, price from,
  total stock (⚠ when a variant is at 5 or fewer) and status. Pages of 20.
- **Create:** details + one or more variant rows (SKU, name, price in $, starting stock) in one form.
  Then it opens the new product's page.
- **Edit:** details form ("Visible in the store" = hide/show, never delete). Variants table:
  - rename / reprice a variant, with a **Save** button that appears only when something changed
  - **stock by delta**: type `10` → "Add 10", `-2` → "Remove 2"
  - delete a variant (the backend refuses if it was ever ordered, and the message is shown inline)
  - add a variant
- Prices are typed in dollars and sent in cents.

## Concepts to be able to explain

1. What's a Redux slice, an action and a reducer? What does Immer let you write?
2. How do RTK Query cache tags replace manual refetching?
3. Why does the reauth base query share one refresh promise?
4. Why is `RequireAdmin` not real security, and what is?
5. Why are filters kept in the URL instead of component state?
