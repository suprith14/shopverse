# Admin App (`admin/`)

**Status:** ✅ Done (Phase 5): login, products, orders and the analytics dashboard.

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

Created with `npm create vite@latest admin -- --template react-ts`, then converted to plain JavaScript (see the change log, 2026-10-17).

## Structure

```
admin/src/
├── app/
│   ├── store.js        Redux store: { auth, api }
│   ├── api.js          RTK Query base: token header, single-flight refresh on 401, admin-only sessions
│   └── hooks.js        useAppSelector / useAppDispatch (the store hooks used everywhere)
├── features/
│   ├── auth/           authSlice (state + reducers), authApi (login/logout/restore), LoginPage, RequireAdmin
│   ├── products/       productsApi, ProductsPage (list), ProductEditPage (+ create), ProductForm, VariantsManager
│   ├── orders/         ordersApi, OrdersPage (list), OrderDetailPage, OrderStatusBadge, orderStatus
│   ├── analytics/      analyticsApi (one query per dashboard widget)
│   └── dashboard/      DashboardPage, StatTile, SalesChart, RankedBars, chartTheme
├── components/         layout (sidebar layout, 404) + ui (Button, Input, loading/error/empty states)
├── lib/                format (money, dates, order numbers, RTK errors), useDebounce
├── router.jsx          routes; everything except /login is wrapped in <RequireAdmin>
├── App.jsx             restores the session on load
└── main.jsx            <Provider store={store}>
```

## Redux in this app

- **`authSlice`** holds `{ user, accessToken, status }`. Actions: `sessionStarted`, `sessionEnded`.
  The access token stays in memory only. A reload restores it from the httpOnly refresh cookie.
- **RTK Query** (`app/api.js`): endpoints are declared per feature with `api.injectEndpoints`, and each
  becomes a hook (`useGetProductsQuery`, `useAdjustStockMutation`, …).
- **`baseQueryWithReauth`**: on a 401 it refreshes the token **once** (all failing requests wait for the
  same refresh), then retries. A refreshed session that isn't `ADMIN` (e.g. a customer logged into the store
  tab, since cookies are shared on localhost) is treated as logged out.
- **Cache tags:** lists provide `Product:LIST`, single products provide `Product:<id>`. Mutations
  invalidate the tags they change, and stock/price changes also invalidate `Analytics`. RTK Query then refetches whatever is on screen.

## Login

Only `ADMIN` accounts can use the app. A customer with the right password sees "This account is not
an admin", and that session is ended immediately. Session restore runs once on load (`App.jsx`).

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

## Orders (`/orders`, `/orders/:id`)

- **List:** status tabs with live counts (`Paid · to ship` first: that's the work queue), search by order number
  (`#RHXB9NEJ`), customer name or email (debounced), filters in the URL, pages of 20.
- **Order page:**
  - progress tracker **Paid → Shipped → Delivered**
  - **only the next allowed action** is shown: *Mark as shipped* on a paid order, *Mark as delivered* on a shipped one
  - **Refund** opens a confirmation panel with the amount and a *put items back in stock* option (only for returned, unused items)
  - items show the SKU and the **snapshot** name and price
  - the payment intent links to the Stripe dashboard
- Status changes and refunds invalidate the `Order` and `Analytics` tags (and `Product` for restocks), so lists, tab counts and stock refresh by themselves.

## Dashboard (`/`)

One period filter (**last 7 / 30 / 90 days**, kept in the URL as `?days=`) above everything. Six widgets load
**in parallel**, each from its own endpoint, and each shows its own loading state.

| Widget | Form | Why this form |
|---|---|---|
| Revenue, orders, average order value, customers who bought | **Stat tiles** with `+12% vs previous 30 days` | A headline number is best shown as a number, not a one-bar chart |
| Revenue / orders per day | **Line chart** with a Revenue/Orders switch, hover crosshair + tooltip, "View as table" | Change over time. Dollars and counts have different scales, so a switch is used instead of a misleading two-axis chart |
| Best sellers, revenue by category | **Horizontal bars**, one colour, value labels | "Which is biggest?" Horizontal keeps names readable. One colour, because the bars don't need different identities |
| **Customers** row: total, new (vs previous period), active now, active today (+ signed in) | Stat tiles. This query **polls every minute** (`pollingInterval`), because "active now" changes without any admin action | Headline numbers. RTK Query pauses polling when the dashboard isn't open |
| Orders needing attention | Counts linking to the filtered orders page | A to-do list, not a chart |
| Low stock | List with ⚠ icon + "3 left" / "Out of stock" | Action items, linked to the product page |

**Chart rules applied** (from the data-viz guidelines): the series colour `#2a78d6` was **validated** for lightness,
chroma and ≥ 3:1 contrast on the white cards. Colours are defined by role in `chartTheme.js`. Lines are 2 px with
no dots until hover. Bars are rounded only at the data end (4 px). Gridlines are faint and horizontal only.
Changes are shown with an **arrow + words**, never colour alone. There's no dual-axis chart, and there's a table view for exact numbers.

**Code splitting:** the dashboard route is loaded with React Router's `lazy`, so the chart library (Recharts,
~360 kB) is downloaded only when the dashboard opens. The other pages' bundle dropped from 798 kB to 441 kB.

**Demo data:** `npm run db:seed-orders` (in `backend/`) creates 40 demo customers and ~90 days of orders
from the real catalog (busier weekends, growth over time, some refunds, cancellations and coupons). It's
re-runnable, never touches real customers or stock, and demo orders have no Stripe payment, so they can't be refunded.

## Concepts to be able to explain

1. What's a Redux slice, an action and a reducer? What does Immer let you write?
2. How do RTK Query cache tags replace manual refetching?
3. Why does the reauth base query share one refresh promise?
4. Why is `RequireAdmin` not real security, and what is?
5. Why are filters kept in the URL instead of component state?
6. Why does the order page show only the next allowed action, when the backend checks it anyway?
7. Why is a dual-axis chart (revenue and orders on two y-scales) a bad idea, and what was done instead?
8. What is code splitting, and what did it change in the build output?
