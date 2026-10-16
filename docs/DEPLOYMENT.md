# Deployment

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

## Steps

1. ✅ Prepare the code (above)
2. ⬜ Neon production branch + migrations + seed
3. ⬜ Render web service for `backend/`
4. ⬜ Stripe webhook endpoint for the live API
5. ⬜ Vercel project for `frontend/`
6. ⬜ Vercel project for `admin/`
7. ⬜ End-to-end test on the live URLs
