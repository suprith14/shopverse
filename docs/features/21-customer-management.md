# Feature 21: Customer Management (admin)

**Status:** ✅ Done. Migration `add_customer_block_delete`; 8 API tests passing (49 in total).

Admin → **Customers**: see who is online, block and unblock customers, delete customers.

## What each action does

| Action | Effect |
|---|---|
| **See** | Every customer (never admins or deleted accounts): 🟢 Online (active in the last 15 min) / "Last seen 3 h ago" / Blocked, joined date, number of orders, total spent (paid, shipped, delivered). Search by name or email; tabs All / Online now / Blocked; the list refreshes every minute |
| **Block** | Sets `blockedAt` (+ optional reason, admins only) and deletes the customer's sessions. Login, refresh, checkout, "pay now" and password reset answer **403 "This account has been suspended"**. Logged out everywhere within 15 minutes. Reversible: **Unblock** |
| **Delete** | No orders → the account is deleted completely. **Has orders → anonymised**: name becomes "Deleted customer", email `deleted-<id>@deleted.invalid`, unusable password, phone/birthday/photo/last seen cleared; addresses, cart, wishlist, sessions and reset codes deleted; `deletedAt` set. The orders stay (with their address snapshot) because invoices must be kept. The person can sign up again with the same email. Confirmed by typing the customer's email |

Admins can't be blocked or deleted from this page (404), and an admin can't block or delete themselves (400).

## Shared demo accounts

The demo logins are public (README), so one visitor could lock out the next. Accounts listed in
`PROTECTED_ACCOUNTS` (default: `demo@shopverse.dev`, `admin@shopverse.dev`):

| Action | Result |
|---|---|
| Change password (My account) | 403 "This is a shared demo account: its password can't be changed." |
| Forgot password | Same reply as always, but no code is created or emailed |
| Reset password with a code | 403 |
| Admin: block / delete | 403 "…it can't be blocked or deleted."; the Customers page shows a **Demo account** badge instead of the buttons (`protected: true` in the list) |
| Log in, shop, addresses, profile details | Work normally |

The server is the real guard; the badge only explains it. Tests: `backend/tests/api/protected.test.js`
(the tests use their own protected account, `shared-demo@test.dev`).

## Files

- `backend/prisma/schema.prisma`: `User.blockedAt`, `User.blockedReason`, `User.deletedAt`
- `backend/src/lib/account-status.js`: `ACCOUNT_SUSPENDED` message and `assertCanShop(userId)` (a database check for money-related actions)
- `backend/src/modules/auth/auth.service.js`, `password-reset.js`: refuse blocked accounts (after the password / code is checked)
- `backend/src/modules/orders/orders.service.js`: `createOrder` and `getPaymentUrl` call `assertCanShop`
- `backend/src/modules/admin/customers/`: `GET /api/admin/customers`, `POST /:id/block`, `POST /:id/unblock`, `DELETE /:id`
- `backend/tests/api/customers.test.js`: list, block (login 403, session ended, checkout 403, unblock), delete (complete vs anonymised), guards
- `admin/src/features/customers/`: `CustomersPage.jsx`, `CustomerDialogs.jsx` (native `<dialog>`), `customersApi.js`

## Why these choices

| Choice | Alternatives | Why |
|---|---|---|
| Delete = anonymise when there are orders | Always delete everything; never delete | Tax and accounting rules require keeping invoices; privacy rules (GDPR) require erasing the person. Anonymising does both. Customers with no orders are simply deleted |
| `blockedAt` timestamp | `isBlocked` boolean | Says *when* as well as *whether*; `null` means not blocked |
| Block = delete sessions + 15 min token expiry | Check the database on every request | Keeps every request fast (stateless JWT). Money-related actions check the database (`assertCanShop`), so a blocked customer can't buy anything even in those 15 minutes |
| Blocked check **after** the password | Before | Only someone who knows the password learns the account is blocked, so it doesn't reveal which emails are registered |
| Type the email to confirm a delete | An "Are you sure?" button | Deleting can't be undone; typing makes it a deliberate act (GitHub does the same for repositories) |
| Online = `lastSeenAt` in the last 15 min | WebSockets with live presence | Reuses the activity tracking already there, no extra server load; precise to ~5 minutes, which is enough for an admin |

## Concepts to be able to explain

1. Why can't a store simply delete a customer who has orders?
2. What is the difference between deleting and anonymising, and what does GDPR's "right to erasure" ask for?
3. A blocked customer still holds a valid access token. What can they do with it, and for how long?
4. Why is the "blocked" check done after the password check at login?
