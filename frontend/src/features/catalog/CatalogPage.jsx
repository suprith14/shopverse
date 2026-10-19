// /shop: the product list with category tabs, filters, sorting, search results and pages.
// Every filter lives in the URL, so a filtered page can be shared, bookmarked, reloaded, and the
// Back button works. useProducts(filters) asks the API for exactly what the URL says.

import { useTranslation } from 'react-i18next';
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

// "25" -> 25, missing or empty -> undefined (= no filter)
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

  // Change some filters, e.g. update({ sort: "price_asc" }): writes a new URL, which triggers a new query.
  const update = (patch) => {
    const next = { ...filters, page: 1, ...patch }; // any filter change resets to page 1
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      // keep the URL short: skip empty filters and page=1
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
  const { t } = useTranslation();
  const { filters, update, reset } = useFiltersFromUrl();
  // isFetching = a new page/filter is loading while the old results are still shown
  const { data, isLoading, isError, error, isFetching } = useProducts(filters);
  // phones only: is the filter panel open?
  const [showFilters, setShowFilters] = useState(false);
  // how many filters are on, shown as a badge on the "Filters" button
  const activeFilters = [filters.brand, filters.minPrice ?? filters.maxPrice, filters.minRating].filter(
    (v) => v !== undefined,
  ).length;

  return (
    <div className="space-y-6">
      <PageTitle title={filters.q ? `"${filters.q}"` : t('catalog.title')} />
      <div>
        <h1 className="text-2xl font-bold">{filters.q ? t('catalog.resultsFor', { query: filters.q }) : t('catalog.title')}</h1>
        {data && <p className="text-sm text-slate-500">{t('catalog.productCount', { count: data.total })}</p>}
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
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-surface px-4 py-2 text-sm font-medium lg:hidden"
      >
        <SlidersHorizontal className="size-4" /> {showFilters ? t('catalog.hideFilters') : t('catalog.filters')}
        {activeFilters > 0 && (
          <span className="rounded-full bg-brand-600 px-2 text-xs text-white">{activeFilters}</span>
        )}
      </button>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Always visible on large screens; on phones only after tapping "Filters" */}
        <div id="filters" className={showFilters ? 'block' : 'hidden lg:block'}>
          <FilterSidebar filters={filters} facets={data?.facets} onChange={update} onReset={reset} />
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* No product had every word: we're showing products that match some of them. */}
            {data?.matchMode === 'any' ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {t('catalog.partialMatch', { query: filters.q })}
              </p>
            ) : (
              <span />
            )}
            <select
              // the URL's sort, else what the server chose (best match when searching)
              value={filters.sort ?? data?.sort ?? 'newest'}
              onChange={(e) => update({ sort: e.target.value })}
              className="rounded-lg border border-slate-300 bg-surface px-3 py-2 text-sm"
              aria-label={t('catalog.sortLabel')}
            >
              {/* "Best match" only makes sense when searching */}
              {filters.q && <option value="relevance">{t('catalog.sort.relevance')}</option>}
              <option value="newest">{t('catalog.sort.newest')}</option>
              <option value="price_asc">{t('catalog.sort.price_asc')}</option>
              <option value="price_desc">{t('catalog.sort.price_desc')}</option>
              <option value="rating">{t('catalog.sort.rating')}</option>
            </select>
          </div>

          {isLoading && <ProductGridSkeleton count={6} className="grid grid-cols-2 gap-4 md:grid-cols-3" />}
          {isError && <ErrorState error={error} />}
          {data && data.items.length === 0 && (
            <EmptyState title={t('catalog.noProducts')} hint={t('catalog.noProductsHint')} />
          )}

          {data && data.items.length > 0 && (
            // Faded while the next page loads, instead of an empty grid
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
