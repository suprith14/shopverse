import { useTranslation } from 'react-i18next';
import { useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Loader2, Search, Tag, LayoutGrid } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { useDebounce } from '@/lib/use-debounce';
import { useSuggestions } from '../catalog.api';

// Header search with suggestions as you type.
//  - Debounced: waits 250 ms after the last keystroke before asking the server.
//  - Keyboard: ↑/↓ move, Enter opens the highlighted row (or searches), Esc closes.
// className positions the box (the header uses it twice: inline on wide screens, own row on phones).
export function SearchBox({ className = '' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  // on /shop?q=… the box shows the current search; elsewhere it starts empty
  const urlQuery = location.pathname === '/shop' ? (params.get('q') ?? '') : '';

  const [text, setText] = useState(urlQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // highlighted row, -1 = none
  const boxRef = useRef(null);
  const listId = useId(); // unique per instance: the header renders two search boxes (desktop + phone)

  // Keep the box in sync when the search changes from elsewhere (back button, clear filters).
  useEffect(() => setText(urlQuery), [urlQuery]);

  const debounced = useDebounce(text, 250);
  const { data, isFetching } = useSuggestions(open ? debounced : '');

  // Close when clicking anywhere outside the search box.
  useEffect(() => {
    const onClick = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const trimmed = text.trim();
  // The dropdown rows, in order: "Search for …", then matching categories, brands and products.
  const rows = [];
  if (trimmed.length >= 2) {
    rows.push({
      key: 'search',
      kind: 'search',
      to: `/shop?q=${encodeURIComponent(trimmed)}`,
      label: t('search.searchFor', { query: trimmed }),
    });
    if (data) {
      for (const c of data.categories)
        rows.push({
          key: `c-${c.slug}`,
          kind: 'category',
          to: `/shop?category=${c.slug}`,
          label: t(`category.${c.slug}`, { defaultValue: c.name }),
          sub: t('search.category'),
        });
      for (const b of data.brands)
        rows.push({ key: `b-${b}`, kind: 'brand', to: `/shop?brand=${encodeURIComponent(b)}`, label: b, sub: t('search.brand') });
      for (const p of data.products)
        rows.push({
          key: p.id,
          kind: 'product',
          to: `/products/${p.slug}`,
          label: p.name,
          sub: `${p.brand ?? ''} · ${formatPrice(p.basePrice)}`,
          image: p.image,
        });
    }
  }

  const go = (to) => {
    setOpen(false);
    setActive(-1);
    navigate(to);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (active >= 0 && rows[active]) return go(rows[active].to);
    go(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : '/shop');
  };

  // Arrow keys move through the rows, Enter opens the highlighted one, Escape closes the list
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  const showDropdown = open && rows.length > 0;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={onSubmit} role="search">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t('search.placeholder')}
          aria-label={t('search.label')}
          // ARIA combobox pattern: screen readers announce the list and the highlighted row
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-9 text-sm outline-none focus:border-brand-500 focus:bg-surface"
        />

        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </form>

      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-surface py-1 shadow-lg"
        >
          {rows.map((row, i) => (
            <li
              key={row.key}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              // mousedown (not click) fires before the input loses focus, so the dropdown is still there
              // mousedown (not click) fires before the input loses focus, so the list is still there
              onMouseDown={(e) => {
                e.preventDefault();
                go(row.to);
              }}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm ${i === active ? 'bg-slate-100' : ''}`}
            >
              <RowIcon row={row} />
              <div className="min-w-0 flex-1">
                <p className={`truncate ${row.kind === 'search' ? 'font-medium' : ''}`}>{row.label}</p>
                {row.sub && <p className="truncate text-xs text-slate-500">{row.sub}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RowIcon({ row }) {
  if (row.kind === 'product') {
    return (
      <div className="size-9 shrink-0 overflow-hidden rounded bg-slate-100">
        {row.image && <img src={row.image} alt="" className="size-full object-cover" />}
      </div>
    );
  }
  const Icon = row.kind === 'search' ? Search : row.kind === 'brand' ? Tag : LayoutGrid;
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500">
      <Icon className="size-4" />
    </div>
  );
}
