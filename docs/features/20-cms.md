# Feature 20: Headless CMS

**Status:** 🚧 In progress. Steps 1-3 done (CMS API, admin editor, store reads the CMS). Step 4 (tests + live) next.

A separate service, `cms/`, that stores the store's text (brand, home page, footer, notices) and serves it as
JSON. "Headless": it has no pages of its own. The store shows the content, and the admin app edits it.

| Step | What | Status |
|---|---|---|
| 1 | `cms/`: Express + Prisma API with its own database | ✅ |
| 2 | "Content" editor page in the admin app | ✅ |
| 3 | The store reads its text from the CMS (falls back to `site.js`) | ✅ |
| 4 | Going live (Render service, Neon database, Vercel rewrites) | ✅ live at shopverse-cms.onrender.com; "defaults in sync" test still to add |

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

## Home page banner (image carousel)

Content type `banner`: up to **5 slides** (`image`, image description, small text, title, text, optional button text + link) and `intervalSeconds` (3-15, default 6). With no slides the store shows the purple text banner from `home`.

**Uploading an image** (admin → Content → Home page banner → Upload image):
```
admin ──POST /cms/admin/uploads/banner-signature──► CMS signs: folder shopverse/banners/<random id>,
                                                    max 2400x1200, jpg/png/webp only
admin ──file + signature──► Cloudinary ──► image URL
admin ──Save──► PUT /cms/admin/content/banner ──► CMS checks the URL is OUR banners folder, saves it
store ──GET /cms/content──► HeroCarousel
```
The file never passes through our servers, and a changed signature (other folder, size, format) is rejected by Cloudinary. Removing or replacing a slide deletes the old file from Cloudinary in the background.

**Validation** (`content-types.js`, new field kinds `image`, `link`, `list`): image must be in our Cloudinary `shopverse/banners/` folder; button link must be a store page (`/shop...`): no `https://...`, `//...` or `javascript:`; button text and link both or neither; at most 5 slides; unknown keys refused.

**Store** (`frontend/src/features/catalog/components/HeroCarousel.jsx`): cross-fade every N seconds; **pauses** on hover, keyboard focus and hidden tabs; no autoplay with "reduce motion"; Pause/Play button (WCAG 2.2.2), arrows, dots, ← → keys, swipe; responsive Cloudinary sizes (`f_auto,q_auto`, 640-2400 px `srcset`), first image eager + high priority, others lazy; a dark gradient keeps the text readable on any photo; a hidden `h1` keeps the page's heading structure.

**Settings:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `cms/.env` and on Render (`shopverse-cms`), the same values as the shop API. Without them, uploading answers 503.

## Languages

Text fields are **localized**: stored as `{ en, kn }` (English required where the field is, Kannada optional).
Images, links and numbers are shared. See [22-dark-mode-and-kannada.md](22-dark-mode-and-kannada.md#kannada-cms-text-step-3).

## When the database is asleep

Neon suspends the CMS database after 5 idle minutes, and the first connection after that can fail (P1001). `cms/src/lib/prisma.js` retries any query that couldn't **connect** up to 3 times (after 1 s, 2 s, 4 s: exponential backoff). That's safe because a query whose connection failed never ran. If it still fails, the API answers **503** with `Retry-After: 10` (temporarily unavailable), not 500.

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

- `frontend/src/content/use-site-content.js`: `useSiteContent()`. Shows the browser's saved copy (or `site.js`) instantly, fetches `/cms/content` in the background, swaps it in, saves a copy. CMS down: the page keeps the copy. Uses `fetch`, not the shop's axios client, so a slow CMS doesn't show the "waking up the server" banner.
- `frontend/src/content/site.js`: `siteDefaults`, the fallback text, in the same shape as the CMS response. **Keep it in sync with `cms/src/content/content-types.js`.**
- `frontend/vite.config.js`: forwards `/cms` to `localhost:4100`. `%SITE_NAME%` in index.html still comes from `site.js` at build time, so a brand renamed in the CMS shows once the app has loaded, not in the start-up loader.

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
| Store shows a saved copy first, then the CMS | Wait for the CMS before showing the page | The CMS sleeps on free hosting (up to a minute to wake). Visitors must never wait for text |
| Public `Cache-Control` | No caching | The store asks on every page load; with caching the CDN answers most of those, and the CMS stays fast and cheap |

## Concepts to be able to explain

1. What does "headless" mean, and which part of ShopVerse is the "head"?
2. How can the CMS trust an admin without having a users table?
3. What does `stale-while-revalidate` do?
4. Why is the content validated on the server even though the admin form already limits the length?

## Footer content

| Field | Shown in the footer |
|---|---|
| `tagline` | Under the logo (brand column) |
| `paymentNote` | The "Secure checkout" column |
| `testCardNote` | The grey box with the Stripe test card; **empty = hidden** (e.g. once real payments are on) |
| `text` | The bottom line, after "© year brand" |

The footer's **links are not content**: the Shop column lists the real categories (the same cached
request as the category tabs) and the Account column follows the login state, so the footer can
never point to a page or category that doesn't exist. New fields need no migration: saved content
is merged over the defaults, in the CMS (`merge`) and again in the store (`useSiteContent`), so
either service can be deployed first.
