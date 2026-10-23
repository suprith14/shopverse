import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookA,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardList,
  Clock,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  Link2,
  ListChecks,
  MessageSquare,
  Play,
  Printer,
  RotateCcw,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { PageTitle } from '@/components/layout/PageTitle';
import { MODULES, TRACKS } from './modules';
import { withTerms } from './TermText';
import { TrainingSearch } from './TrainingSearch';

// The training portal (opened in a new tab from My account): how product development works in a
// company. A page of its own, outside the store layout, and loaded only when opened (lazy route).
// The current module is in the URL (?m=git), so a lesson can be bookmarked or shared, and the
// browser's back button works. Progress, bookmarks, text size and the last lesson are per-browser
// conveniences kept in localStorage.

const KEYS = {
  progress: 'shopverse:training-progress',
  saved: 'shopverse:training-saved',
  last: 'shopverse:training-last',
  size: 'shopverse:training-text-size',
};
const SIZES = [1, 1.1, 1.2]; // text zoom steps for the lesson
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback; // private mode or blocked storage: the page still works, it just forgets
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // not saved: fine for a convenience setting
  }
}

export function TrainingPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [done, setDone] = useState(() => read(KEYS.progress, {}));
  const [saved, setSaved] = useState(() => read(KEYS.saved, {}));
  const [size, setSize] = useState(() => read(KEYS.size, 0));
  const [lastSlug] = useState(() => read(KEYS.last, null)); // where the reader stopped last visit
  const [filter, setFilter] = useState('all'); // all | todo | saved
  const [collapsed, setCollapsed] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const requested = params.get('m');
  const index = Math.max(
    0,
    MODULES.findIndex((m) => m.slug === requested),
  );
  const module = MODULES[index];
  const doneCount = MODULES.filter((m) => done[m.slug]).length;
  const lastModule =
    !requested && lastSlug && lastSlug !== module.slug ? MODULES.find((m) => m.slug === lastSlug) : null;

  useEffect(() => write(KEYS.progress, done), [done]);
  useEffect(() => write(KEYS.saved, saved), [saved]);
  useEffect(() => write(KEYS.size, size), [size]);
  useEffect(() => write(KEYS.last, module.slug), [module.slug]);

  const open = useCallback(
    (slug) => {
      setParams({ m: slug });
      window.scrollTo({ top: 0 });
    },
    [setParams],
  );
  const toggleDone = () => setDone((d) => ({ ...d, [module.slug]: !d[module.slug] }));
  const completeAndNext = () => {
    setDone((d) => ({ ...d, [module.slug]: true }));
    if (index < MODULES.length - 1) open(MODULES[index + 1].slug);
  };
  const resetProgress = () => {
    if (window.confirm(t('training.resetConfirm'))) setDone({});
  };

  // Keyboard: Ctrl/Cmd + K or "/" opens search; arrows move between lessons (never while typing)
  useEffect(() => {
    const onKey = (e) => {
      const typing = e.target.closest?.('input, textarea, select, [contenteditable="true"]');
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (typing || e.altKey || e.ctrlKey || e.metaKey || searchOpen) return;
      if (e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'ArrowRight' && index < MODULES.length - 1) open(MODULES[index + 1].slug);
      else if (e.key === 'ArrowLeft' && index > 0) open(MODULES[index - 1].slug);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, open, searchOpen]);

  // "Back to top" appears after scrolling down (one passive listener, one state change at a time)
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const visible = (m) => (filter === 'todo' ? !done[m.slug] : filter === 'saved' ? !!saved[m.slug] : true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 print:bg-white">
      <PageTitle title={`${module.title} · ${t('training.title')}`} />

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-surface/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
          <GraduationCap className="size-6 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{t('training.title')}</p>
            <div className="mt-1 flex items-center gap-2">
              <div
                className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 sm:w-32"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={MODULES.length}
                aria-valuenow={doneCount}
                aria-label={t('training.progress', { done: doneCount, total: MODULES.length })}
              >
                <div
                  className="h-full rounded-full bg-green-600 transition-[width] duration-500"
                  style={{ width: `${(doneCount / MODULES.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">
                {t('training.progress', { done: doneCount, total: MODULES.length })}
              </span>
            </div>
          </div>

          {/* Search: a wide button with the shortcut on bigger screens, an icon on phones */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-surface px-2.5 py-1.5 text-sm text-slate-500 hover:border-brand-300 hover:text-slate-800 active:bg-slate-100"
            aria-label={t('training.search')}
          >
            <Search className="size-4" aria-hidden />
            <span className="hidden md:inline">{t('training.search')}</span>
            <kbd className="hidden rounded border border-slate-300 px-1 text-[0.7rem] lg:inline">Ctrl K</kbd>
          </button>

          {/* Text size for the lesson */}
          <div
            className="hidden items-center rounded-lg border border-slate-300 sm:flex"
            role="group"
            aria-label={t('training.textSize')}
          >
            <button
              type="button"
              onClick={() => setSize((s) => Math.max(0, s - 1))}
              disabled={size === 0}
              className="px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              aria-label={t('training.textSmaller')}
              title={t('training.textSmaller')}
            >
              A−
            </button>
            <button
              type="button"
              onClick={() => setSize((s) => Math.min(SIZES.length - 1, s + 1))}
              disabled={size === SIZES.length - 1}
              className="border-l border-slate-300 px-2 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              aria-label={t('training.textLarger')}
              title={t('training.textLarger')}
            >
              A+
            </button>
          </div>

          <ThemeToggle />
          {/* Phones: icon only (the label stays for screen readers); wider screens: icon + text */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            title={t('training.backToStore')}
          >
            <ShoppingBag className="size-4" aria-hidden />
            <span className="sr-only lg:not-sr-only">{t('training.backToStore')}</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[260px_1fr]">
        {/* Continue where you stopped (only when opening the portal without a lesson in the URL) */}
        {lastModule && (
          <button
            type="button"
            onClick={() => open(lastModule.slug)}
            className="flex items-center gap-3 rounded-xl border border-brand-300 bg-brand-50 p-3 text-left motion-safe:animate-fade-up md:col-span-2 print:hidden"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
              <Play className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{t('training.continue')}</span>
              <span className="block truncate text-sm text-slate-600">
                {MODULES.indexOf(lastModule) + 1}. {lastModule.title}
              </span>
            </span>
            <ArrowRight className="ml-auto size-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
          </button>
        )}

        {/* The two source documents, the glossary and the tax calculator */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:col-span-2 print:hidden">
          <SourceLink
            to="/training/spec"
            icon={ClipboardList}
            title={t('training.spec')}
            hint={t('training.specHint')}
          />
          <SourceLink to="/training/guide" icon={BookOpen} title={t('training.guide')} hint={t('training.guideHint')} />
          <SourceLink
            to="/training/glossary"
            icon={BookA}
            title={t('training.glossary')}
            hint={t('training.glossaryHint')}
          />
          <SourceLink to="/tax-calculator" icon={Calculator} title={t('tax.title')} hint={t('training.taxHint')} />
        </div>

        {/* Phones: a dropdown instead of the sidebar */}
        <label className="md:hidden print:hidden">
          <span className="sr-only">{t('training.modules')}</span>
          <select
            value={module.slug}
            onChange={(e) => open(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-surface px-3 py-2.5 text-sm"
          >
            {TRACKS.map((track) => (
              <optgroup key={track} label={t(`training.track.${track}`)}>
                {MODULES.map((m, i) =>
                  m.track === track ? (
                    <option key={m.slug} value={m.slug}>
                      {done[m.slug] ? '✓ ' : ''}
                      {saved[m.slug] ? '★ ' : ''}
                      {i + 1}. {m.title}
                    </option>
                  ) : null,
                )}
              </optgroup>
            ))}
          </select>
        </label>

        <nav aria-label={t('training.modules')} className="hidden md:block print:hidden">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-4 overflow-y-auto pb-4">
            {/* Filters */}
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1" role="group" aria-label={t('training.filter')}>
              {['all', 'todo', 'saved'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    filter === f ? 'bg-surface text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t(`training.filter_${f}`)}
                </button>
              ))}
            </div>

            {TRACKS.map((track) => {
              const all = MODULES.filter((m) => m.track === track);
              const list = all.filter(visible);
              const trackDone = all.filter((m) => done[m.slug]).length;
              const isOpen = !collapsed[track];
              return (
                <div key={track}>
                  <button
                    type="button"
                    onClick={() => setCollapsed((c) => ({ ...c, [track]: !c[track] }))}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-100"
                  >
                    <ChevronDown
                      className={`size-3.5 transition-transform ${isOpen ? '' : '-rotate-90'}`}
                      aria-hidden
                    />
                    <span className="flex-1">{t(`training.track.${track}`)}</span>
                    <span className="font-normal normal-case tracking-normal">
                      {trackDone}/{all.length}
                    </span>
                  </button>
                  {isOpen && (
                    <ol className="mt-1 space-y-1">
                      {list.length === 0 && (
                        <li className="px-3 py-1 text-xs text-slate-400">{t('training.emptyFilter')}</li>
                      )}
                      {list.map((m) => (
                        <li key={m.slug}>
                          <button
                            type="button"
                            onClick={() => open(m.slug)}
                            aria-current={m.slug === module.slug ? 'page' : undefined}
                            className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                              m.slug === module.slug
                                ? 'bg-brand-50 font-medium text-slate-900'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {done[m.slug] ? (
                              <CheckCircle2
                                className="mt-0.5 size-4 shrink-0 text-green-600"
                                aria-label={t('training.completed')}
                              />
                            ) : (
                              <Circle className="mt-0.5 size-4 shrink-0 text-slate-300" aria-hidden />
                            )}
                            <span className="flex-1">
                              {MODULES.indexOf(m) + 1}. {m.title}
                            </span>
                            {saved[m.slug] && (
                              <BookmarkCheck
                                className="mt-0.5 size-3.5 shrink-0 text-amber-600"
                                aria-label={t('training.saved')}
                              />
                            )}
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={resetProgress}
              disabled={doneCount === 0}
              className="flex items-center gap-2 px-3 text-xs text-slate-500 hover:text-red-600 disabled:opacity-40 disabled:hover:text-slate-500"
            >
              <RotateCcw className="size-3.5" aria-hidden /> {t('training.resetProgress')}
            </button>
            <p className="flex items-start gap-2 px-3 text-xs text-slate-400">
              <HelpCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {t('training.keyboardHint')}
            </p>
          </div>
        </nav>

        <main className="min-w-0">
          {/* key = slug: a new module starts with a fresh quiz; zoom = the chosen text size */}
          <div style={{ zoom: SIZES[size] }}>
            <ModuleView
              key={module.slug}
              module={module}
              number={index + 1}
              isSaved={!!saved[module.slug]}
              onToggleSave={() => setSaved((s) => ({ ...s, [module.slug]: !s[module.slug] }))}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6 print:hidden">
            {done[module.slug] ? (
              <button
                type="button"
                onClick={toggleDone}
                className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-900"
                title={t('training.undoComplete')}
              >
                <CheckCircle2 className="size-4 motion-safe:animate-pop" aria-hidden /> {t('training.completed')}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={completeAndNext}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 active:bg-brand-800"
                >
                  <CheckCircle2 className="size-4" aria-hidden />
                  {index < MODULES.length - 1 ? t('training.completeNext') : t('training.markDone')}
                </button>
                {index < MODULES.length - 1 && (
                  <button
                    type="button"
                    onClick={toggleDone}
                    className="text-sm text-slate-600 underline-offset-4 hover:underline"
                  >
                    {t('training.markDone')}
                  </button>
                )}
              </>
            )}
            <div className="ml-auto flex gap-2">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => open(MODULES[index - 1].slug)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-surface px-3 py-2.5 text-sm hover:bg-slate-50"
                >
                  <ArrowLeft className="size-4" aria-hidden /> {t('training.previous')}
                </button>
              )}
              {index < MODULES.length - 1 && (
                <button
                  type="button"
                  onClick={() => open(MODULES[index + 1].slug)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-surface px-3 py-2.5 text-sm hover:bg-slate-50"
                >
                  {t('training.next')} <ArrowRight className="size-4" aria-hidden />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Back to top: slides in after scrolling down */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
        aria-label={t('docs.backToTop')}
        tabIndex={showTop ? 0 : -1}
        className={`fixed bottom-6 right-6 z-20 flex size-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all duration-300 hover:bg-brand-700 active:bg-brand-800 print:hidden ${
          showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <ArrowUp className="size-5" aria-hidden />
      </button>

      <TrainingSearch open={searchOpen} onClose={() => setSearchOpen(false)} onOpenModule={open} />
    </div>
  );
}

function SourceLink({ to, icon: Icon, title, hint }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-surface p-3 transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:text-brand-300">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 hidden text-xs text-slate-500 sm:block">{hint}</span>
      </span>
    </Link>
  );
}

// Small rounded toolbar buttons under the lesson title
function ToolButton({ icon: Icon, label, onClick, pressed }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors active:scale-95 ${
        pressed
          ? 'border-amber-200 bg-amber-50 text-amber-900'
          : 'border-slate-200 bg-surface text-slate-600 hover:border-brand-300 hover:text-slate-900'
      }`}
    >
      <Icon className="size-3.5" aria-hidden /> {label}
    </button>
  );
}

function ModuleView({ module, number, isSaved, onToggleSave }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const hasDeepDive = useMemo(() => module.blocks.some((b) => b.type === 'deep'), [module]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const jump = (id) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // clipboard blocked: the address bar still has the link
    }
  };

  return (
    <article lang="en">
      <p className="text-sm font-medium text-brand-600 dark:text-brand-300">{t('training.moduleN', { n: number })}</p>
      <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{module.title}</h1>
      <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
        <Clock className="size-4" aria-hidden /> {t('training.minutes', { count: module.minutes })}
      </p>

      {/* Lesson toolbar */}
      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        {hasDeepDive && <ToolButton icon={Layers} label={t('training.jumpDeep')} onClick={() => jump('deep-dive')} />}
        <ToolButton icon={HelpCircle} label={t('training.jumpQuiz')} onClick={() => jump('quiz')} />
        <ToolButton
          icon={isSaved ? BookmarkCheck : Bookmark}
          label={isSaved ? t('training.saved') : t('training.save')}
          onClick={onToggleSave}
          pressed={isSaved}
        />
        <ToolButton
          icon={copied ? Check : Link2}
          label={copied ? t('training.linkCopied') : t('training.copyLink')}
          onClick={copyLink}
        />
        <ToolButton icon={Printer} label={t('training.print')} onClick={() => window.print()} />
      </div>

      <p className="mt-4 text-lg text-slate-700">{module.summary}</p>
      <div className="mt-6 space-y-5">
        {module.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
      <Quiz questions={module.quiz} />
    </article>
  );
}

// "**bold** and `code`" -> React elements (never raw HTML, so nothing can be injected). Short forms
// (RFP, SOW...) in normal and bold text get their meaning on tap/hover; code is left as it is.
function Rich({ text }) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{withTerms(part.slice(2, -2), `${i}-`)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return withTerms(part, `${i}-`);
  });
}

const CALLOUTS = {
  rule: { icon: Lightbulb, label: 'training.rule', style: 'border-blue-200 bg-blue-50 text-blue-900' },
  mistake: { icon: AlertTriangle, label: 'training.mistake', style: 'border-amber-200 bg-amber-50 text-amber-900' },
  shopverse: { icon: ShoppingBag, label: 'training.inShopverse', style: 'border-green-200 bg-green-50 text-green-900' },
  interview: {
    icon: MessageSquare,
    label: 'training.interview',
    style: 'border-purple-200 bg-purple-50 text-purple-900',
  },
};

function Block({ block }) {
  const { t } = useTranslation();
  switch (block.type) {
    case 'p':
      return (
        <p className="leading-relaxed text-slate-700">
          <Rich text={block.text} />
        </p>
      );
    case 'list':
      return (
        <ul className="list-disc space-y-2 pl-5 leading-relaxed text-slate-700">
          {block.items.map((item, i) => (
            <li key={i}>
              <Rich text={item} />
            </li>
          ))}
        </ul>
      );
    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <div className="pt-0.5">
                <p className="font-semibold">{withTerms(step.title)}</p>
                <p className="text-slate-600">
                  <Rich text={step.text} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {block.head.map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 align-top">
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className={`px-3 py-2 ${j === 0 ? 'font-medium' : 'text-slate-600'}`}>
                      <Rich text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'code':
      return (
        // bg-night stays dark in both themes, so the text is a fixed light colour (slate-100
        // would turn dark in dark mode)
        <pre className="overflow-x-auto rounded-lg bg-night p-4 text-sm leading-relaxed text-white/90" tabIndex={0}>
          <code>{block.code}</code>
        </pre>
      );
    case 'callout': {
      const { icon: Icon, label, style } = CALLOUTS[block.kind];
      return (
        <aside className={`rounded-lg border p-4 ${style}`}>
          <p className="flex items-center gap-2 font-semibold">
            <Icon className="size-4" aria-hidden /> {block.title ?? t(label)}
          </p>
          <p className="mt-1 leading-relaxed">
            <Rich text={block.text} />
          </p>
        </aside>
      );
    }
    // The divider between a module's basics and its deep dive (deep-dives.js)
    case 'deep':
      return (
        <div
          id="deep-dive"
          className="flex scroll-mt-24 items-center gap-3 pt-6"
          role="separator"
          aria-label={t('training.deepDive')}
        >
          <span className="h-px flex-1 bg-slate-200" />
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-600 dark:text-brand-300">
            <Layers className="size-4" aria-hidden /> {t('training.deepDive')}
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
      );
    case 'h':
      return <h2 className="pt-2 text-lg font-semibold">{withTerms(block.text)}</h2>;
    case 'example':
      return (
        <figure className="rounded-xl border border-slate-200 bg-surface p-4 shadow-sm">
          <figcaption className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Briefcase className="size-4 text-brand-600 dark:text-brand-300" aria-hidden /> {withTerms(block.title)}
          </figcaption>
          <ol className="mt-3 space-y-2 border-l-2 border-brand-100 pl-4">
            {block.lines.map((line, i) => (
              <li key={i} className="leading-relaxed text-slate-700">
                <Rich text={line} />
              </li>
            ))}
          </ol>
        </figure>
      );
    case 'checklist':
      return <Checklist items={block.items} />;
    default:
      return null;
  }
}

// A checklist you can tick while reading (just for this visit: nothing is saved)
function Checklist({ items }) {
  const { t } = useTranslation();
  const [ticked, setTicked] = useState(() => new Set());
  const toggle = (i) =>
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  return (
    <fieldset className="rounded-xl border border-slate-200 bg-surface p-4">
      <legend className="flex items-center gap-2 px-1 text-sm font-semibold">
        <ListChecks className="size-4 text-green-600" aria-hidden /> {t('training.checklist')}
        <span className="font-normal text-slate-500">
          ({ticked.size}/{items.length})
        </span>
      </legend>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 text-slate-700">
              <input
                type="checkbox"
                checked={ticked.has(i)}
                onChange={() => toggle(i)}
                className="mt-1 size-4 shrink-0 accent-green-600"
              />
              <span className={ticked.has(i) ? 'text-slate-400 line-through transition-colors' : 'transition-colors'}>
                <Rich text={item} />
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

function Quiz({ questions }) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({});
  const score = useMemo(() => questions.filter((q, i) => answers[i] === q.answer).length, [answers, questions]);
  const finished = Object.keys(answers).length === questions.length;

  return (
    <section
      id="quiz"
      className="mt-10 scroll-mt-24 rounded-xl border border-slate-200 bg-surface p-5 print:hidden"
      aria-labelledby="quiz-title"
    >
      <h2 id="quiz-title" className="text-lg font-semibold">
        {t('training.quiz')}
      </h2>
      <ol className="mt-4 space-y-6">
        {questions.map((q, i) => {
          const picked = answers[i];
          const answered = picked !== undefined;
          return (
            <li key={i}>
              <fieldset>
                <legend className="font-medium">
                  {i + 1}. {q.q}
                </legend>
                <div className="mt-2 grid gap-2">
                  {q.options.map((option, j) => {
                    const state = !answered ? 'idle' : j === q.answer ? 'right' : j === picked ? 'wrong' : 'idle';
                    return (
                      <button
                        key={j}
                        type="button"
                        disabled={answered}
                        onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}
                        className={`rounded-lg border px-3 py-2 text-left text-sm ${
                          state === 'right'
                            ? 'border-green-200 bg-green-50 text-green-900'
                            : state === 'wrong'
                              ? 'border-amber-200 bg-amber-50 text-amber-900'
                              : 'border-slate-200 hover:bg-slate-50 disabled:opacity-60'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <p className="mt-2 text-sm text-slate-600" aria-live="polite">
                    <strong>{picked === q.answer ? t('training.correct') : t('training.notQuite')}</strong> {q.why}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
      {finished && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="font-medium">{t('training.score', { score, total: questions.length })}</p>
          <button
            type="button"
            onClick={() => setAnswers({})}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            {t('training.retry')}
          </button>
        </div>
      )}
    </section>
  );
}
