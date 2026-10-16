# Feature 1: Authentication

**Status:** ✅ Done (Phase 1)

Users can register, log in, stay logged in across page reloads, and log out. Admin-only
features later reuse the same system through roles.

## How it works (big picture)

ShopVerse uses **two tokens**:

| Token | What | Lifetime | Stored where | Why |
|---|---|---|---|---|
| Access token | Signed JWT with `{ sub: userId, role }` | 15 minutes | Frontend memory (Zustand) | Sent on every API call. Short life limits damage if stolen. |
| Refresh token | Random 96-char string | 7 days | httpOnly cookie (browser) + **hash** in DB | Used only to get new access tokens. JavaScript can't read it. |

```
Login ──► backend checks password (bcrypt)
      ◄── { user, accessToken }  +  Set-Cookie: refreshToken (httpOnly)

API call with expired access token ──► 401
frontend automatically ──► POST /auth/refresh (cookie sent by browser)
                       ◄── new accessToken + new refresh cookie (old one revoked)
frontend retries the original request ──► 200 ✓
```

## Backend side

Files: [`backend/src/modules/auth/`](../../backend/src/modules/auth)

| Endpoint | Auth | What it does |
|---|---|---|
| `POST /api/auth/register` | public | Validate input → reject duplicate email (409) → hash password with bcrypt (cost 12) → create user → issue tokens |
| `POST /api/auth/login` | public | Find user → compare bcrypt hash → issue tokens. Same error for wrong email and wrong password. |
| `POST /api/auth/refresh` | refresh cookie | Look up the token's hash → check not revoked/expired → revoke it → issue a new pair (**rotation**) |
| `POST /api/auth/logout` | refresh cookie | Revoke the refresh token, clear the cookie |
| `GET /api/auth/me` | access token | Return the current user |

| File | Responsibility |
|---|---|
| `auth.schema.ts` | Zod rules: valid email, name 2–60 chars, password ≥ 8 chars. Email is lowercased. |
| `auth.tokens.ts` | Sign/verify JWTs, generate random refresh tokens, SHA-256 hashing |
| `auth.service.ts` | Register/login/refresh/logout logic, reuse detection |
| `auth.controller.ts` | Sets/clears the cookie, shapes JSON responses |
| `middleware/auth.ts` | `requireAuth` (verifies the Bearer token) and `requireRole('ADMIN')` |

**Refresh token reuse detection.** Each refresh token works once. If an already-revoked
token is presented again, someone may have stolen it. The service then revokes **all** of
that user's sessions, forcing a fresh login.

**Cookie settings.** `httpOnly` (no JS access), `secure` in production (HTTPS only),
`sameSite` (`lax` in dev, `none` in production because the frontend and API run on different
domains), `path=/api/auth` (the cookie isn't sent with unrelated requests).

## Frontend side

Files: [`frontend/src/features/auth/`](../../frontend/src/features/auth) and
[`frontend/src/lib/api-client.ts`](../../frontend/src/lib/api-client.ts)

| File | Responsibility |
|---|---|
| `auth.store.ts` | Zustand store: `user`, `accessToken`, `status` (`loading` / `authenticated` / `guest`) |
| `auth.api.ts` | `useLogin`, `useRegister`, `useLogout` (React Query mutations that update the store) |
| `LoginPage.tsx` / `RegisterPage.tsx` | Forms with loading and error states. Login redirects back to the page you came from. |
| `RequireAuth.tsx` | Route guard for protected pages (cart, orders, admin). Optional `role` prop. |
| `lib/api-client.ts` | Axios instance. Adds `Authorization: Bearer`, and on a 401 silently refreshes and retries once. |
| `components/layout/RootLayout.tsx` | On app start, calls refresh once to restore the session from the cookie. |

**Why not localStorage?** Any script running on the page (e.g. via an XSS bug) can read
localStorage. Keeping the access token in memory and the refresh token in an httpOnly cookie
means neither is readable by injected scripts.

**Concurrent 401s.** If 3 requests fail at once, the client makes only **one** refresh call
(a shared promise) and all 3 retry with the new token. Without this, the second refresh
would use an already-rotated token and trigger reuse detection.

## Real-world concepts demonstrated

- Password hashing with bcrypt (salted, deliberately slow)
- Stateless JWT access tokens + stateful, revocable refresh tokens
- Refresh token rotation and reuse detection
- httpOnly / Secure / SameSite cookies
- Role-based access control (RBAC)
- Avoiding user enumeration ("Invalid email or password")
- Silent token refresh with request retry and de-duplication

## Try it

- Demo customer: `demo@shopverse.dev` / `Demo@12345`
- Admin: `admin@shopverse.dev` / `Admin@12345`
