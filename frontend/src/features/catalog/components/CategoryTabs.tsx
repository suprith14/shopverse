import type { ProductFacets } from '@/types/api';
import { useCategories } from '../catalog.api';

interface Props {
  active?: string;
  facets?: ProductFacets;
  onChange: (slug: string | undefined) => void;
}

// "All | Sneakers | Electronics | Books | Home Decor" tabs.
// With facets, each tab shows how many results it has for the current search and filters,
// e.g. searching "wireless" shows "Electronics 3 · Books 0".
export function CategoryTabs({ active, facets, onChange }: Props) {
  const { data: categories = [] } = useCategories();
  const countBySlug = new Map(facets?.categories.map((c) => [c.slug, c.count]));
  const total = facets?.categories.reduce((sum, c) => sum + c.count, 0);
  const tabs = [{ slug: undefined, name: 'All', count: total }, ...categories.map((c) => ({ ...c, count: countBySlug.get(c.slug) }))];

  return (
    <div role="tablist" className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const selected = tab.slug === active;
        return (
          <button
            key={tab.name}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.slug)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
              selected ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
            } ${tab.count === 0 && !selected ? 'opacity-50' : ''}`}
          >
            {tab.name}
            {tab.count !== undefined && (
              <span className={`text-xs ${selected ? 'text-slate-300' : 'text-slate-400'}`}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
