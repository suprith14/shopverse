# Feature 12: Advanced Search

**Status:** ✅ Done (Phase 4, step 2)

Product search uses **PostgreSQL full-text search**: it matches word roots instead of exact letters,
ranks results by relevance, falls back to partial matches, shows counts next to every filter, and
suggests products, brands and categories while you type.

## Database

Migration [`add_product_search`](../../backend/prisma/migrations/20261016055138_add_product_search/migration.sql):

- **`Product.searchVector`** (`tsvector`) is a **GENERATED** column. PostgreSQL computes it from the name
  (weight **A**), brand (**B**) and description (**C**) and recomputes it whenever they change.
- A **GIN index** on it maps each word root to the products that contain it.

`to_tsvector('english', …)` lowercases, removes stop words ("the", "with") and stems words to roots:
`"Lightweight daily running shoe"` becomes `'lightweight' 'daili' 'run' 'shoe'`.

Prisma can't create generated columns, so the migration SQL was edited by hand after
`prisma migrate dev --create-only`. In `schema.prisma` the column is declared as `Unsupported("tsvector")` with
`@default(dbgenerated("<expression exactly as PostgreSQL reports it>"))`. Without that, Prisma sees a
difference and tries to `DROP DEFAULT` on the next `migrate dev`.

## Backend side

Files: [`backend/src/modules/catalog/search.ts`](../../backend/src/modules/catalog/search.ts), `catalog.service.ts`.

| Endpoint | What it does |
|---|---|
| `GET /api/catalog/products?q=…` | Search plus all the usual filters. Also returns `sort`, `matchMode` and `facets` |
| `GET /api/catalog/suggest?q=…` | Up to 5 products (best first), 3 brands and 3 categories for the search box |

`GET /api/catalog/brands` was **removed**: the brand facet replaces it, with counts.

**How a search runs** (`searchProducts`):
1. **Clean the input:** keep only letters and digits, drop 1-letter words, max 8 words. Operators can't be injected,
   and the text is passed as a query **parameter**.
2. Build a **prefix** query: `running shoes` becomes `running:* & shoes:*`. `to_tsquery('english', …)` stems it to
   `'run':* & 'shoe':*`, so half-typed words already match.
3. `WHERE "searchVector" @@ query`, `ORDER BY ts_rank(...)`. Matches in the name rank above matches in the description.
4. **Fallback:** if no product has *all* the words, search for *any* of them (`matchMode: 'any'`).

**Sorting:** `sort` is optional. The default is `relevance` when searching and `newest` otherwise.
For relevance, the ids that pass the other filters are ordered by rank, one page is cut out, and
only that page is loaded.

**Facets** (`getFacets`): category counts, brand counts, and how many products have 4+, 3+ and 2+ stars.
**Each facet ignores its own filter** and applies all the others. After picking "Nike" the brand list
still shows the other brands' counts, so you can switch with one click.

## Frontend side

| File | What it does |
|---|---|
| `components/SearchBox.tsx` | Header search: **debounced** suggestions dropdown with "Search for …", categories, brands and products; ↑/↓/Enter/Esc keyboard support; ARIA combobox roles |
| `lib/use-debounce.ts` | `useDebounce(value, 250)`: only passes the value on once typing pauses |
| `catalog.api.ts` | `useProducts` returns `ProductList` (with facets), new `useSuggestions` (cancels outdated requests with `signal`). `useBrands` removed |
| `components/FilterSidebar.tsx` | Brand and rating options from the facets, with counts. Empty options are hidden or disabled |
| `components/CategoryTabs.tsx` | Each tab shows its result count for the current search and filters |
| `CatalogPage.tsx` | "Best match" sort when searching, partial-match notice, "Clear all filters" keeps the search text |

## Concepts to be able to explain

1. How does full-text search differ from `ILIKE '%text%'`? Why does "running shoes" match "running shoe"?
2. What does a GIN index store, and why does it make search fast?
3. Why is `searchVector` a generated column instead of being updated by the app?
4. What is a facet, and why does each facet ignore its own filter?
5. What is debouncing, and how many requests does typing "laptop" send with and without it?
6. How is the search input made safe from injection?
