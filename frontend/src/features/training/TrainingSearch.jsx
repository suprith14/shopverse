import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { BookA, CornerDownLeft, FileText, Search } from 'lucide-react';
import { MODULES } from './modules';
import { TERMS } from './terms';

// Search across every lesson and the glossary (Ctrl/Cmd + K or "/"). Built on <dialog>: focus stays
// inside, Escape closes. Arrow keys move through the results, Enter opens one.

// All of a module's words in one lower-case string, built once
const blockText = (b) =>
  [
    b.text,
    b.title,
    ...(b.items ?? []).map((x) => (typeof x === 'string' ? x : `${x.title} ${x.text}`)),
    ...(b.lines ?? []),
    ...(b.rows ?? []).flat(),
    b.code,
  ]
    .filter(Boolean)
    .join(' ');
const INDEX = MODULES.map((m, i) => ({
  module: m,
  number: i + 1,
  title: m.title.toLowerCase(),
  text: `${m.title} ${m.summary} ${m.blocks.map(blockText).join(' ')} ${m.quiz.map((q) => q.q).join(' ')}`.toLowerCase(),
}));

export function TrainingSearch({ open, onClose, onOpenModule }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      setQuery('');
      setActive(0);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    // Ranking: a match in the title counts most, then how often the word appears in the lesson
    // (the lesson that is really about "escalation" mentions it far more than one that names it once)
    const score = (e) => (e.title.includes(q) ? 1000 : 0) + (e.text.split(q).length - 1);
    const modules = INDEX.filter((e) => e.text.includes(q))
      .sort((a, b) => score(b) - score(a))
      .slice(0, 10)
      .map((e) => ({
        kind: 'module',
        key: e.module.slug,
        label: `${e.number}. ${e.module.title}`,
        hint: e.module.summary,
        go: () => onOpenModule(e.module.slug),
      }));
    const terms = TERMS.filter(([term, full]) => `${term} ${full}`.toLowerCase().includes(q))
      .slice(0, 8)
      .map(([term, full, meaning]) => ({
        kind: 'term',
        key: `term-${term}`,
        label: `${term} · ${full}`,
        hint: meaning,
        go: () => navigate(`/training/glossary?q=${encodeURIComponent(term)}`),
      }));
    return [...modules, ...terms];
  }, [query, navigate, onOpenModule]);

  const choose = (r) => {
    onClose();
    r.go();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      choose(results[active]);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()} // click on the dimmed backdrop
      aria-label={t('training.search')}
      className="mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-xl rounded-2xl bg-surface p-0 text-slate-900 shadow-2xl backdrop:bg-night/60"
    >
      <div className="flex items-center gap-3 border-b border-slate-200 px-4">
        <Search className="size-5 shrink-0 text-slate-400" aria-hidden />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={t('training.searchPlaceholder')}
          aria-label={t('training.search')}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="training-search-results"
          aria-activedescendant={results[active] ? `sr-${results[active].key}` : undefined}
          className="w-full bg-transparent py-4 outline-none"
        />
        <kbd className="hidden rounded border border-slate-300 px-1.5 text-xs text-slate-500 sm:block">Esc</kbd>
      </div>
      <ul id="training-search-results" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
        {query.trim().length >= 2 && results.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-slate-500">{t('training.searchNoResults')}</li>
        )}
        {results.map((r, i) => (
          <li
            key={r.key}
            id={`sr-${r.key}`}
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => setActive(i)}
            onClick={() => choose(r)}
            className={`flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 ${i === active ? 'bg-brand-50' : ''}`}
          >
            {r.kind === 'module' ? (
              <FileText className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
            ) : (
              <BookA className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{r.label}</span>
              <span className="block truncate text-xs text-slate-500">{r.hint}</span>
            </span>
            {i === active && <CornerDownLeft className="mt-1 size-3.5 shrink-0 text-slate-400" aria-hidden />}
          </li>
        ))}
      </ul>
      <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">{t('training.searchHint')}</p>
    </dialog>
  );
}
