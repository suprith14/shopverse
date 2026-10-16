import { useCategories } from '../catalog.api';

interface Props {
  active?: string;
  onChange: (slug: string | undefined) => void;
}

// "All | Sneakers | Electronics | Books | Home Decor" tabs, built from the categories API.
export function CategoryTabs({ active, onChange }: Props) {
  const { data: categories = [] } = useCategories();
  const tabs = [{ slug: undefined, name: 'All' }, ...categories];

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
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              selected ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
            }`}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
