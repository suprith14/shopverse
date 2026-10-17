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

## Change password (My account)

`POST /api/auth/change-password` `{ currentPassword, newPassword }` (login required). It's under `/api/auth` because the
refresh cookie is only sent there, and the server needs it to give this device a fresh session.

| Rule | Why |
|---|---|
| The **current password is required** | A stolen session or an unlocked phone mustn't be enough to lock the owner out |
| New password: the same rules as sign-up (8–100 characters) and **different from the current one** | One rule set (`password` in `auth.schema.ts`) |
| A wrong current password → **400** with a field error, not 401 | The frontend treats 401 as "session expired" and would try to refresh |
| **All sessions are deleted**, then a new one is issued for this device | If someone else got in, their session ends now. Their 15-minute access token can still work until it expires (the trade-off of stateless JWTs) |
| A **"Your password was changed"** email, sent after responding | The owner finds out at once if it wasn't them. It never delays or breaks the change |

**Bug found while testing:** at first the old sessions were *revoked* (marked used) instead of deleted. When another device then
refreshed, the **reuse detection** treated it as a stolen token and signed out *every* session, including the one just
issued. Deleting them makes old devices simply get "invalid refresh token" (log in again), and keeps the theft alarm for
real reuse of a rotated token. Tested with two cookie jars ("devices").

**Frontend:** the "Password" section in My account has current, new and confirm fields (mismatch caught in the browser), a show-passwords
toggle, and `autoComplete="new-password"` so password managers can suggest a strong one. A toast confirms the change.

## Forgot password (6-digit code by email)

Files: [`backend/src/modules/auth/password-reset.ts`](../../backend/src/modules/auth/password-reset.ts), migration
`add_password_reset_code` (`PasswordResetCode` table), store page `/forgot-password` (link under the login form).

| Endpoint (public) | Body | What it does |
|---|---|---|
| `POST /api/auth/forgot-password` | `{ email }` | **Always** answers *"If an account exists for that email, we sent a 6-digit code…"* |
| `POST /api/auth/reset-password` | `{ email, code, newPassword }` | Sets the new password, ends every session, logs you in on this device, sends the "password changed" email |

| Protection | How |
|---|---|
| **No account enumeration** | Same message for real and unknown emails, **and the same speed**: the reply is sent first, then the database work and email happen in the background (otherwise real accounts would answer slower, and email errors would only show for real accounts). A wrong code and an unknown email give the same error |
| Codes **never stored in plain text** | HMAC-SHA256 keyed with the server secret. With only 1,000,000 possible codes, a plain hash from a leaked database would be cracked in under a second |
| Secure randomness | `crypto.randomInt`, not `Math.random` (which is predictable) |
| Short-lived, one-time | Valid 15 minutes. `usedAt` set on success. A new request deletes the old code |
| Guessing | 5 wrong tries burn the code (0.0005% chance of guessing) |
| Inbox flooding | One code per email per 60 seconds |
| Timing-safe comparison | `timingSafeEqual`, so response time doesn't reveal how much of the code matched |
| Secrets never in logs | Code only in the email **body**, never the subject (subjects are logged and shown on lock screens). The no-API-key console fallback prints email bodies only in development |
| After reset | All sessions deleted (not revoked, see change password), new session for this device, notification email |

**Store UX:** step 1 email → step 2 code + new password + confirm. The code field uses `inputMode="numeric"` (number keypad) and
`autoComplete="one-time-code"` (phones can fill it from the notification). The wording never confirms that an account exists.
"Send a new code" and "Use a different email" links.

**Tested:** identical message and ~8 ms for a real and an unknown email. One stored code (hashed, 15 min). Cooldown blocked a second email.
Letters rejected. Wrong code / unknown email gave the same error. Correct code → reset and logged in. Reusing the code → rejected.
Old device signed out. Old password rejected, new one works. 5 wrong tries → burned, even the correct code then fails. Expired code rejected.
The real email was delivered, and that test is what revealed the code-in-subject log leak, which is now fixed.

**Live site:** works end to end, but with the dev email redirect all codes go to the developer's inbox until a domain is verified (see the email notes in [DEPLOYMENT.md](../DEPLOYMENT.md)).

## Login rate limiting

Files: [`backend/src/lib/rate-limiter.ts`](../../backend/src/lib/rate-limiter.ts) (the limiter), `enforce()` + `login` /
`forgotPassword` / `resetPassword` in `auth.controller.ts`, store [`lib/use-retry-countdown.ts`](../../frontend/src/lib/use-retry-countdown.ts) + `LoginPage.tsx`.

| Limit | Stops | Counts |
|---|---|---|
| **5 failures / 15 min per account** | Brute force on one account | Wrong passwords for that email (unknown emails too, so locking reveals nothing). A correct login resets it |
| **30 failures / 15 min per IP** | Password spraying (few passwords × many accounts) | Wrong passwords from that IP, any account |
| 10 requests / 15 min per IP | Flooding inboxes via "forgot password" | Every forgot-password request |
| 20 failures / 15 min per IP | Guessing reset codes across many accounts | Wrong codes from that IP |

**How the limiter works:** a *sliding window log*. Per key it keeps the timestamps of recent events. If `max` of them fall
inside the window, the key waits until the oldest of those leaves the window. Old entries are pruned every 5 minutes.

**Blocked response:** `429 Too Many Requests`, `Retry-After: <seconds>`, *"Too many attempts. Please try again in N minutes."*
While blocked, even the correct password is refused. Forgot password still works (so a deliberate lock-out by an attacker is temporary and recoverable).

**Real IPs behind proxies:** Express `trust proxy` = `TRUST_PROXY_HOPS` (0 on a laptop, 2 on Render behind Vercel). Too low and every
visitor shares the proxy's IP (one attacker would block everyone); too high and clients could fake their IP via `X-Forwarded-For`.

**Why in memory:** one server. With several servers (or to survive restarts), the counters move to Redis, which is shared and expires keys by itself.

**Store:** on a 429, `useRetryCountdown` reads `Retry-After` and the login page shows *"try again in 14:32"* (live) with a reset-password
link, and the button is disabled with the same countdown.

**Tested:** 5 wrong → 6th is 429 with `Retry-After: 895`. The correct password while locked → 429. Another account → unaffected.
4 wrong + correct resets the count. Unknown emails lock too. Spraying across accounts → blocked at exactly 30 failures for any account. 11th forgot-password request → 429.

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
