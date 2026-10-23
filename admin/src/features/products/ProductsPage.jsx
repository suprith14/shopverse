import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { AlertTriangle, FileSpreadsheet, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States';
import { formatPrice, getErrorMessage } from '@/lib/format';
import { useDebounce } from '@/lib/use-debounce';
import { useGetCategoriesQuery, useGetProductsQuery } from './productsApi';

export function ProductsPage() {
  // Filters live in the URL (?q=nike&status=hidden&page=2): shareable, and the back button works.
  const [params, setParams] = useSearchParams();
  const filters = {
    q: params.get('q') ?? undefined,
    category: params.get('category') ?? undefined,
    status: params.get('status') ?? 'all',
    lowStock: params.get('lowStock') === 'true',
    page: Number(params.get('page') ?? 1),
  };

  const setFilter = (patch) => {
    const next = { ...filters, page: 1, ...patch }; // changing a filter goes back to page 1
    const search = new URLSearchParams();
    if (next.q) search.set('q', next.q);
    if (next.category) search.set('category', next.category);
    if (next.status && next.status !== 'all') search.set('status', next.status);
    if (next.lowStock) search.set('lowStock', 'true');
    if (next.page && next.page > 1) search.set('page', String(next.page));
    setParams(search);
  };

  // The search box updates the URL only after typing pauses.
  const [text, setText] = useState(filters.q ?? '');
  const debounced = useDebounce(text);
  useEffect(() => {
    if ((debounced || undefined) !== filters.q) setFilter({ q: debounced || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced text
  }, [debounced]);

  const { data, isLoading, isFetching, error } = useGetProductsQuery(filters);
  const { data: categories = [] } = useGetCategoriesQuery();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          {data && <p className="text-sm text-slate-500">{data.total} products</p>}
        </div>
        <div className="flex gap-2">
          <Link to="/products/import">
            <Button variant="secondary">
              <FileSpreadsheet className="size-4" /> Import from Excel
            </Button>
          </Link>
          <Link to="/products/new">
            <Button>
              <Plus className="size-4" /> New product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search name, brand or SKU"
            aria-label="Search products"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <select
          value={filters.category ?? ''}
          onChange={(e) => setFilter({ category: e.target.value || undefined })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          aria-label="Category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilter({ status: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          aria-label="Status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.lowStock}
            onChange={(e) => setFilter({ lowStock: e.target.checked })}
          />
          Low stock only
        </label>
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorState message={getErrorMessage(error)} />}
      {data && data.items.length === 0 && <EmptyState title="No products found" hint="Try different filters." />}

      {data && data.items.length > 0 && (
        <div
          className={`overflow-x-auto rounded-xl border border-slate-200 bg-white ${isFetching ? 'opacity-60' : ''}`}
        >
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Price from</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/products/${p.id}`} className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="size-10 rounded-lg bg-slate-100 object-cover" />
                      <div>
                        <p className="font-medium text-slate-900 hover:underline">{p.name}</p>
                        <p className="text-xs text-slate-500">
                          {p.brand ?? 'No brand'} · {p.variants.length} variant{p.variants.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category.name}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(p.basePrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 ${p.lowStock ? 'font-medium text-amber-700' : ''}`}
                    >
                      {p.lowStock && <AlertTriangle className="size-3.5" />} {p.totalStock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" disabled={data.page <= 1} onClick={() => setFilter({ page: data.page - 1 })}>
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={data.page >= data.totalPages}
            onClick={() => setFilter({ page: data.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
