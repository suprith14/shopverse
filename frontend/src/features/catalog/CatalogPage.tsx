import { useSearchParams } from 'react-router';
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States';
import { useProducts, type ProductFilters } from './catalog.api';
import { CategoryTabs } from './components/CategoryTabs';
import { FilterSidebar } from './components/FilterSidebar';
import { Pagination } from './components/Pagination';
import { ProductCard } from './components/ProductCard';

const num = (v: string | null) => (v === null || v === '' ? undefined : Number(v));

// The URL is the single source of truth for filters: /shop?category=books&sort=price_asc&page=2
// Changing a filter updates the URL, and the URL drives the API query.
function useFiltersFromUrl() {
  const [params, setParams] = useSearchParams();

  const filters: ProductFilters = {
    category: params.get('category') ?? undefined,
    q: params.get('q') ?? undefined,
    brand: params.get('brand') ?? undefined,
    minPrice: num(params.get('minPrice')),
    maxPrice: num(params.get('maxPrice')),
    minRating: num(params.get('minRating')),
    sort: (params.get('sort') as ProductFilters['sort']) ?? 'newest',
    page: num(params.get('page')) ?? 1,
  };

  const update = (patch: Partial<ProductFilters>) => {
    const next = { ...filters, page: 1, ...patch }; // any filter change resets to page 1
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value !== undefined && value !== '' && !(key === 'page' && value === 1)) search.set(key, String(value));
    }
    setParams(search);
  };

  return { filters, update, reset: () => setParams(filters.category ? { category: filters.category } : {}) };
}

export function CatalogPage() {
  const { filters, update, reset } = useFiltersFromUrl();
  const { data, isLoading, isError, error, isFetching } = useProducts(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{filters.q ? `Results for "${filters.q}"` : 'Shop'}</h1>
        {data && <p className="text-sm text-slate-500">{data.total} products</p>}
      </div>

      {/* Changing tab clears brand (brands differ per category) */}
      <CategoryTabs active={filters.category} onChange={(category) => update({ category, brand: undefined })} />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <FilterSidebar filters={filters} onChange={update} onReset={reset} />

        <div className="space-y-6">
          <div className="flex justify-end">
            <select
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as ProductFilters['sort'] })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              aria-label="Sort products"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>

          {isLoading && <Spinner />}
          {isError && <ErrorState error={error} />}
          {data && data.items.length === 0 && <EmptyState title="No products found" hint="Try removing some filters." />}

          {data && data.items.length > 0 && (
            <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}>
              {data.items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={(page) => update({ page })} />}
        </div>
      </div>
    </div>
  );
}
