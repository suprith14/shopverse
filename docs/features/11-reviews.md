# Feature 11: Reviews & Ratings

**Status:** ✅ Done (Phase 4, step 1)

Customers who bought a product can give it 1–5 stars with a title and text, then edit or delete
their review. Product pages show the average, a star breakdown and the reviews. Every product
card shows the real average.

## Backend side

Files: [`backend/src/modules/reviews/`](../../backend/src/modules/reviews)

| Endpoint | Auth | What it does |
|---|---|---|
| `GET /api/reviews/product/:productId?page=1` | public | Reviews (newest first, 5 per page), average, count, `distribution` (number of reviews per star) |
| `GET /api/reviews/product/:productId/mine` | login | `{ canReview, reason, review }`: what the product page should show this user |
| `PUT /api/reviews/product/:productId/mine` | login + bought | Create or edit my review `{ rating, title, body }` |
| `DELETE /api/reviews/product/:productId/mine` | login | Delete my review (`204`) |

**Rules:**
- **Verified buyers only:** the user needs an order with status `PAID`, `SHIPPED` or `DELIVERED`
  that contains any variant of the product. This is checked on the server for every write.
- **One review per user per product** (`@@unique([userId, productId])`), so `PUT` upserts: the first time creates, later times edit.
- Validation: rating 1–5 (whole number), title 3–100 characters, body 10–2000 characters.
- **Privacy:** the author is shown as "First L.". The email and user id are never returned.

**Stored rating stats (denormalised):** `Product.ratingAvg` (rounded to 1 decimal) and `ratingCount`
are recalculated with an `aggregate` query **in the same transaction** as every review change. Listing pages and
the "Top rated" sort read the stored values instead of averaging all reviews on every request.

**Row lock:** each review change first runs `SELECT … FROM "Product" WHERE id = ? FOR UPDATE`.
Two reviews for the same product are then processed one after the other, so neither
recalculation can overwrite the other with a stale average.

## Frontend side

Files: [`frontend/src/features/reviews/`](../../frontend/src/features/reviews)

| File | What it does |
|---|---|
| `reviews.api.js` | `useReviews`, `useMyReview`, `useSaveReview`, `useDeleteReview` |
| `ProductReviews.jsx` | The "Customer reviews" section: average, star bars, list, Newer/Older pages, and the box for the current user |
| `ReviewForm.jsx` | Clickable star picker (hover preview, keyboard accessible), title, text, Save/Delete |
| `ProductDetailPage.jsx` (catalog) | Shows `<ProductReviews>` under the product |

**What the visitor sees:**

| Visitor | Shown |
|---|---|
| Guest | "Log in to review this product" (comes back to the product after login) |
| Logged in, never bought it | "Only customers who bought this product can review it." |
| Bought it, no review yet | **Write a review** |
| Already reviewed | **Edit your review** (with Delete) |

**Keeping numbers in sync:** after saving or deleting, the review list, "my review", the product
page and the shop's product lists are invalidated, so every place showing stars refetches.

## Concepts to be able to explain

1. How do we prevent fake reviews, and why can't that check live only on the frontend?
2. Why store the average on the product instead of calculating it on every request?
3. What race condition does `SELECT … FOR UPDATE` prevent here? Compare it with the stock update.
4. Why does saving one review need to refresh several React Query caches?
