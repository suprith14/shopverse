# Feature 20: Headless CMS

**Status:** 🚧 In progress. Steps 1 (the CMS API) and 2 (admin editor) done.

A separate service, `cms/`, that stores the store's text (brand, home page, footer, notices) and serves it as
JSON. "Headless": it has no pages of its own. The store shows the content, and the admin app edits it.

| Step | What | Status |
|---|---|---|
| 1 | `cms/`: Express + Prisma API with its own database | ✅ |
| 2 | "Content" editor page in the admin app | ✅ |
| 3 | The store reads its text from the CMS (falls back to `site.js`) | ⏳ |
| 4 | Tests + going live (Render service, Neon database, Vercel rewrites) | ⏳ |

## How it fits

```
admin app ──PUT /cms/admin/content/home──►┐
  (login token from the shop API)         │
                                          ▼
                                   cms/ (port 4100) ──► its own database ("cms" on Neon)
                                          ▲
store ──────GET /cms/content──────────────┘   (public, cached 60 s)

admin app ──/api/auth/login──► backend/ (port 4000) ──► shop database
```

## API

| Method + URL | Who | Returns |
|---|---|---|
| `GET /cms/health` | anyone | `{ status: 'ok' }` |
| `GET /cms/content` | anyone (the store) | `{ brand, home, footer, notices }`, each with all its fields |
| `GET /cms/content/:type` | anyone | one type's fields |
| `GET /cms/admin/content` | admin token | every type with its field descriptions, current values, last update |
| `PUT /cms/admin/content/:type` | admin token | saves all fields of one type (validated), returns them |

## Safety

`cms/` refuses to migrate (`scripts/check-db.js`) or start (`src/config/env.js`) unless `DATABASE_URL` points at a database named **`cms`**. A shop database on the same Neon server has a similar URL, and `prisma migrate dev` would offer to reset it.

## Files

- `cms/src/content/content-types.js`: **the one place content is described.** Each field has a label, limits, a default and help text. The validation, the defaults and the admin form are all built from it.
- `cms/src/content/content.service.js`: read (saved values on top of defaults) and save (validated with Zod, `.strict()` so unknown keys are refused).
- `cms/src/content/content.routes.js`: the URLs; public routes send `Cache-Control: public, max-age=60, stale-while-revalidate=300`.
- `cms/src/middleware/auth.js`: checks the shop's admin token with the shared `JWT_ACCESS_SECRET`. The CMS has no users of its own.
- `cms/prisma/schema.prisma`: one table, `ContentEntry` (`type`, `data` JSON, `updatedAt`, `updatedBy`).

- `admin/src/app/api.js`: a second RTK Query slice, `cmsApi` (base URL `/cms`). Both slices share one `withReauth` wrapper, so an expired token is refreshed through the shop API and the CMS request is retried.
- `admin/src/features/content/ContentPage.jsx`: one card per content type, each saved on its own, with Discard, "Saved", "Last saved ..." and per-field errors from the CMS.
- `admin/src/features/content/ContentField.jsx`: draws one input from a field description (text, multi-line or number), with a character counter, help text and "Use default".
- `admin/vite.config.js`: forwards `/cms` to `localhost:4100`.

## Why these choices

| Choice | Alternatives | Why |
|---|---|---|
| Own service + own database | A module inside `backend/` | Content and shop data change for different reasons and can be deployed separately; this is the "microservice" idea. Trade-off: one more server to run and wake up |
| Share the login via `JWT_ACCESS_SECRET` | CMS users and logins of its own; asking the shop API "is this token valid?" | One login for admins, no extra request per call. Trade-off: both services must keep the same secret, and changing it means updating both |
| Fields described in code (`content-types.js`) | Content types created in a UI (like Contentful) | Changes go through git and code review, and the store's code must change anyway to show a new field |
| One JSON row per type | One table column per field | Adding a field needs no migration. Zod gives back the safety a column type would |
| Defaults for every field | Empty until someone edits | A brand-new or emptied CMS still serves a working store |
| The admin form is drawn from the CMS's field descriptions | A hand-written form per content type | A new field in `content-types.js` appears in the editor with no admin change; one source of truth for labels and limits |
| A separate `cmsApi` slice | Adding CMS endpoints to the shop `api` slice | A different service gets its own base URL, cache and tags; logging out clears both |
| Public `Cache-Control` | No caching | The store asks on every page load; with caching the CDN answers most of those, and the CMS stays fast and cheap |

## Concepts to be able to explain

1. What does "headless" mean, and which part of ShopVerse is the "head"?
2. How can the CMS trust an admin without having a users table?
3. What does `stale-while-revalidate` do?
4. Why is the content validated on the server even though the admin form already limits the length?
