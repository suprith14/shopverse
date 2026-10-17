# Architecture

ShopVerse is two independent projects that talk over a REST API:

```
┌─────────────────────────┐      HTTP / JSON       ┌─────────────────────────┐      ┌──────────────┐
│  frontend/ (React SPA)  │  ───────────────────►  │  backend/ (Express API) │ ───► │  PostgreSQL  │
│  Vite · React Query ·   │  Authorization: Bearer │  Zod · Prisma · JWT     │      │  (Prisma ORM)│
│  Zustand · Tailwind     │  + refresh cookie      │                         │      └──────────────┘
└─────────────────────────┘                        └─────────────────────────┘
                                                    Stripe, Resend
```

They are deployed separately (e.g. frontend on Vercel, backend on Render/Railway) and
each has its own `package.json`, dependencies and `.env`.

## Same feature names on both sides

Every feature lives in a folder with the **same name** in both projects, so you can follow
a feature end to end:

```
backend/src/modules/catalog/        frontend/src/features/catalog/
  catalog.routes.js   (URLs)          catalog.api.js      (calls the API, React Query hooks)
  catalog.schema.js   (validation)    CatalogPage.jsx     (page)
  catalog.controller.js (HTTP)        components/         (pieces of the page)
  catalog.service.js  (logic + DB)
```

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
- **Services** only know about business logic and the database. They could be reused from
  a CLI script, a cron job or a test without any HTTP involved.

## Backend folders

```
backend/
├── prisma/
│   ├── schema.prisma   # the whole data model (read this first!)
│   └── seed.js         # demo data
└── src/
    ├── server.js       # starts the HTTP server
    ├── app.js          # builds the Express app, mounts module routers
    ├── config/env.js   # validated environment variables
    ├── lib/            # shared helpers (prisma client, HttpError)
    ├── middleware/     # auth, validation, error handling
    └── modules/        # one folder per feature
        ├── auth/
        └── catalog/
```

## Frontend folders

```
frontend/src/
├── main.jsx            # app entry: React Query + Router providers
├── router.jsx          # all routes
├── lib/
│   ├── api-client.js   # axios instance + token handling + silent refresh
│   └── format.js       # price formatting, error messages
├── components/
│   ├── layout/         # header, root layout
│   └── ui/             # reusable buttons, inputs, states, star rating
└── features/           # one folder per feature (mirrors backend modules)
    ├── auth/
    └── catalog/
```

## Frontend state: where does each piece of data live?

| Kind of state | Where | Example |
|---|---|---|
| Server data | React Query cache | products, categories |
| Global client state | Zustand store | logged-in user, access token |
| Shareable UI state | URL search params | filters, sort, page, search query |
| Local UI state | `useState` | selected image, form inputs |

Keeping these separate is what keeps a React app understandable as it grows.

## Data model highlights

See [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma). It's commented throughout.

- **Money is stored in cents** (integers) to avoid floating-point errors.
- **Product vs ProductVariant**: price and stock live on the variant ("Size 9 / Black", "256GB").
- **OrderItem snapshots** the product name and price at purchase time.
- **StockReservation** and **ProcessedWebhookEvent** support inventory concurrency and
  idempotent Stripe webhooks (Phase 3).
