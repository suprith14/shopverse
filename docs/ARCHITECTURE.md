# Architecture

ShopVerse is **three independent apps** that talk to one REST API:

```
┌──────────────────────────┐
│ frontend/  (the store)   │──┐
│ React · TanStack Query · │  │   HTTP / JSON
│ Zustand · Tailwind       │  │   Authorization: Bearer <token>    ┌─────────────────────────┐      ┌────────────┐
└──────────────────────────┘  ├─────────────────────────────────►  │ backend/ (Express API)  │ ───► │ PostgreSQL │
┌──────────────────────────┐  │   + refresh cookie                 │ Zod · Prisma · JWT      │      │  (Neon)    │
│ admin/   (staff panel)   │──┘                                    └─────────────────────────┘      └────────────┘
│ React · Redux Toolkit ·  │                                          Stripe · Resend · Cloudinary
│ RTK Query · Tailwind     │
└──────────────────────────┘
```

Each has its own `package.json`, dependencies and `.env`, and is deployed separately (store and admin on
Vercel, API on Render). See [DEPLOYMENT.md](DEPLOYMENT.md).

## Where do I find...?

| I want to change... | Go to |
|---|---|
| **Store text**: brand name, home page hero, headings, footer, notices | `frontend/src/content/site.js` |
| Start-up loader (store / admin) | `frontend/index.html` + `src/splash.css` (same in `admin/`) |
| Colours, fonts | `frontend/src/index.css` (Tailwind theme, `brand-*` colours) |
| Header / footer layout | `frontend/src/components/layout/Header.jsx`, `RootLayout.jsx` |
| A store page | `frontend/src/features/<feature>/<Name>Page.jsx`; URL → page list in `frontend/src/router.jsx` |
| Buttons, inputs, skeletons, empty/error states | `frontend/src/components/ui/` |
| Toast messages | `frontend/src/lib/notify.js` |
| Prices / dates formatting | `frontend/src/lib/format.js` |
| An admin page | `admin/src/features/<feature>/`; URL list in `admin/src/router.jsx` |
| An API endpoint (URL) | `backend/src/modules/<feature>/<feature>.routes.js` |
| What a request may contain (validation) | `backend/src/modules/<feature>/<feature>.schema.js` |
| Business rules (stock, coupons, prices...) | `backend/src/modules/<feature>/<feature>.service.js` |
| Admin-only API | `backend/src/modules/admin/` (products, orders, analytics) |
| Email text | `backend/src/modules/auth/auth-emails.js`, `backend/src/modules/orders/order-emails.js` |
| Invoice PDF layout | `backend/src/modules/orders/invoice.js` |
| Login rate limits | `backend/src/lib/rate-limiter.js` (the `limiters` at the bottom) |
| Settings / secrets | `backend/.env` (list of every option: `backend/.env.example`, checked in `src/config/env.js`) |
| Database tables | `backend/prisma/schema.prisma` (then `npm run db:migrate`) |
| Demo products and users | `backend/prisma/seed.js` |
| Tests | `backend/tests/unit/` (no database), `backend/tests/api/` (test database) |

**Search tip:** in VS Code, `Ctrl+P` opens a file by name (type `cart.service`), and `Ctrl+Shift+F` searches
every file for a piece of text you can see on the page.

## Same feature names everywhere

Every feature lives in a folder with the **same name** in the backend and the store (and the admin app where it
has one), so you can follow a feature end to end:

```
backend/src/modules/cart/          frontend/src/features/cart/
  cart.routes.js      URLs           cart.api.js     calls the API (TanStack Query hooks)
  cart.schema.js      validation     CartPage.jsx    the page
  cart.controller.js  HTTP
  cart.service.js     logic + DB
```

Features: `auth`, `catalog` (products, search), `cart`, `wishlist`, `coupons`, `orders` (checkout, invoices),
`payments` (Stripe), `webhooks`, `reviews`, `profile`/`account` (my account, addresses), `invoices` (public
verify page), `admin`.

## Backend: request lifecycle

```
Request
  → helmet / cors / json / cookie-parser   (global middleware, app.js)
  → router                                 (modules/<feature>/<feature>.routes.js)
  → requireAuth / requireRole              (middleware/auth.js, only on protected routes)
  → validate(schema)                       (middleware/validate.js → res.locals.body/query/params)
  → controller                             (reads validated input, sends response)
  → service                                (business rules + Prisma queries)
  → errorHandler                           (any thrown HttpError → JSON { error: { message } })
```

**Why three layers?**
- **Routes** say *which URL* runs *which code* and with *which guards*.
- **Controllers** only know about HTTP (status codes, cookies, JSON).
- **Services** only know about business logic and the database. They can be reused from a background job, a
  script or a test without any HTTP involved.

## Backend folders

```
backend/
├── prisma/
│   ├── schema.prisma      # the whole data model (read this first!)
│   ├── migrations/        # every change to the tables, in order
│   ├── seed.js            # demo products, users, coupons
│   └── seed-orders.js     # 90 days of demo sales for the dashboard
├── src/
│   ├── server.js          # starts the HTTP server + background job
│   ├── app.js             # builds the Express app, mounts every module's router
│   ├── config/env.js      # validated settings (.env)
│   ├── jobs/              # background work (cancel unpaid orders)
│   ├── lib/               # shared helpers: prisma, stripe, email, cloudinary, rate limiter, errors
│   ├── middleware/        # auth, validation, error handling
│   └── modules/           # one folder per feature (see above)
│       └── admin/         # every admin-only endpoint, one sub-folder per area
└── tests/
    ├── unit/              # pure logic, no database (fast)
    └── api/               # real HTTP requests against a test database
```

## Store folders (`frontend/src/`)

```
├── main.jsx            # entry: providers, removes the start-up loader
├── router.jsx          # every URL → page
├── content/site.js     # ✏️ the store's text (brand, home page, footer, notices)
├── lib/                # api-client (axios + silent token refresh), format, notify, small hooks
├── components/
│   ├── layout/         # header, root layout, page title, slow-server banner
│   └── ui/             # reusable buttons, inputs, skeletons, states, star rating
└── features/           # one folder per feature (mirrors the backend modules)
```

## Admin folders (`admin/src/`)

```
├── main.jsx            # entry: Redux provider
├── router.jsx          # every URL → page
├── app/                # Redux store + RTK Query base API (token refresh lives here)
├── lib/                # config, format, download
├── components/         # layout + ui (same idea as the store)
└── features/           # auth, dashboard (charts), products, orders; each with its RTK Query endpoints
```

## Frontend state: where does each piece of data live?

| Kind of state | Store | Admin | Example |
|---|---|---|---|
| Server data | TanStack Query cache | RTK Query cache | products, orders |
| Global client state | Zustand | Redux slice | logged-in user, access token |
| Shareable UI state | URL search params | URL search params | filters, sort, page, search |
| Local UI state | `useState` | `useState` | selected image, form inputs |

Keeping these separate is what keeps a React app understandable as it grows.

## Data model highlights

See [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma). It's commented throughout.

- **Money is stored in cents** (integers) to avoid floating-point errors.
- **Product vs ProductVariant**: price and stock live on the variant ("Size 9 / Black", "256GB").
- **OrderItem snapshots** the product name and price at purchase time; orders also snapshot the address.
- **StockReservation** holds stock while a customer pays; **ProcessedWebhookEvent** makes Stripe webhooks idempotent.
- **InvoiceCounter** gives gapless invoice numbers; **invoiceToken** is the secret behind the QR verify link.
