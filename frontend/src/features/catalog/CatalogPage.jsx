import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { SlidersHorizontal } from 'lucide-react';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useProducts } from './catalog.api';
import { CategoryTabs } from './components/CategoryTabs';
import { FilterSidebar } from './components/FilterSidebar';
import { Pagination } from './components/Pagination';
import { ProductCard } from './components/ProductCard';
import { PageTitle } from '@/components/layout/PageTitle';

const num = (v) => (v === null || v === '' ? undefined : Number(v));

// The URL is the single source of truth for filters: /shop?category=books&sort=price_asc&page=2
// Changing a filter updates the URL, and the URL drives the API query.
function useFiltersFromUrl() {
  const [params, setParams] = useSearchParams();

  const filters = {
    category: params.get('category') ?? undefined,
    q: params.get('q') ?? undefined,
    brand: params.get('brand') ?? undefined,
    minPrice: num(params.get('minPrice')),
    maxPrice: num(params.get('maxPrice')),
    minRating: num(params.get('minRating')),
    // No sort in the URL = let the backend choose (best match when searching, newest otherwise).
    sort: params.get('sort') ?? undefined,
    page: num(params.get('page')) ?? 1,
  };

  const update = (patch) => {
    const next = { ...filters, page: 1, ...patch }; // any filter change resets to page 1
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value !== undefined && value !== '' && !(key === 'page' && value === 1)) search.set(key, String(value));
    }
    setParams(search);
  };

  // "Clear all filters" keeps the search text and category tab, and clears everything else.
  const reset = () => {
    const keep = new URLSearchParams();
    if (filters.q) keep.set('q', filters.q);
    if (filters.category) keep.set('category', filters.category);
    setParams(keep);
  };

  return { filters, update, reset };
}

export function CatalogPage() {
  const { filters, update, reset } = useFiltersFromUrl();
  const { data, isLoading, isError, error, isFetching } = useProducts(filters);
  const [showFilters, setShowFilters] = useState(false);
  const activeFilters = [filters.brand, filters.minPrice ?? filters.maxPrice, filters.minRating].filter(
    (v) => v !== undefined,
  ).length;

  return (
    <div className="space-y-6">
      <PageTitle title={filters.q ? `"${filters.q}"` : 'Shop'} />
      <div>
        <h1 className="text-2xl font-bold">{filters.q ? `Results for "${filters.q}"` : 'Shop'}</h1>
        {data && <p className="text-sm text-slate-500">{data.total} products</p>}
      </div>

      {/* Changing tab clears brand (brands differ per category) */}
      <CategoryTabs
        active={filters.category}
        facets={data?.facets}
        onChange={(category) => update({ category, brand: undefined })}
      />

      {/* Phones and tablets: filters fold away behind a button, so products come first.
           The count shows filters are active even while they're hidden. */}
      <button
        onClick={() => setShowFilters((s) => !s)}
        aria-expanded={showFilters}
        aria-controls="filters"
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium lg:hidden"
      >
        <SlidersHorizontal className="size-4" /> {showFilters ? 'Hide filters' : 'Filters'}
        {activeFilters > 0 && (
          <span className="rounded-full bg-brand-600 px-2 text-xs text-white">{activeFilters}</span>
        )}
      </button>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div id="filters" className={showFilters ? 'block' : 'hidden lg:block'}>
          <FilterSidebar filters={filters} facets={data?.facets} onChange={update} onReset={reset} />
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* No product had every word: we're showing products that match some of them. */}
            {data?.matchMode === 'any' ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                No exact matches for "{filters.q}". Showing products that match some of your words.
              </p>
            ) : (
              <span />
            )}
            <select
              value={filters.sort ?? data?.sort ?? 'newest'}
              onChange={(e) => update({ sort: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              aria-label="Sort products"
            >
              {filters.q && <option value="relevance">Best match</option>}
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>

          {isLoading && <ProductGridSkeleton count={6} className="grid grid-cols-2 gap-4 md:grid-cols-3" />}
          {isError && <ErrorState error={error} />}
          {data && data.items.length === 0 && (
            <EmptyState title="No products found" hint="Try removing some filters." />
          )}

          {data && data.items.length > 0 && (
            <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}>
              {data.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={(page) => update({ page })} />}
        </div>
      </div>
    </div>
  );
}
