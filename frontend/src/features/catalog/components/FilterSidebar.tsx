import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useBrands, type ProductFilters } from '../catalog.api';

interface Props {
  filters: ProductFilters;
  onChange: (patch: Partial<ProductFilters>) => void;
  onReset: () => void;
}

const toCents = (dollars: string) => (dollars === '' ? undefined : Math.round(Number(dollars) * 100));
const toDollars = (cents?: number) => (cents === undefined ? '' : String(cents / 100));

export function FilterSidebar({ filters, onChange, onReset }: Props) {
  const { data: brands = [] } = useBrands(filters.category);

  // Price inputs are local state, applied on "Apply" so we don't fire a request per keystroke.
  const [min, setMin] = useState(toDollars(filters.minPrice));
  const [max, setMax] = useState(toDollars(filters.maxPrice));
  useEffect(() => {
    setMin(toDollars(filters.minPrice));
    setMax(toDollars(filters.maxPrice));
  }, [filters.minPrice, filters.maxPrice]);

  return (
    <aside className="space-y-6 rounded-xl border border-slate-200 bg-white p-5">
      <section>
        <h3 className="mb-2 text-sm font-semibold">Brand</h3>
        <select
          value={filters.brand ?? ''}
          onChange={(e) => onChange({ brand: e.target.value || undefined })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Price ($)</h3>
        <div className="flex items-center gap-2">
          <input type="number" min={0} placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <span className="text-slate-400">-</span>
          <input type="number" min={0} placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <Button variant="secondary" className="mt-2 w-full"
          onClick={() => onChange({ minPrice: toCents(min), maxPrice: toCents(max) })}>
          Apply price
        </Button>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Rating</h3>
        <div className="space-y-1.5 text-sm">
          {[4, 3, 2].map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2">
              <input type="radio" name="rating" checked={filters.minRating === r}
                onChange={() => onChange({ minRating: r })} />
              {r}+ stars
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="rating" checked={filters.minRating === undefined}
              onChange={() => onChange({ minRating: undefined })} />
            Any rating
          </label>
        </div>
      </section>

      <Button variant="ghost" className="w-full" onClick={onReset}>Clear all filters</Button>
    </aside>
  );
}
