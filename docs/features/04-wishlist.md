# Feature 4: Wishlist

**Status:** ✅ Done (Phase 2)

Logged-in users can save products for later with a heart (♡) button on product cards and
product pages, and see everything they saved on `/wishlist`.

## Backend side

Files: [`backend/src/modules/wishlist/`](../../backend/src/modules/wishlist)

All endpoints need a logged-in user (`requireAuth`). Every endpoint returns the full updated list.

| Endpoint | What it does |
|---|---|
| `GET /api/wishlist` | Saved products, newest first |
| `PUT /api/wishlist/:productId` | Save a product (doing it again changes nothing) |
| `DELETE /api/wishlist/:productId` | Unsave a product (doing it again isn't an error) |

Response: `{ items: [{ addedAt, product }] }`. `product` has the same shape as a product
card in the catalog (`ProductSummary`).

**Data model:** `WishlistItem` (`userId`, `productId`) with `@@unique([userId, productId])`.
A product can be saved only once per user.

**Design decisions:**
- **Products, not variants:** you save "Air Stride Runner" and pick the size when you buy.
  The cart stores variants because you buy a specific size.
- **Idempotent endpoints:** `PUT` uses `upsert` and `DELETE` uses `deleteMany`, so a double-click
  or a retried request never fails and never creates duplicates.
- **Hidden when removed from the store:** products whose `isActive` is false are left out of the list.
- **Shared product card shape:** `productSummarySelect` / `toProductSummary` in
  `catalog.service.ts` are used by both the catalog and the wishlist, so a product card has
  the same data everywhere.

## Frontend side

Files: [`frontend/src/features/wishlist/`](../../frontend/src/features/wishlist)

| File | What it does |
|---|---|
| `wishlist.api.ts` | `useWishlist`, `useWishlistIds` (a Set of saved ids) and `useToggleWishlist` |
| `WishlistButton.tsx` | The heart button. Guests are sent to login, then brought back |
| `WishlistPage.tsx` | `/wishlist` page (protected), a grid of the usual product cards |
| `ProductCard.tsx`, `ProductDetailPage.tsx` (catalog) | Show the heart button |
| `Header.tsx` | Heart icon linking to the wishlist |

**Key techniques:**
- **Toggle pattern:** one mutation handles both save and unsave (`{ productId, save }`).
- **Optimistic UI using mutation variables:** while the request is running, the heart shows
  `toggle.variables.save` (what the user asked for). When it finishes, the server data takes over.
  If it fails, the heart falls back to the real data on its own, with no rollback code.
- **Button inside a link:** on product cards, `preventDefault` and `stopPropagation` stop a
  heart click from also opening the product page.

## Concepts to be able to explain

1. Why does the wishlist store products while the cart stores variants?
2. What does "idempotent" mean, and why is it useful for a heart button?
3. Why `PUT` for adding instead of `POST`?
4. How is the optimistic heart here simpler than the cart's optimistic quantity update?
