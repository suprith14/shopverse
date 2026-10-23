# Feature 19: Automated Tests + CI

**Status:** ✅ Done. Backend unit + API tests, frontend tax tests, and CI on every push and pull request.

| Step | What | Status |
|---|---|---|
| 1 | Vitest + unit tests for logic that needs no database | ✅ |
| 2 | API tests (Supertest) against a separate test database | ✅ |
| 3 | GitHub Actions (`.github/workflows/ci.yml`): test and build every app on every push to `main` and every pull request | ✅ |

## CI (GitHub Actions)

`.github/workflows/ci.yml` runs four jobs in parallel. Each installs from its lockfile with `npm ci`.

| Job | Steps |
|---|---|
| backend | Postgres 17 service container → `prisma generate` → `npm test` (unit + API; global-setup migrates the empty database) |
| frontend | `npm test` (tax calculator, 43 tests) → `npm run build` |
| admin | `npm run lint` → `npm run build` |
| cms | `npm run build` (`prisma generate` validates the schema) |

- **No secrets and no Neon.** The API tests get a throwaway Postgres that exists only for that job, so CI can never touch a real database. The Neon wake-up delays that made local runs flaky do not exist there.
- **A newer push cancels the older run** on the same branch (`concurrency`).
- **To make it a merge gate:** GitHub → Settings → Branches → add a rule for `main` → "Require status checks to pass" → tick the four jobs.

## How to run

```
cd backend
npm test             # all tests once (what CI will run)
npm run test:unit    # unit tests only: no database needed
npm run test:api     # API tests only: needs TEST_DATABASE_URL
npm run test:watch   # unit tests, re-run on every save
```

### One-time setup for the API tests

1. Neon dashboard → your project → **Branches** → **Create branch**. Name it `test`, parent: the **dev** branch (never production: a branch copies its parent's data).
2. Open the `test` branch → **Connect** → copy the connection string.
3. Add it to `backend/.env` (already git-ignored), adding `&connect_timeout=30` at the end:
   `TEST_DATABASE_URL="postgresql://...?sslmode=require&connect_timeout=30"`

Before every API run, `tests/api/global-setup.js`:
- **refuses** if `TEST_DATABASE_URL` is missing or points at the same database as `DATABASE_URL`
- applies migrations with `prisma migrate deploy` (only applies, never resets)
- empties every table (keeping the migration history and the invoice counter, reset to 0)

## Files

- `backend/vitest.config.js`: finds `tests/**/*.test.js` and sets **fake** environment variables. The database URL points at a test database that doesn't exist, so a unit test can never touch real data.
- `backend/tests/unit/coupons.test.js`: `calculateDiscount` (percent, fixed, rounding down, never negative, disabled/expired/used up/minimum order) and `describeCoupon`.
- `backend/tests/unit/rate-limiter.test.js`: blocking after 5 failures, the countdown, the sliding window, separate keys, reset. Uses **fake timers** so "wait 15 minutes" takes no time.
- `backend/tests/api/helpers.js`: `api` (Supertest on `createApp()`, no server or port), `createUser({ role })`, `createProduct({ price, stock, isActive })`, `auth(token)`, `refreshCookie(res)`. Every test makes its own data with unique emails/slugs.
- `backend/tests/api/auth.test.js`: sign-up (HttpOnly cookie, no password hash leaked, duplicate email, field errors), login (same answer for wrong password and unknown email, lockout after 5 failures with `Retry-After`), `/me` needs a valid token, refresh token rotation and reuse detection.
- `backend/tests/api/access.test.js`: admin API (401 / 403 / 200), another customer's order, invoice and cancel are 404 (IDOR), order lists only show your own orders.
- `backend/tests/api/cart.test.js`: quantities merge, the price comes from the database not the request, stock limits, out of stock, hidden products, quantity 1 to 10, each user sees only their own cart.

## Speed

From India to the Ohio database every query is a ~320 ms round trip, so `npm run test:api` takes ~2.5 minutes on a laptop. In CI the database runs on the same machine, so it takes seconds.

Password hashing was the other slow part: bcrypt cost 12 takes ~1.8 s per hash on this laptop. Tests set `BCRYPT_ROUNDS=4` (a few ms); production keeps the default 12. Tests check the login *logic*, not bcrypt's strength. Django and Rails do the same in their test settings.

## Why these tools

| Choice | Alternatives | Why |
|---|---|---|
| Vitest | Jest, Node's built-in `node:test` | Works with ES modules with no setup (Jest needs workarounds); same tool as the Vite frontends; fast watch mode. `node:test` works too but has fewer helpers (fake timers, mocks) |
| Fake env vars in the config | Using `.env` | Tests must behave the same on every machine and in CI, where there is no `.env`, and must never reach the real database |
| Supertest | Starting the server and using fetch | Calls the Express app in memory: no port clashes with `npm run dev`, nothing to start or stop |
| A Neon `test` branch | Local Postgres, Docker, an in-memory fake | Same Postgres as production (the search column needs real Postgres), nothing to install. CI will use a throwaway Postgres container instead |
| Tests create their own data | One shared seed file | Each test shows what it needs, and tests can't break each other |
| Fake timers | Really waiting | Time-based logic becomes testable in milliseconds, and always gives the same result |

## Concepts to be able to explain

1. What is the difference between a unit, an integration and an end-to-end test?
2. Why test edge cases (exactly the minimum, rounding, "never negative") and not only the happy path?
3. What are fake timers, and why do tests need them?
4. Why does a test run use its own environment variables and database?
5. Why does a request for someone else's order return 404 and not 403?
6. Why do the API test files run one after another instead of in parallel?
