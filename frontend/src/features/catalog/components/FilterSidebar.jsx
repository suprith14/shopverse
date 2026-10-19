import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const toCents = (dollars) => (dollars === '' ? undefined : Math.round(Number(dollars) * 100));
const toDollars = (cents) => (cents === undefined ? '' : String(cents / 100));

// The counts come from the backend's facets. Each facet ignores its own filter, so after
// picking a brand the other brands still show their counts and can be picked instead.
export function FilterSidebar({ filters, facets, onChange, onReset }) {
  // Price inputs are local state, applied on "Apply" so we don't fire a request per keystroke.
  const [min, setMin] = useState(toDollars(filters.minPrice));
  const [max, setMax] = useState(toDollars(filters.maxPrice));
  useEffect(() => {
    setMin(toDollars(filters.minPrice));
    setMax(toDollars(filters.maxPrice));
  }, [filters.minPrice, filters.maxPrice]);

  // Hide brands with 0 results, but always keep the selected one visible so it can be unselected.
  const brands = (facets?.brands ?? []).filter((b) => b.count > 0 || b.value === filters.brand);

  return (
    <aside className="space-y-6 rounded-xl border border-slate-200 bg-surface p-5">
      <section>
        <h3 className="mb-2 text-sm font-semibold">Brand</h3>
        <div className="max-h-56 space-y-1.5 overflow-y-auto text-sm">
          <Option
            checked={!filters.brand}
            onSelect={() => onChange({ brand: undefined })}
            label="All brands"
            name="brand"
          />
          {brands.map((b) => (
            <Option
              key={b.value}
              name="brand"
              checked={filters.brand === b.value}
              count={b.count}
              label={b.value}
              onSelect={() => onChange({ brand: b.value })}
            />
          ))}
          {facets && brands.length === 0 && <p className="text-slate-400">No brands match</p>}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Price ($)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <span className="text-slate-400">-</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <Button
          variant="secondary"
          className="mt-2 w-full"
          onClick={() => onChange({ minPrice: toCents(min), maxPrice: toCents(max) })}
        >
          Apply price
        </Button>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Rating</h3>
        <div className="space-y-1.5 text-sm">
          {(facets?.ratings ?? [4, 3, 2].map((min) => ({ min, count: undefined }))).map((r) => (
            <Option
              key={r.min}
              name="rating"
              checked={filters.minRating === r.min}
              count={r.count}
              disabled={r.count === 0 && filters.minRating !== r.min}
              onSelect={() => onChange({ minRating: r.min })}
              label={
                <span className="flex items-center gap-1">
                  {r.min}
                  <Star className="size-3.5 fill-amber-400 text-amber-400" /> & up
                </span>
              }
            />
          ))}
          <Option
            name="rating"
            checked={filters.minRating === undefined}
            onSelect={() => onChange({ minRating: undefined })}
            label="Any rating"
          />
        </div>
      </section>

      <Button variant="ghost" className="w-full" onClick={onReset}>
        Clear all filters
      </Button>
    </aside>
  );
}

function Option({ name, label, count, checked, disabled, onSelect }) {
  return (
    <label className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}>
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onSelect} />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-slate-400">{count}</span>}
    </label>
  );
}
