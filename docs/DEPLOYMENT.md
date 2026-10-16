# Deployment

**Live:** [store](https://shopverse-eta-ecru.vercel.app) · [admin](https://shopverse-admin-lemon.vercel.app) ·
[API health](https://shopverse-api-u9c6.onrender.com/api/health)

ShopVerse runs on free tiers: **Neon** (database), **Render** (backend API) and **Vercel** (store + admin).

```
Browser ──▶ Vercel: store  (frontend/) ──┐  /api/* forwarded (rewrite)
Browser ──▶ Vercel: admin  (admin/)    ──┤
                                         ▼
Stripe webhooks ──────────────▶ Render: API (backend/) ──▶ Neon: production branch
                                         └──▶ Resend (email)
```

## Why these choices

| Part | Host | Reason |
|---|---|---|
| Database | Neon, **separate production branch** | Already used in development. Keeps live data apart from test data |
| API | Render web service | A long-running Node server (Express + the every-minute expiry job). Vercel's free tier is built for short functions |
| Store, admin | Vercel (2 projects, same repo) | After `vite build` they're static files. Fast CDN, redeploys on every push |
| `/api` | Vercel **rewrite** to Render | The browser only sees the Vercel domain, so the httpOnly refresh cookie is a first-party cookie. Calling Render directly would make it a third-party cookie, which browsers increasingly block |

**Free-tier trade-offs:** Render sleeps after 15 minutes idle (the first request then takes ~30–50 s; the expiry
job catches up when it wakes). Neon sleeps too (`connect_timeout=30` handles it). Resend only emails its owner, so
`EMAIL_DEV_REDIRECT_TO` stays set.

## Production code settings (done in Phase 7, step 1)

- **Backend scripts:** `build` = `prisma generate && tsc` (compiles to `dist/`), `start` = `node dist/server.js`,
  `db:deploy` = `prisma migrate deploy` (applies migration files only, never creates new ones). `engines.node` = `24.x`.
- **Refresh cookie** is `SameSite=Lax` everywhere (works because every app uses a same-site `/api` proxy) and `Secure` in production.
- **`vercel.json`** in `frontend/` and `admin/`: forward `/api/*` to Render, and send every other path to
  `index.html` so React Router can handle URLs like `/orders/123` on refresh.
- **Admin:** links to the store use `VITE_STORE_URL` (`admin/src/lib/config.ts`).

## How it was set up

| Step | Where | What |
|---|---|---|
| 1 | code | Production scripts, rewrites, env-based URLs (above) |
| 2 | Neon | New branch for production. From the laptop, in one terminal with a temporary `$env:DATABASE_URL` override: `npm run db:deploy`, `npm run db:seed`, `npm run db:seed-orders` |
| 3 | Render | Web service, root `backend`, region **Ohio** (same as Neon `us-east-2`), build `npm ci --include=dev && npm run build`, start `npm run db:deploy && npm start`, health check `/api/health` |
| 4 | Stripe | Webhook destination `https://shopverse-api-u9c6.onrender.com/api/webhooks/stripe`: your account, snapshot payload, API `2026-09-30.endive` (same as the SDK), the 4 `checkout.session.*` events. It has its own `whsec_` secret |
| 5 | Vercel | Project `shopverse`, root `frontend`, Vite preset, no env vars |
| 6 | Vercel | Project `shopverse-admin`, root `admin`, `VITE_STORE_URL` = store URL |
| 7 | all | Live test: 4242 purchase → PAID by the webhook → email. The admin sees it in "Paid · to ship". A customer token gets 403 on admin APIs |

## Environment variables (Render)

| Key | Notes |
|---|---|
| `NODE_ENV` | `production`: secure cookies. npm skips devDependencies, hence `--include=dev` in the build |
| `DATABASE_URL` | Neon **production branch**, direct (non-pooler) host, `&connect_timeout=30` |
| `JWT_ACCESS_SECRET` | New random value, never the dev one |
| `STRIPE_SECRET_KEY` | `sk_test_...` (test mode) |
| `STRIPE_WEBHOOK_SECRET` | From the Stripe webhook destination (not the CLI one) |
| `RESEND_API_KEY`, `EMAIL_DEV_REDIRECT_TO` | Free Resend can only email its owner, so all emails are redirected |
| `CLIENT_URL` | Store URL, no trailing slash: Stripe redirects, email links, CORS |

`PORT` is set by Render.

`VITE_` variables on Vercel are **build-time**: they're written into the public JavaScript, so never put
secrets in them, and redeploy after changing one.

## Redeploying

- **Push to `main`**: Render and both Vercel projects rebuild automatically.
- **New migration**: commit the migration folder. Render's start command applies it with `migrate deploy`
  before the new server starts.
- **Changed a Render env var**: Render restarts the service. **Changed a `VITE_` var**: redeploy that Vercel project.
