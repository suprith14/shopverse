import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { BookA, GraduationCap, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { PageTitle } from '@/components/layout/PageTitle';
import { TERMS } from './terms';

// Every short form from the training and the two documents, A to Z, with a search box that looks
// in the short form, the full form and the meaning ("purchase" finds PO).
export function GlossaryPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  // ?q=RFP (from the training search) starts the page filtered to that term
  const [query, setQuery] = useState(() => params.get('q') ?? '');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = TERMS.filter(
      ([term, full, meaning]) => !q || `${term} ${full} ${meaning}`.toLowerCase().includes(q),
    ).sort((a, b) => a[0].localeCompare(b[0], 'en', { sensitivity: 'base' }));
    const byLetter = new Map();
    for (const entry of matches) {
      const letter = /[a-z]/i.test(entry[0][0]) ? entry[0][0].toUpperCase() : '#';
      if (!byLetter.has(letter)) byLetter.set(letter, []);
      byLetter.get(letter).push(entry);
    }
    return [...byLetter.entries()];
  }, [query]);
  const count = groups.reduce((n, [, list]) => n + list.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageTitle title={t('training.glossary')} />
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
          <Link to="/training" className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-slate-100">
            <GraduationCap className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
            <span className="text-sm font-semibold">{t('docs.backToTraining')}</span>
          </Link>
          <span className="ml-auto" />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="motion-safe:animate-fade-up">
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <BookA className="size-8 text-brand-600 dark:text-brand-300" aria-hidden /> {t('training.glossary')}
          </h1>
          <p className="mt-2 text-slate-600">{t('training.glossaryIntro')}</p>
          <label className="relative mt-6 block">
            <span className="sr-only">{t('training.glossarySearch')}</span>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('training.glossarySearch')}
              className="w-full rounded-xl border border-slate-300 bg-surface py-3 pl-10 pr-3 outline-none focus:border-brand-500"
            />
          </label>
          <p className="mt-2 text-sm text-slate-500" aria-live="polite">
            {t('training.glossaryCount', { count })}
          </p>
        </div>

        {/* A-Z jump links */}
        <nav aria-label="A-Z" className="mt-6 flex flex-wrap gap-1">
          {groups.map(([letter]) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="rounded-md px-2 py-1 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-300"
            >
              {letter}
            </a>
          ))}
        </nav>

        <div className="mt-6 space-y-8">
          {groups.map(([letter, list]) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-20">
              <h2 className="border-b border-slate-200 pb-1 text-xl font-bold text-brand-600 dark:text-brand-300">
                {letter}
              </h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {list.map(([term, full, meaning]) => (
                  <div
                    key={term}
                    className="rounded-lg border border-slate-200 bg-surface p-3 transition hover:border-brand-300 hover:shadow-sm"
                  >
                    <dt>
                      <span className="font-mono text-base font-bold">{term}</span>
                      <span className="ml-2 text-sm text-slate-600">{full}</span>
                    </dt>
                    <dd className="mt-1 text-sm text-slate-700">{meaning}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
