# Feature 19: Automated Tests + CI

**Status:** 🚧 In progress. Step 1 (unit tests) done.

| Step | What | Status |
|---|---|---|
| 1 | Vitest + unit tests for logic that needs no database | ✅ |
| 2 | API tests (Supertest) against a separate test database | ⏳ |
| 3 | GitHub Actions: lint → test → build on every push, plus a README badge | ⏳ |

## How to run

```
cd backend
npm test             # run all tests once (what CI will run)
npm run test:watch   # re-run tests when files change, while you work
```

## Files

- `backend/vitest.config.js`: finds `tests/**/*.test.js` and sets **fake** environment variables. The database URL points at a test database that doesn't exist, so a unit test can never touch real data.
- `backend/tests/unit/coupons.test.js`: `calculateDiscount` (percent, fixed, rounding down, never negative, disabled/expired/used up/minimum order) and `describeCoupon`.
- `backend/tests/unit/rate-limiter.test.js`: blocking after 5 failures, the countdown, the sliding window, separate keys, reset. Uses **fake timers** so "wait 15 minutes" takes no time.

## Why these tools

| Choice | Alternatives | Why |
|---|---|---|
| Vitest | Jest, Node's built-in `node:test` | Works with ES modules with no setup (Jest needs workarounds); same tool as the Vite frontends; fast watch mode. `node:test` works too but has fewer helpers (fake timers, mocks) |
| Fake env vars in the config | Using `.env` | Tests must behave the same on every machine and in CI, where there is no `.env`, and must never reach the real database |
| Fake timers | Really waiting | Time-based logic becomes testable in milliseconds, and always gives the same result |

## Concepts to be able to explain

1. What is the difference between a unit, an integration and an end-to-end test?
2. Why test edge cases (exactly the minimum, rounding, "never negative") and not only the happy path?
3. What are fake timers, and why do tests need them?
4. Why does a test run use its own environment variables and database?
