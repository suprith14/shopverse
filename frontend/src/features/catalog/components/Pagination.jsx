import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const btn = 'flex size-9 items-center justify-center rounded-lg text-sm font-medium transition';

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        className={`${btn} hover:bg-slate-200 disabled:opacity-40`}
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`${btn} ${p === page ? 'bg-slate-900 text-white' : 'hover:bg-slate-200'}`}
        >
          {p}
        </button>
      ))}
      <button
        className={`${btn} hover:bg-slate-200 disabled:opacity-40`}
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
