# Feature 16: User Profile & Address Book

**Status:** 🚧 In progress. Database (step 1) and profile API (step 2) are done. Photo upload, the "My account"
page, the checkout address step and the admin view come next.

Customers can save a phone number, date of birth, profile photo and up to 10 delivery addresses (one default).
At checkout they pick an address, which is copied into the order.

## Database (migration `add_user_profile`)

| Where | Field | Why |
|---|---|---|
| `User` | `phone` (text) | International (E.164) format `+919876543210`: one format couriers and SMS services understand, no duplicates |
| `User` | `dateOfBirth` (`DATE`) | Date only. A timestamp would shift birthdays by a day across time zones |
| `User` | `avatarUrl` | Only the URL. The image lives in object storage (Cloudinary), not in the database |
| `User` | `defaultAddressId` → `Address` (unique, `onDelete: SetNull`) | **One** default slot, so two defaults can't exist ("make invalid states unrepresentable") |
| `Address` | label, fullName, phone, line1, line2, city, state, postalCode, country | One-to-many: a customer can have several. `onDelete: Cascade` from `User` |

Orders don't link to `Address`. Checkout **copies** the address into `Order.shippingAddress` (a snapshot, like prices),
so editing the address book never changes where a past order was shipped.

The database can't check that the default address belongs to the same user. The backend checks it.

**Lesson from building this:** never pass a real database as Prisma's `--shadow-database-url`, because Prisma resets
the shadow database. The dev database was wiped that way and restored with the seeds plus
**baselining** (`prisma migrate resolve --applied <migration>`: record a migration as applied without running it).

## Backend: `/api/profile`

Files: [`backend/src/modules/profile/`](../../backend/src/modules/profile). Login required. Every response is the full
updated profile with addresses (default first).

| Endpoint | What it does |
|---|---|
| `GET /api/profile` | My details + address book |
| `PATCH /api/profile` | `{ name?, phone?, dateOfBirth? }` (`null` removes phone or date of birth) |
| `POST /api/profile/addresses` | Add an address (`makeDefault?`). The first one is always the default |
| `PATCH /api/profile/addresses/:id` | Edit an address (country and postcode must be sent together) |
| `POST /api/profile/addresses/:id/default` | Make it the default |
| `DELETE /api/profile/addresses/:id` | Delete it. If it was the default, the newest remaining address becomes the default |

**Design decisions:**
- **"Me" URLs, not `/users/:id`:** the user always comes from the token, so there's no id to change in the URL.
  Another customer's address id answers **404**, which avoids the IDOR bug class.
- **Email and role can't be changed here.** Unknown fields are ignored. Changing the login email needs re-verification (account-takeover risk).
- **Validation:** phone is cleaned (spaces, dashes, brackets) then must be E.164. Date of birth must be `YYYY-MM-DD`, age 13–120.
  Postcodes are exact for India (6 digits, not starting with 0) and the US (5 or 5+4), loose elsewhere. Country is an ISO code
  from a fixed list (`IN, US, GB, CA, AU, DE, FR, SG, AE`).
- **Limit:** 10 addresses per customer.

**Tested:** guest 401. Phone `+91 98765-43210` saved as `+919876543210`. Bad phone, under-13, bad Indian postcode and unknown
country are rejected with field messages. Email/role in the body are ignored. The first address is the default automatically.
Switching the default works. Another customer gets 404 on edit, default and delete. Deleting the default promotes the other one.
The 11th address is refused. Deleting the user cascades its addresses.

## Concepts to be able to explain

1. Why a `defaultAddressId` on `User` instead of an `isDefault` flag on each address?
2. Why copy the address into the order instead of linking to it?
3. What is an IDOR bug, and how do "me" URLs prevent it?
4. Why store phones in E.164 and birthdays as `DATE`?
5. Why shouldn't profile photos be stored in the database?
6. What is baselining a migration, and when do you need it?
