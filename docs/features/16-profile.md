# Feature 16: User Profile & Address Book

**Status:** ✅ Done: database, profile API, photo upload, "My account" page, address step at checkout and the admin's "Ship to".

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

## Profile photo (Cloudinary)

Files: [`backend/src/lib/cloudinary.js`](../../backend/src/lib/cloudinary.js) and the avatar functions in `profile.service.js`.
Config: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (optional: without them the
avatar endpoints answer `503`).

| Endpoint | What it does |
|---|---|
| `POST /api/profile/avatar/signature` | Returns `{ uploadUrl, fields }`: a **signed** permission to upload one image |
| `PUT /api/profile/avatar` | `{ url }`: saves the uploaded image's URL after checking it |
| `DELETE /api/profile/avatar` | Clears the URL and deletes the file from Cloudinary |

**Flow:** browser → our API (signature) → browser uploads **directly to Cloudinary** → browser sends the URL → API saves it.
Our server never handles the file.

**Why these choices:**
- **Cloudinary instead of Postgres, Render's disk or S3:** images bloat databases, Render's free disk is wiped on every deploy,
  and S3 needs a card plus your own resizing and CDN. Cloudinary's free tier includes storage, a CDN and resizing.
- **No SDK:** signing is SHA-1 over the sorted parameters + API secret (Node `crypto`), and deleting is one HTTP call. About 20 lines instead of a dependency.
- **Signed parameters are the security:** the fixed `public_id` (`shopverse/avatars/<userId>`, `overwrite`, so a new photo replaces the old
  one), the `transformation` (`c_fill,g_face,w_400,h_400,q_auto`: a 400×400 face-centred crop *before* storing) and `allowed_formats`
  (jpg/png/webp, no SVG). Changing any of them after signing makes Cloudinary reject the upload.
- **The saved URL must be this user's avatar path in our Cloudinary account**, so nobody can point their photo at an outside image (tracking pixels).
- **Removing deletes the file** (privacy). The CDN can serve the old copy for a few seconds until its cache clears (`invalidate: true`).

**Tested:** a 900×1200 / 218 KB photo was stored as **400×400 / 37 KB**. Tampering with the signed size → *Invalid Signature*. An outside URL →
*"That is not your uploaded profile photo"*. After remove → the file returns 404 once the CDN cache clears (~20 s).

## Checkout (backend)

`POST /api/orders` now **requires `addressId`**. The server loads the address **filtered by the user**
(another customer's id → *"Choose one of your saved delivery addresses"*) and copies its fields into
`Order.shippingAddress`. Only the id travels from the browser, the same rule as prices.

**Tested:** no address → *"Choose a delivery address"*. Another user's address → refused. Own address → the order has the snapshot.
After editing the address in the book (Bengaluru → Mysuru), the order **still** ships to Bengaluru.

## Store frontend

Files: [`frontend/src/features/account/`](../../frontend/src/features/account)

| File | What it does |
|---|---|
| `account.api.js` | `useProfile` + mutations (each returns the full profile into the cache). `useUploadAvatar` = signature → **plain `fetch` to Cloudinary** (our auth token must never go to another site) → save URL |
| `AccountPage.jsx` | `/account`: photo (browser pre-checks type and ≤ 5 MB), details (email shown read-only), address book (default badge, make default, edit, delete with "past orders keep their own copy") |
| `AddressForm.jsx`, `AddressCard.jsx`, `countries.js` | Shared form (browser `autoComplete` hints), how an address is printed, the country list |
| `DeliveryAddressPicker.jsx` | Checkout "Deliver to": the default address pre-selected with **Change**, a radio list, or an inline "add new address" form (shown straight away if there are none) |
| `CartPage.jsx` (cart) | Picker in the order summary. **Checkout is disabled until an address is chosen**, then sends `addressId` |
| `OrderDetailPage.jsx` (orders) | Shows the order's delivery address (the snapshot) |
| `Header.jsx` | Profile photo + name link to `/account` |

## Onboarding wizard (after sign-up)

Files: [`frontend/src/features/onboarding/`](../../frontend/src/features/onboarding). No backend changes: it reuses the profile APIs.

Right after creating an account, a popup walks through **4 steps**, with a "Step N of 4" bar:
1. **Photo**: upload (same signed Cloudinary flow) → Next, or Skip
2. **Mobile number**: saved on Next (the backend cleans and validates it, and its errors show inline), or Skip
3. **Date of birth**: saved on Next (age 13+ checked by the backend), or Skip
4. **Delivery address (info)**: explains that an address is needed for checkout. **Add address now** (→ My account) or **Done**

**Why this design:**
- **Small skippable steps** instead of one long form, so sign-up never feels like a gate.
- **Each step saves on Next**, so closing half-way keeps what was entered.
- **Shown once, only after sign-up** (`onboarding.store.js`, opened by `RegisterPage`), never on login. Everything stays editable in My account.
- **Native `<dialog>` + `showModal()`**: focus stays inside, **Esc** closes it (counts as "skip the rest"), it's announced as a dialog
  (`aria-labelledby`), and there's a backdrop. No modal library needed.
- It closes automatically if the user logs out or switches account.

## Admin

The order page has a **"Ship to"** box printed from `order.shippingAddress`, with a clickable phone number. Old and demo orders show "No address".

## Concepts to be able to explain

1. Why a `defaultAddressId` on `User` instead of an `isDefault` flag on each address?
2. Why copy the address into the order instead of linking to it?
3. What is an IDOR bug, and how do "me" URLs prevent it?
4. Why store phones in E.164 and birthdays as `DATE`?
5. Why shouldn't profile photos be stored in the database?
6. What is baselining a migration, and when do you need it?
7. How does a signed direct upload work, and what stops a user uploading a 4000×4000 image or an SVG?
8. Why can a deleted image still load for a few seconds?
9. Why does the photo upload to Cloudinary use plain `fetch` instead of our axios client?
10. Why does checkout send only `addressId`, and what does the backend check?

## Take a photo or choose a file

The profile photo (My account, and the sign-up wizard) has two buttons: **Take photo** and **Choose file**
(`frontend/src/components/ui/PhotoPicker.jsx`). Both hand the same `File` to the same checks and upload.

- **Take photo** opens a live camera preview (`navigator.mediaDevices.getUserMedia`, front camera first, a switch
  button when there's more than one camera). **Capture** shows the shot with **Retake** / **Use photo**; nothing is
  uploaded until Use photo. The camera is switched off whenever the popup closes (no lingering camera light).
- The front camera preview is mirrored (as phones do), and the saved photo matches what the person saw.
- Camera blocked or missing: a clear message plus **Choose a file instead**. Browsers without the camera API fall
  back to `<input capture="user">`, which opens the phone's camera app.
- The camera API only works on HTTPS or localhost (the live site is HTTPS).
- Tested with Edge's fake camera (`--use-fake-device-for-media-stream`): preview plays, Capture → Retake / Use photo,
  camera off after closing.

