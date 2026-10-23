import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  AlertTriangle,
  ArrowUp,
  BookA,
  BookOpen,
  Check,
  ClipboardList,
  Copy,
  GraduationCap,
  Lightbulb,
  ListTree,
  MessageSquare,
  NotebookPen,
  Quote,
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { withTerms } from './TermText';
import { PageTitle } from '@/components/layout/PageTitle';

// One of the two shared PDFs (Feature Spec, Pro Guide) as a web page: every section, list, table
// and code sample from docs/spec.js or docs/guide.js, plus a contents list, a reading progress
// bar and sections that fade in while scrolling. Our "review notes" (where the PDF is out of date)
// are separate boxes the reader can hide. Every animation is skipped with "reduce motion".

const REVIEW_KEY = 'shopverse:docs-review-notes';
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function readReviewSetting() {
  try {
    return localStorage.getItem(REVIEW_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function DocumentPage({ doc }) {
  const { t } = useTranslation();
  const [showReview, setShowReview] = useState(readReviewSetting);
  const [active, setActive] = useState(doc.sections[0].id);
  const [showTop, setShowTop] = useState(false);
  const progressRef = useRef(null);

  // Opened with a section link (#kanban)? Go there. Otherwise start at the top: this page lives
  // outside the store layout, so the store's scroll restoration doesn't apply here.
  useEffect(() => {
    const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (target) target.scrollIntoView({ block: 'start' });
    else window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(REVIEW_KEY, showReview ? 'on' : 'off');
    } catch {
      // the switch still works, it just isn't remembered
    }
  }, [showReview]);

  // Reading progress + "back to top": one passive scroll listener, drawn once per frame. The bar
  // is moved with transform (no React re-render on every pixel scrolled).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
      setShowTop(window.scrollY > 800);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Scrollspy: the section crossing the upper part of the screen is "active" in the contents list
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    doc.sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [doc]);

  const goTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`); // shareable link to the section
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageTitle title={`${doc.subtitle} · ${doc.title}`} />

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5">
          <Link to="/training" className="flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 hover:bg-slate-100">
            <GraduationCap className="size-5 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
            <span className="truncate text-sm font-semibold">{t('docs.backToTraining')}</span>
          </Link>
          <nav aria-label={t('training.sources')} className="ml-1 flex gap-1">
            <DocLink to="/training/spec" current={doc.slug === 'spec'} icon={ClipboardList} label={t('training.spec')} />
            <DocLink to="/training/guide" current={doc.slug === 'guide'} icon={BookOpen} label={t('training.guide')} />
            <DocLink to="/training/glossary" current={false} icon={BookA} label={t('training.glossary')} />
          </nav>
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">{t('docs.reviewNotes')}</span>
            <span className="sr-only sm:hidden">{t('docs.reviewNotes')}</span>
            <input type="checkbox" checked={showReview} onChange={(e) => setShowReview(e.target.checked)} className="peer sr-only" />
            {/* the switch: a track and a knob that slides */}
            <span
              aria-hidden
              className="relative h-5 w-9 rounded-full bg-slate-300 transition-colors peer-checked:bg-green-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
            />
          </label>
          <ThemeToggle />
        </div>
        {/* reading progress */}
        <div className="h-0.5 bg-transparent">
          <div ref={progressRef} className="h-full origin-left bg-gradient-to-r from-brand-600 to-purple-500" style={{ transform: 'scaleX(0)' }} />
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-slate-200 bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 motion-safe:animate-fade-up">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{doc.subtitle}</p>
          <h1 className="mt-1 bg-gradient-to-r from-brand-600 to-purple-500 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
            {doc.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-700">
            <Rich text={doc.intro} />
          </p>
          <div className="mt-6 grid max-w-3xl gap-2 sm:grid-cols-2">
            {doc.legend.map(([tag, meaning], i) => (
              <div
                key={tag}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm motion-safe:animate-fade-up"
                style={{ animationDelay: `${150 + i * 70}ms` }}
              >
                <Tag name={tag} />
                <span className="text-slate-600">{meaning}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[260px_1fr]">
        {/* Phones and tablets: the contents fold away */}
        <details className="rounded-lg border border-slate-200 bg-surface lg:hidden">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold">
            <ListTree className="size-4" aria-hidden /> {t('docs.contents')}
          </summary>
          <Contents sections={doc.sections} active={active} onPick={goTo} />
        </details>
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-4">
            <p className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <ListTree className="size-4" aria-hidden /> {t('docs.contents')}
            </p>
            <Contents sections={doc.sections} active={active} onPick={goTo} />
          </div>
        </aside>

        <main className="min-w-0 space-y-12" lang="en">
          {doc.sections.map((section) => (
            <Reveal key={section.id}>
              <section id={section.id} className="scroll-mt-24" aria-labelledby={`${section.id}-title`}>
                <h2 id={`${section.id}-title`} className="border-b border-slate-200 pb-2 text-2xl font-bold text-brand-600 dark:text-brand-300">
                  {section.title}
                </h2>
                <div className="mt-5 space-y-4">
                  {section.blocks.map((block, i) =>
                    block.kind === 'review' && !showReview ? null : <Block key={i} block={block} />,
                  )}
                </div>
              </section>
            </Reveal>
          ))}
          <p className="border-t border-slate-200 pt-6 text-sm italic text-slate-500">{doc.footer}</p>
        </main>
      </div>

      {/* Back to top: slides in after scrolling down */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
        aria-label={t('docs.backToTop')}
        tabIndex={showTop ? 0 : -1}
        className={`fixed bottom-6 right-6 z-20 flex size-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all duration-300 hover:bg-brand-700 active:bg-brand-800 ${
          showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <ArrowUp className="size-5" aria-hidden />
      </button>
    </div>
  );
}

function DocLink({ to, current, icon: Icon, label }) {
  return (
    <Link
      to={to}
      aria-current={current ? 'page' : undefined}
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm ${
        current ? 'bg-brand-50 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon className="size-4" aria-hidden />
      {/* phones: icon only (the name stays for screen readers and as a tooltip) */}
      <span className="sr-only sm:not-sr-only">{label}</span>
    </Link>
  );
}

function Contents({ sections, active, onPick }) {
  return (
    <ol className="space-y-0.5 px-1 pb-2 text-sm">
      {sections.map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              onPick(s.id);
            }}
            aria-current={active === s.id ? 'true' : undefined}
            className={`block rounded-md border-l-2 px-3 py-1.5 transition-colors ${
              active === s.id
                ? 'border-brand-600 bg-brand-50 font-medium text-slate-900'
                : 'border-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

// Fades a section in the first time it scrolls into view. With "reduce motion" (or no
// IntersectionObserver) it is simply visible.
function Reveal({ children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => prefersReducedMotion() || !('IntersectionObserver' in window));
  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shown]);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
      {children}
    </div>
  );
}

const TAGS = {
  'MUST HAVE': 'border-green-200 bg-green-50 text-green-900',
  MUST: 'border-green-200 bg-green-50 text-green-900',
  'GOOD TO HAVE': 'border-blue-200 bg-blue-50 text-blue-900',
  GOOD: 'border-blue-200 bg-blue-50 text-blue-900',
  'WOW FACTOR': 'border-amber-200 bg-amber-50 text-amber-900',
  WOW: 'border-amber-200 bg-amber-50 text-amber-900',
  'WHY THIS MATTERS': 'border-purple-200 bg-purple-50 text-purple-900',
  'COMMON MISTAKE': 'border-amber-200 bg-amber-50 text-amber-900',
  'INTERVIEW POINT': 'border-blue-200 bg-blue-50 text-blue-900',
};

function Tag({ name }) {
  return (
    <span className={`inline-block shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 align-middle text-[0.7rem] font-bold tracking-wide ${TAGS[name]}`}>
      {name}
    </span>
  );
}

// "**bold**", "`code`" and "[MUST HAVE]" -> React elements (never raw HTML)
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[(?:MUST HAVE|GOOD TO HAVE|WOW FACTOR|MUST|GOOD|WOW)\])/g;
function Rich({ text }) {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{withTerms(part.slice(2, -2), `${i}-`)}</strong>;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      return (
        <code key={i} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.88em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    const tag = part.match(/^\[(.+)\]$/)?.[1];
    if (tag && TAGS[tag]) return <Tag key={i} name={tag} />;
    return withTerms(part, `${i}-`);
  });
}

const CALLOUTS = {
  why: { icon: Lightbulb, label: 'WHY THIS MATTERS', style: 'border-purple-200 bg-purple-50 text-purple-900' },
  mistake: { icon: AlertTriangle, label: 'COMMON MISTAKE', style: 'border-amber-200 bg-amber-50 text-amber-900' },
  interview: { icon: MessageSquare, label: 'INTERVIEW POINT', style: 'border-blue-200 bg-blue-50 text-blue-900' },
  answer: { icon: Quote, label: null, style: 'border-blue-200 bg-blue-50 text-blue-900' },
  review: { icon: NotebookPen, label: 'docs.reviewNote', style: 'border-dashed border-slate-300 bg-surface text-slate-800' },
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
    case 'h3':
      return (
        <h3 className="pt-3 text-lg font-semibold">
          <Rich text={block.text} />
        </h3>
      );
    case 'list':
    case 'olist': {
      const List = block.type === 'list' ? 'ul' : 'ol';
      return (
        <List className={`${block.type === 'list' ? 'list-disc' : 'list-decimal'} space-y-1.5 pl-6 leading-relaxed text-slate-700 marker:text-slate-400`}>
          {block.items.map((item, i) => (
            <li key={i}>
              <Rich text={item} />
            </li>
          ))}
        </List>
      );
    }
    case 'table':
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-brand-600 to-purple-500 text-white">
              <tr>
                {block.head.map((cell) => (
                  <th key={cell} scope="col" className="px-3 py-2 font-semibold">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 align-top">
              {block.rows.map((row, i) => (
                <tr key={i} className="transition-colors odd:bg-slate-50/60 hover:bg-brand-50">
                  {row.map((cell, j) => (
                    <td key={j} className={`px-3 py-2 ${j === 0 ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
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
      return <CodeBlock lang={block.lang} code={block.code} />;
    case 'callout': {
      const { icon: Icon, label, style } = CALLOUTS[block.kind];
      return (
        <aside className={`rounded-lg border border-l-4 p-4 ${style}`}>
          <p className="leading-relaxed">
            <Icon className="mr-1.5 inline size-4 align-[-2px]" aria-hidden />
            {label && <strong className="mr-1">{label.startsWith('docs.') ? t(label) : label}:</strong>}
            <Rich text={block.text} />
          </p>
        </aside>
      );
    }
    default:
      return null;
  }
}

function CodeBlock({ lang, code }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // clipboard blocked (e.g. not https): the code can still be selected by hand
    }
  };

  return (
    <div className="group relative">
      <div className="flex items-center justify-between rounded-t-lg bg-slate-800 px-4 py-1.5 text-xs text-white/60 dark:bg-black/40">
        <span className="font-mono">{lang}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white/80 hover:bg-white/10 hover:text-white"
          aria-live="polite"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-green-400 motion-safe:animate-pop" aria-hidden /> {t('docs.copied')}
            </>
          ) : (
            <>
              <Copy className="size-3.5" aria-hidden /> {t('docs.copy')}
            </>
          )}
        </button>
      </div>
      {/* bg-night stays dark in both themes, so the text colour is fixed (slate would flip) */}
      <pre className="overflow-x-auto rounded-b-lg bg-night p-4 text-[0.82rem] leading-relaxed text-white/90" tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
