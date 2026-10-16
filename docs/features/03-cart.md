# Feature 3: Cart

**Status:** ✅ Done (Phase 2)

Logged-in users can add product variants to a cart stored on the server, change
quantities, remove items and see a live subtotal. A cart badge in the header shows the item count.

## Backend side

Files: [`backend/src/modules/cart/`](../../backend/src/modules/cart)

All endpoints need a logged-in user (`requireAuth`). Every endpoint returns the full updated cart.

| Endpoint | Body | What it does |
|---|---|---|
| `GET /api/cart` | | The current user's cart |
| `POST /api/cart/items` | `{ variantId, quantity? }` | Add an item. If it's already in the cart, the quantity increases |
| `PATCH /api/cart/items/:variantId` | `{ quantity }` | Set the quantity |
| `DELETE /api/cart/items/:variantId` | | Remove one item |
| `DELETE /api/cart` | | Empty the cart |

Response: `{ cart: { items, itemCount, subtotal, hasIssues } }`. Each item has
`unitPrice`, `quantity`, `lineTotal`, `stock` and `issue` (`OUT_OF_STOCK`, `NOT_ENOUGH_STOCK` or `null`).

**Rules enforced** (`cart.service.ts`, `cart.schema.ts`):
- Quantity is a whole number from 1 to 10 (`MAX_QUANTITY_PER_ITEM`).
- The requested quantity can't exceed the variant's stock. Inactive or unknown products can't be added.
- The user id comes from the verified access token, never from the request, so users can only touch their own cart.
- The client never sends a price. Prices are read from the database every time.

**Data model:** `CartItem` (`userId`, `variantId`, `quantity`) with `@@unique([userId, variantId])`.
This means one row per user per variant, so adding the same item again uses `upsert` to raise the quantity.

**Design decisions:**
- **Server-side cart:** the cart is stored in the database, not in the browser, so it follows the user across devices.
- **Live prices:** the cart doesn't store prices. It always shows the current price, which gets frozen
  into the order only at checkout (Phase 3, `OrderItem.unitPrice`).
- **Stock is checked, not held:** items whose stock dropped after being added are kept but flagged
  with an `issue` and left out of the subtotal. Actually *holding* stock happens at checkout
  (Phase 3, stock reservations). Two users can both have the last item in their carts.

## Frontend side

Files: [`frontend/src/features/cart/`](../../frontend/src/features/cart)

| File | What it does |
|---|---|
| `cart.api.ts` | React Query hooks: `useCart`, `useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem`, `useClearCart` |
| `CartPage.tsx` | `/cart` page (protected by `RequireAuth`): item rows with +/- buttons, remove, order summary |
| `ProductDetailPage.tsx` (catalog) | The "Add to cart" button. Guests are sent to login, then brought back |
| `Header.tsx` | Cart icon with an item-count badge |

**Key techniques:**
- **Server state in React Query:** the cart is cached under `['cart', userId]`. Including the user id
  means a different user never sees a cached cart.
- **Mutations update the cache directly:** every endpoint returns the new cart, which is put
  into the cache with `setQueryData`, so the page and badge update without an extra request.
- **Optimistic updates** (quantity and remove): the screen changes instantly and the request
  runs in the background. If the server rejects it (for example, not enough stock), the
  previous cart is restored.

## Concepts to be able to explain

1. Why must the price come from the server and not the request?
2. Why store the cart in the database and not in localStorage?
3. What is an optimistic update, and what happens when the server rejects one?
4. Why can two people still both have the last item in their cart, and where is that solved?
