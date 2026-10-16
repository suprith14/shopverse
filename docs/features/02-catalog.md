# Feature 2: Product Catalog & Category Tabs

**Status:** ✅ Done (Phase 1)

Browse products across four categories (Sneakers, Electronics, Books, Home Decor) with
tabs, filters, sorting and pagination, and view a product page with variant selection.

## Backend side

Files: [`backend/src/modules/catalog/`](../../backend/src/modules/catalog)

| Endpoint | What it does |
|---|---|
| `GET /api/catalog/categories` | All categories with a count of active products |
| `GET /api/catalog/suggest?q=run` | Search-as-you-type suggestions (see [12-search](./12-search.md)). The old `/brands` endpoint was replaced by brand facets |
| `GET /api/catalog/products` | Filtered, sorted, paginated product list |
| `GET /api/catalog/products/:slug` | One product with category and all variants |

**Query params for `/products`** (validated by `catalog.schema.ts`):

| Param | Example | Meaning |
|---|---|---|
| `category` | `sneakers` | Category slug |
| `q` | `running shoes` | Full-text search, see [12-search](./12-search.md) |
| `brand` | `Nike` | Exact brand |
| `minPrice` / `maxPrice` | `5000` | In **cents** |
| `minRating` | `4` | Average rating ≥ value |
| `sort` | `price_asc` | `relevance` (default when searching) · `newest` (default otherwise) · `price_asc` · `price_desc` · `rating` |
| `page` / `limit` | `2` / `12` | Pagination (limit capped at 48) |

Response: `{ items, page, limit, total, totalPages, sort, matchMode, facets }`.

**How the query is built** (`catalog.service.ts`): each filter adds a condition to a Prisma
`where` object only if it was sent. The count query and the page query run in one
transaction, so `total` matches the items returned.

**Data model decisions:**
- **Variants**: a product ("Air Stride Runner") has variants ("UK 9 / Black") that carry
  their own `price`, `stock` and unique `sku`. This is how real stores handle sizes, colors and storage options.
- **`basePrice`** on the product = cheapest variant price. Stored (denormalized) so filtering
  and sorting by price doesn't need a join.
- **`attributes` (JSON)**: category-specific fields (author/pages for books, specs for
  electronics) without a separate table per category.
- **`ratingAvg` / `ratingCount`**: stored on the product and updated when reviews are added
  (Phase 4), so listing pages don't compute averages on every request.
- **Slugs** (`air-stride-runner`) give readable, SEO-friendly URLs.

## Frontend side

Files: [`frontend/src/features/catalog/`](../../frontend/src/features/catalog)

| File | Responsibility |
|---|---|
| `catalog.api.ts` | React Query hooks: `useCategories`, `useBrands`, `useProducts`, `useProduct` |
| `HomePage.tsx` | Hero, category cards with product counts, featured (top-rated) products |
| `CatalogPage.tsx` | Category tabs + filter sidebar + sort + product grid + pagination |
| `ProductDetailPage.tsx` | Image gallery, variant picker (sold-out variants disabled), stock messages, details table |
| `components/CategoryTabs.tsx` | "All / Sneakers / Electronics / Books / Home Decor", built from the API |
| `components/FilterSidebar.tsx` | Brand, price range, minimum rating, clear all |
| `components/ProductCard.tsx` | Image, brand, name, rating, price, "Sold out" badge |
| `components/Pagination.tsx` | Previous / page numbers / next |

**The URL is the source of truth for filters.** `/shop?category=books&sort=price_asc&page=2`
holds all filter state. Changing a filter updates the URL, and the URL drives the API query.
Benefits: shareable/bookmarkable links, the back button works, and a refresh keeps your filters.
Any filter change resets to page 1.

**Caching.** React Query caches each filter combination by its `queryKey`. Going back to a
previous filter shows results instantly. `keepPreviousData` keeps the old grid visible
(dimmed) while the next page loads, so the page doesn't flash a spinner.

**Search.** The header search box navigates to `/shop?q=...`. Phase 4 upgrades this to
PostgreSQL full-text search with ranking and live suggestions.

## Real-world concepts demonstrated

- Product / variant / SKU modeling
- Server-side filtering, sorting and offset pagination
- Input validation and type coercion of query strings
- Denormalization for read performance
- URL-driven UI state
- Client-side caching and stale-while-revalidate
- Loading, error and empty states everywhere
