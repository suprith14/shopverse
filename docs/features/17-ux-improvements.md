# Feature 17: Store UX Improvements

**Status:** ✅ Done. Ten improvements to the customer store, from a review done as a shopper would use it.

| # | Problem | Fix | Why this approach |
|---|---|---|---|
| 1 | Home page promised "AI-powered recommendations" (dropped feature) | Honest hero text | Never advertise what doesn't exist |
| 2 | Live site: 30–50 s silent spinner while free hosting wakes up | `lib/network-status.js` counts in-flight requests. After 4 s, `SlowServerBanner` explains the wait | Explaining a wait keeps visitors. A keep-alive pinger would burn the database's free compute hours |
| 3 | Phones: no search, header crowded | Search gets its own full-width row on phones, and a ☰ menu holds Shop/Orders/Wishlist/Account/Log out. The cart stays visible | On mobile, search is the main way to navigate, and the cart is the one constant need. Two `SearchBox` instances use `useId()` for unique ARIA ids |
| 4 | Little feedback after actions | `sonner` toasts via `lib/notify.js`. **Undo** after removing a cart item | Toasts confirm quick actions. Form errors stay inline. Undo beats "Are you sure?" dialogs |
| 5 | New pages opened scrolled down | React Router `<ScrollRestoration />` | Top on new pages, previous position on **Back** (a manual scroll-to-top breaks Back) |
| 6 | Every tab said "ShopVerse" | `<PageTitle>` with React 19's built-in `<title>` hoisting | No `react-helmet` needed. Better tabs, history and bookmarks |
| 7 | Spinners made pages jump | `components/ui/Skeleton.jsx`: grid, product page and list skeletons shaped like the content, `motion-safe` pulse | No layout shift, feels faster, respects "reduce motion" |
| 8 | Product page always added 1 | Quantity stepper (1 → stock or 10, reset per variant via `key`) | Easy to tap; can't produce 0, negatives or decimals. The backend still enforces the limits |
| 9 | Phones: filters pushed products down | "Filters (N)" toggle below `lg`, sidebar always visible on desktop | Products first. The count shows hidden active filters |
| 10 | No sense of checkout progress | `CheckoutSteps`: Cart & delivery → Payment → Confirmation on the cart and order pages | Matches the real flow (Stripe is step 2). Known progress reduces abandonment |
| 11 | Phone users saw a **disabled Checkout** with no explanation (no saved address; the form was below the fold) | The button stays enabled and reads **"Add delivery address to continue"**. Tapping it scrolls to the address form, focuses its first field and shows a toast | A dead button doesn't say why, and tooltips don't exist on touch screens. The tap explains the problem and leads to the fix |
| 12 | Blank white page while the app's JavaScript downloads (seconds on slow phones) | A branded **start-up loader** written in plain HTML/CSS inside `index.html`: a hopping category icon that changes with the word ("Getting **gadgets** / books / home decor ready"), the bag logo drawing itself, a sliding bar, and a "Slow connection? Almost there…" hint that appears only after 6 s. `main.jsx` fades it out right after React's first paint. The admin app has the same loader (shield logo; orders / products / analytics / customers) | Only HTML/CSS can show before the JavaScript arrives (a React spinner would appear too late). Everything shares one 3.3 s cycle, so icon and word never drift apart. The 6 s hint uses CSS `animation-delay` with no timer code, so fast visits never see it. No fake progress and no minimum display time. Calm and static under `prefers-reduced-motion`. ~3 kB gzipped |
| — | Bundle over 500 kB after adding toasts | `lazy` routes for wishlist, orders, order detail, account, login and register | Main bundle **519 → 427 kB**. Rarely used pages load on demand |

## Concepts to be able to explain

1. Why does a skeleton feel faster than a spinner, and what is layout shift?
2. When should feedback be a toast, and when should it be inline?
3. Why is "Undo" usually better than a confirmation dialog?
4. What does `<ScrollRestoration />` do that `window.scrollTo(0, 0)` doesn't?
5. Which pages did we keep in the main bundle, and why?
6. Why does the same component rendered twice need `useId()`?
7. Why must the start-up loader be HTML/CSS and not a React component? How does `stroke-dashoffset` "draw" a line?
