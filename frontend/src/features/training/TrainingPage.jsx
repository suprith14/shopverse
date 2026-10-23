import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookA,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  GraduationCap,
  Layers,
  Lightbulb,
  ListChecks,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { PageTitle } from '@/components/layout/PageTitle';
import { MODULES, TRACKS } from './modules';
import { withTerms } from './TermText';

// The training portal (opened in a new tab from My account): how product development works in a
// company. A page of its own, outside the store layout, and loaded only when opened (lazy route).
// The current module is in the URL (?m=git), so a lesson can be bookmarked or shared, and the
// browser's back button works. Progress is a per-browser convenience, kept in localStorage.

const PROGRESS_KEY = 'shopverse:training-progress';

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) ?? {};
  } catch {
    return {}; // private mode or blocked storage: start fresh, the page still works
  }
}

export function TrainingPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [done, setDone] = useState(readProgress);
  const index = Math.max(
    0,
    MODULES.findIndex((m) => m.slug === params.get('m')),
  );
  const module = MODULES[index];
  const doneCount = MODULES.filter((m) => done[m.slug]).length;

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(done));
    } catch {
      // not saved: progress just won't survive a reload
    }
  }, [done]);

  const open = (slug) => {
    setParams({ m: slug });
    window.scrollTo({ top: 0 });
  };
  const toggleDone = () => setDone((d) => ({ ...d, [module.slug]: !d[module.slug] }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageTitle title={`${module.title} · ${t('training.title')}`} />

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <GraduationCap className="size-6 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{t('training.title')}</p>
            <div className="mt-1 flex items-center gap-2">
              <div
                className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={MODULES.length}
                aria-valuenow={doneCount}
                aria-label={t('training.progress', { done: doneCount, total: MODULES.length })}
              >
                <div
                  className="h-full rounded-full bg-green-600"
                  style={{ width: `${(doneCount / MODULES.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">
                {t('training.progress', { done: doneCount, total: MODULES.length })}
              </span>
            </div>
          </div>
          <ThemeToggle />
          {/* Phones: icon only (the label stays for screen readers); wider screens: icon + text */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            title={t('training.backToStore')}
          >
            <ShoppingBag className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">{t('training.backToStore')}</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[260px_1fr]">
        {/* The two source documents: the full Feature Spec and Pro Guide */}
        <div className="grid grid-cols-3 gap-2 md:col-span-2">
          <SourceLink to="/training/spec" icon={ClipboardList} title={t('training.spec')} hint={t('training.specHint')} />
          <SourceLink to="/training/guide" icon={BookOpen} title={t('training.guide')} hint={t('training.guideHint')} />
          <SourceLink to="/training/glossary" icon={BookA} title={t('training.glossary')} hint={t('training.glossaryHint')} />
        </div>

        {/* Phones: a dropdown instead of the sidebar */}
        <label className="md:hidden">
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
                      {i + 1}. {m.title}
                    </option>
                  ) : null,
                )}
              </optgroup>
            ))}
          </select>
        </label>

        <nav aria-label={t('training.modules')} className="hidden md:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-5 overflow-y-auto pb-4">
            {TRACKS.map((track) => (
              <div key={track}>
                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t(`training.track.${track}`)}
                </p>
                <ol className="space-y-1">
                  {MODULES.map((m, i) =>
                    m.track !== track ? null : (
                      <li key={m.slug}>
                        <button
                          type="button"
                          onClick={() => open(m.slug)}
                          aria-current={m.slug === module.slug ? 'page' : undefined}
                          className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm ${
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
                          <span>
                            {i + 1}. {m.title}
                          </span>
                        </button>
                      </li>
                    ),
                  )}
                </ol>
              </div>
            ))}
          </div>
        </nav>

        <main className="min-w-0">
          {/* key = slug: a new module starts with a fresh quiz */}
          <ModuleView key={module.slug} module={module} number={index + 1} />

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={toggleDone}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${
                done[module.slug]
                  ? 'border border-green-200 bg-green-50 text-green-900'
                  : 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800'
              }`}
            >
              <CheckCircle2 className="size-4" aria-hidden />
              {done[module.slug] ? t('training.completed') : t('training.markDone')}
            </button>
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

function ModuleView({ module, number }) {
  const { t } = useTranslation();
  return (
    <article lang="en">
      <p className="text-sm font-medium text-brand-600 dark:text-brand-300">{t('training.moduleN', { n: number })}</p>
      <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{module.title}</h1>
      <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
        <Clock className="size-4" aria-hidden /> {t('training.minutes', { count: module.minutes })}
      </p>
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
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{withTerms(part.slice(2, -2), `${i}-`)}</strong>;
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
        <div className="flex items-center gap-3 pt-6" role="separator" aria-label={t('training.deepDive')}>
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
              <input type="checkbox" checked={ticked.has(i)} onChange={() => toggle(i)} className="mt-1 size-4 shrink-0 accent-green-600" />
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
    <section className="mt-10 rounded-xl border border-slate-200 bg-surface p-5" aria-labelledby="quiz-title">
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
