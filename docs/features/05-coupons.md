# Feature 5: Coupons

**Status:** ✅ Done (Phase 2)

Customers can enter a discount code in the cart and see the discount and new total. The
discount updates automatically when the cart changes.

## Backend side

Files: [`backend/src/modules/coupons/`](../../backend/src/modules/coupons)

| Endpoint | What it does |
|---|---|
| `GET /api/coupons/preview?code=SAVE20` | Login required. Checks the code against the user's current cart and returns the discount |

Response: `{ preview: { code, description, subtotal, discount, total } }`, or a 400 error with a message
the customer can read.

**Rules** (`calculateDiscount` in `coupons.service.ts`):

| Check | Message |
|---|---|
| Code doesn't exist, or `isActive` is false | "Invalid coupon code" (same message for both) |
| `expiresAt` has passed | "This coupon has expired" |
| `usedCount >= maxUses` | "This coupon is no longer available" |
| Cart subtotal below `minOrderAmount` | "Add $31.00 more to use this coupon (minimum order $100.00)" |

**Discount maths:**
- `PERCENT`: `floor(subtotal × value / 100)`, rounded down to whole cents.
- `FIXED`: `value` cents.
- The discount is capped at the subtotal, so an order can be free but never negative.

**Demo coupons** (from the seed): `WELCOME10` (10% off), `SAVE20` ($20 off orders of $100+),
`EXPIRED5` (expired) and `FLASH50` (all uses taken).

**Design decisions:**
- **Preview, not redeem:** applying a code saves nothing and doesn't increase `usedCount`. The code
  is checked again and used up when the order is created at checkout (Phase 3). Otherwise anyone
  could use up a limited coupon just by typing it in.
- **The server calculates the subtotal** from the user's cart in the database. The client never sends prices or totals.
- **Case-insensitive codes:** the code is trimmed and uppercased (`" save20 "` becomes `SAVE20`).
- **Same message for unknown and disabled codes,** so people can't probe for hidden codes.
- `calculateDiscount` is exported so checkout can reuse exactly the same rules.

## Frontend side

Files: [`frontend/src/features/coupons/`](../../frontend/src/features/coupons)

| File | What it does |
|---|---|
| `coupon.store.ts` | Zustand store holding only the applied **code**. Cleared when the logged-in user changes |
| `coupons.api.ts` | `useCouponPreview(code, subtotal)`, the React Query hook for the preview endpoint |
| `CouponBox.tsx` | The code input, then a green chip (saving) or red chip (reason it doesn't apply) with a remove button |
| `CartPage.tsx` (cart) | Order summary shows Subtotal, Discount and Total |

**Key techniques:**
- **Re-checking when the cart changes:** the cart subtotal is part of the query key, so changing a
  quantity runs the preview again. Drop below a coupon's minimum and it shows "Add $X more" instead of a discount.
- **Client state vs server state:** the code the user typed is client state (Zustand). The
  discount is server state (React Query). The frontend never calculates a discount itself.
- `retry: false`, because an expired coupon won't become valid by asking again.

## Concepts to be able to explain

1. Why doesn't applying a coupon increase `usedCount`?
2. Why does the frontend send only the code and not the subtotal?
3. Why show the same error for a code that doesn't exist and one that is disabled?
4. What happens to an applied `SAVE20` when the user lowers quantities below $100?
