// Page buttons under the product grid: ‹ 1 2 3 ›. The current page comes from the URL
// (?page=2) and a click calls onChange, which CatalogPage writes back into the URL.

import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, onChange }) {
  const { t } = useTranslation();
  // one page only: no buttons at all (after the hook, hooks must always run)
  if (totalPages <= 1) return null;
  const btn = 'flex size-9 items-center justify-center rounded-lg text-sm font-medium transition';

  return (
    <nav className="flex items-center justify-center gap-1" aria-label={t('catalog.pagination')}>
      <button
        className={`${btn} hover:bg-slate-200 disabled:opacity-40`}
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label={t('catalog.previousPage')}
      >
        <ChevronLeft className="size-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          // tells screen readers which page is the current one
          aria-current={p === page ? 'page' : undefined}
          className={`${btn} ${p === page ? 'bg-slate-900 text-slate-50' : 'hover:bg-slate-200'}`}
        >
          {p}
        </button>
      ))}
      <button
        className={`${btn} hover:bg-slate-200 disabled:opacity-40`}
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        aria-label={t('catalog.nextPage')}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
