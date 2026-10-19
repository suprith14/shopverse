# ShopVerse

A full-stack e-commerce platform built as a portfolio project. It covers the problems real
online stores solve: secure authentication, product variants, payments, preventing
overselling, webhooks, full-text search, and an admin panel with analytics.

**Live demo:** [Store](https://shopverse-eta-ecru.vercel.app) · [Admin](https://shopverse-admin-lemon.vercel.app)
(free hosting: the API sleeps when idle, so the first load can take ~30–50 s)

**Stores:** Sneakers · Electronics · Books · Home Decor

## Tech stack

| | |
|---|---|
| **Frontend** (store) | React 19, JavaScript, Vite, Tailwind CSS, React Router, TanStack Query, Zustand |
| **Admin** (separate app) | React 19, JavaScript, Vite, Tailwind CSS, React Router, Redux Toolkit + RTK Query, ESLint |
| **Backend** | Node.js, Express 5, JavaScript (ES modules), Prisma ORM, PostgreSQL, Zod, JWT |
| **Integrations** | Stripe (payments), Resend (email), Cloudinary (profile photos) |

## Features

See the full **[Feature Tracker](docs/FEATURE_TRACKER.md)** for status and per-feature docs.

- ✅ Authentication: JWT + rotating refresh tokens in httpOnly cookies, roles
- ✅ Catalog: category tabs, filters, sorting, pagination, product variants
- ✅ Cart, wishlist, coupons
- ✅ Stripe checkout + webhooks
- ✅ Inventory reservation (no overselling under concurrency)
- ✅ Order history + confirmation emails
- ✅ Reviews & ratings (verified buyers only)
- ✅ Full-text search with relevance ranking, facet counts and suggestions
- ✅ Admin panel (separate app): products, orders, analytics dashboard
- ✅ My account: profile photo (Cloudinary), details, address book; address step at checkout
- ✅ PDF invoices with sequential numbering, card details, Stripe receipts and a QR code for public verification

## Project structure

```
shopverse/
├── backend/    # shop REST API: auth, catalog, cart, orders, payments, admin (independent project)
├── cms/        # headless CMS: store text + home page banner (independent project, own database)
├── frontend/   # React storefront for customers (independent project)
├── admin/      # React admin panel for staff (independent project, uses backend + cms)
├── docs/       # architecture, feature tracker, per-feature explanations
└── package.json  # only the scripts that run all four together
```

Read **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** to understand how everything fits together, and
**[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for how it runs online.
**[docs/GLOSSARY.md](docs/GLOSSARY.md)** explains every keyword used in the code (React, TanStack Query,
Redux Toolkit, Express, Prisma, Zod...) with links to where it is used.

## Running locally

**Requirements:** Node.js 24 and PostgreSQL databases (local, or free ones from [Neon](https://neon.tech)):
one for the shop, one named `cms` for the CMS.

### 1. One-time setup

```bash
npm run install:all         # installs the root tool + all four apps

cd backend
cp .env.example .env        # set DATABASE_URL, JWT_ACCESS_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (+ optional RESEND_API_KEY, EMAIL_DEV_REDIRECT_TO, CLOUDINARY_*)
npm run db:migrate          # create tables
npm run db:seed             # demo products + users
npm run db:seed-orders      # optional: 90 days of demo sales for the admin dashboard

cd ../cms
cp .env.example .env        # DATABASE_URL must end in /cms; JWT_ACCESS_SECRET = the same as backend's
npm run db:migrate          # create the CMS table
```

### 2. Start everything (one terminal)

```bash
npm run dev                 # from the project root
```

| Label | App | URL |
|---|---|---|
| `[api]` | shop API | http://localhost:4000 |
| `[cms]` | CMS | http://localhost:4100/cms |
| `[store]` | store | http://localhost:5173 |
| `[admin]` | admin panel | http://localhost:5174 |

Every line is labelled with the app it came from, so a crash is easy to spot. `Ctrl+C` stops all four.
`npm run dev:api` starts only the two APIs. Each app can still be started on its own (`cd <app> && npm run dev`).

### 3. Stripe webhooks (in a second terminal, needed to confirm payments)

Install the [Stripe CLI](https://docs.stripe.com/stripe-cli), then:

```bash
stripe login
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired --forward-to localhost:4000/api/webhooks/stripe
```

Put the `whsec_...` secret it prints into `backend/.env` as `STRIPE_WEBHOOK_SECRET` and restart the backend.
Pay with the test card `4242 4242 4242 4242` (any future date, any CVC).

### Logging in to both apps

On `localhost` both apps share cookies, so logging into one replaces the session in the other.
Use a private window for the second one if you need both logged in.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Customer | demo@shopverse.dev | Demo@12345 |
| Admin | admin@shopverse.dev | Admin@12345 |
