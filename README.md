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
| **Frontend** (store) | React 19, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Zustand |
| **Admin** (separate app) | React 19, TypeScript, Vite, Tailwind CSS, React Router, Redux Toolkit + RTK Query, ESLint |
| **Backend** | Node.js, Express 5, TypeScript, Prisma ORM, PostgreSQL, Zod, JWT |
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
- ✅ PDF invoices with sequential numbering, card details and Stripe receipts

## Project structure

```
shopverse/
├── backend/    # REST API (independent project)
├── frontend/   # React storefront for customers (independent project)
├── admin/      # React admin panel for staff (independent project, same backend)
└── docs/       # architecture, feature tracker, per-feature explanations
```

Read **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** to understand how everything fits together, and
**[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for how it runs online.

## Running locally

**Requirements:** Node.js 20+ and a PostgreSQL database (local, or a free one from
[Neon](https://neon.tech)).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then set DATABASE_URL, JWT_ACCESS_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (+ optional RESEND_API_KEY, EMAIL_DEV_REDIRECT_TO)
npm run db:migrate          # create tables
npm run db:seed             # demo products + users
npm run db:seed-orders      # optional: 90 days of demo sales for the admin dashboard
npm run dev                 # http://localhost:4000
```

### 2. Frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

### 3. Stripe webhooks (in a third terminal, needed to confirm payments)

Install the [Stripe CLI](https://docs.stripe.com/stripe-cli), then:

```bash
stripe login
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired --forward-to localhost:4000/api/webhooks/stripe
```

Put the `whsec_...` secret it prints into `backend/.env` as `STRIPE_WEBHOOK_SECRET` and restart the backend.
Pay with the test card `4242 4242 4242 4242` (any future date, any CVC).

### 4. Admin panel (optional, another terminal)

```bash
cd admin
npm install
npm run dev                 # http://localhost:5174 (log in with the admin account below)
```

On `localhost` both apps share cookies, so logging into one replaces the session in the other.
Use a private window for the second one if you need both logged in.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Customer | demo@shopverse.dev | Demo@12345 |
| Admin | admin@shopverse.dev | Admin@12345 |
