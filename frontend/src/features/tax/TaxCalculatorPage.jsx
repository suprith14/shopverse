import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  AlertTriangle,
  ArrowDown,
  Calculator,
  Check,
  ChevronDown,
  Copy,
  Info,
  PiggyBank,
  Printer,
  RotateCcw,
  Scale,
  Share2,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { PageTitle } from '@/components/layout/PageTitle';
import { RULES } from './taxRules';
import { EMPTY_INPUT, compareRegimes, splitCtc } from './taxEngine';
import { SCENARIOS } from './scenarios';
import { findInsights } from './insights';
import { TRAPS } from './traps';
import { inr, pct } from './format';
import { decodeInput, encodeInput } from './share';
import { OfferCompare } from './OfferCompare';

// /tax-calculator: Indian income tax for an employee, old vs new regime, opened in a new tab from
// My account. All maths is in taxEngine.js (unit tested); this page only collects numbers and shows
// the result. Nothing is sent to the server: the figures stay in this browser.

const STORAGE_KEY = 'shopverse:tax-input';

// A share link (#s=...) wins over the figures saved in this browser
const sharedInput = () => (window.location.hash.startsWith('#s=') ? decodeInput(window.location.hash.slice(3)) : null);

const loadInput = () => {
  const shared = sharedInput();
  if (shared) return shared;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...EMPTY_INPUT, ...saved } : SCENARIOS[0].input;
  } catch {
    return SCENARIOS[0].input;
  }
};


// "6 lakh", "1.2 crore": how amounts are said in India, shown under each field
function inWords(n, t) {
  if (n >= 10000000) return t('tax.crore', { n: +(n / 10000000).toFixed(2) });
  if (n >= 100000) return t('tax.lakh', { n: +(n / 100000).toFixed(2) });
  return '';
}

// The form, as data: each section lists its fields; labels and hints come from i18n (tax.f.*, tax.h.*)
// Less common sections start folded unless they already hold a value (selects: [field, option set])
const DISABILITY = ['none', 'disabled', 'severe'];
const SECTIONS = [
  { id: 'salary', fields: ['basic', 'hra', 'special', 'otherAllowances', 'bonus', 'lta', 'employerPf', 'employerNps', 'employeePf', 'professionalTax'] },
  { id: 'rent', fields: ['rentMonthly', 'ltaClaimed'], toggles: ['metro'] },
  { id: 'deductions', oldOnly: true, fields: ['inv80C', 'nps80CCD1B', 'healthSelf', 'healthParents', 'homeLoanInterest', 'eduLoanInterest', 'donations80G'], toggles: ['parentsSenior'] },
  {
    id: 'perks',
    fold: true,
    fields: ['mealCards', 'gifts', 'esopPerquisite', 'childEduAllowance', 'hostelAllowance', 'children'],
    selects: [['companyCar', 'car', ['none', 'small', 'large']]],
    toggles: ['carDriver'],
  },
  { id: 'other', fields: ['savingsInterest', 'fdInterest', 'otherIncome', 'familyPension'] },
  { id: 'freelance', fold: true, fields: ['freelanceReceipts'] },
  { id: 'property', fold: true, fields: ['rentReceived', 'municipalTax', 'rentalLoanInterest'] },
  { id: 'gains', fold: true, fields: ['stcgEquity', 'ltcgEquity', 'otherStcg', 'otherLtcg'] },
  {
    id: 'more',
    fold: true,
    fields: ['medical80DDB', 'agniveer80CCH'],
    selects: [
      ['disabilitySelf', 'disability', DISABILITY],
      ['disabilityDependant', 'disability', DISABILITY],
    ],
  },
  { id: 'leaving', fold: true, fields: ['gratuityReceived', 'yearsOfService', 'leaveEncashment'], toggles: ['switchedJob'] },
];
const hasValue = (section, input) =>
  [...section.fields, ...(section.toggles ?? []), ...(section.selects ?? []).map(([f]) => f)].some(
    (f) => input[f] && input[f] !== 'none',
  );
const AGES = ['below60', 'senior', 'superSenior'];

export function TaxCalculatorPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState(loadInput);
  const [scenario, setScenario] = useState(null);
  // opened from a share link: show a note, and keep this browser's own saved figures until an edit
  const [fromLink, setFromLink] = useState(() => !!sharedInput());
  const [linkCopied, setLinkCopied] = useState(false);
  const result = useMemo(() => compareRegimes(input), [input]);
  const insights = useMemo(() => findInsights(input, result), [input, result]);

  useEffect(() => {
    if (fromLink) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    } catch {
      // private window / storage blocked: the calculator still works, it just won't remember
    }
  }, [input, fromLink]);

  // any change makes the figures your own: drop the share code from the address bar
  const own = () => {
    if (!fromLink) return;
    setFromLink(false);
    window.history.replaceState(null, '', window.location.pathname);
  };
  const set = (key, value) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    setScenario(null);
    own();
  };
  const loadScenario = (s) => {
    setInput(s.input);
    setScenario(s.id);
    own();
  };
  const reset = () => {
    setInput(EMPTY_INPUT);
    setScenario(null);
    own();
  };
  const copyShareLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#s=${encodeInput(input)}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    } catch {
      window.history.replaceState(null, '', url); // clipboard blocked: the address bar has the link
    }
  };

  const copySummary = async () => {
    const line = (r) =>
      `${t(`tax.${r.regime}`)}: ${t('tax.taxPayable')} ${inr(r.total)}, ${t('tax.monthlyInHand')} ${inr(r.monthlyInHand)}`;
    const text = [`${t('tax.title')} (${RULES.year})`, line(result.old), line(result.new), verdict(result, t)].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false; // clipboard blocked: nothing to undo, the figures are still on screen
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageTitle title={t('tax.title')} />
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-surface/95 backdrop-blur print:static">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5">
          <Calculator className="size-5 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{t('tax.title')}</span>
            <span className="block truncate text-xs text-slate-500">{t('tax.year', { year: RULES.year })}</span>
          </span>
          <span className="ml-auto" />
          <HeaderButton
            onClick={copyShareLink}
            icon={linkCopied ? Check : Share2}
            label={linkCopied ? t('tax.shareCopied') : t('tax.shareLink')}
          />
          <HeaderButton onClick={reset} icon={RotateCcw} label={t('tax.reset')} />
          <HeaderButton onClick={() => window.print()} icon={Printer} label={t('tax.print')} />
          <span className="print:hidden">
            <ThemeToggle />
          </span>
          <Link
            to="/"
            className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 sm:flex print:hidden"
          >
            <ShoppingBag className="size-4" aria-hidden /> {t('tax.backToStore')}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-24 lg:pb-6">
        {fromLink && (
          <p role="status" className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800 dark:text-brand-200 print:hidden">
            {t('tax.sharedLoaded')}
          </p>
        )}
        {/* Scenarios */}
        <section aria-labelledby="scenarios" className="motion-safe:animate-fade-up print:hidden">
          <h2 id="scenarios" className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Sparkles className="size-4 text-brand-600 dark:text-brand-300" aria-hidden /> {t('tax.scenarios')}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={scenario === s.id}
                onClick={() => loadScenario(s)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  scenario === s.id
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-surface hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-300'
                }`}
              >
                {t(`tax.sc.${s.id}`)}
              </button>
            ))}
            <a
              href="#offers"
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-brand-400 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50 dark:text-brand-300"
            >
              <Scale className="size-4" aria-hidden /> {t('tax.offers.title')}
            </a>
          </div>
          {scenario && <p className="mt-2 text-sm text-slate-600">{t(`tax.scWhy.${scenario}`)}</p>}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Form */}
          <div className="space-y-4 print:hidden">
            <Card title={t('tax.s.you')}>
              <div role="radiogroup" aria-label={t('tax.s.you')} className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
                {AGES.map((age) => (
                  <button
                    key={age}
                    type="button"
                    role="radio"
                    aria-checked={input.age === age}
                    onClick={() => set('age', age)}
                    className={`rounded-md px-2 py-2 text-sm transition ${
                      input.age === age ? 'bg-surface font-medium shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t(`tax.age.${age}`)}
                  </button>
                ))}
              </div>
            </Card>

            <CtcTool
              metro={input.metro}
              onFill={(salary) => {
                setInput((prev) => ({ ...prev, ...salary }));
                setScenario(null);
              }}
            />

            {SECTIONS.map((s) => (
              <Card
                key={s.id}
                title={t(`tax.s.${s.id}`)}
                intro={t(`tax.si.${s.id}`)}
                badge={s.oldOnly ? t('tax.oldOnly') : null}
                fold={s.fold}
                open={!s.fold || hasValue(s, input)}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {s.selects?.map(([f, group, options]) => (
                    <SelectField
                      key={f}
                      label={t(`tax.f.${f}`)}
                      value={input[f]}
                      onChange={(v) => set(f, v)}
                      options={options.map((o) => [o, t(`tax.${group}.${o}`)])}
                    />
                  ))}
                  {s.fields.map((f) => (
                    <MoneyField key={f} name={f} value={input[f]} onChange={(v) => set(f, v)} />
                  ))}
                </div>
                {s.toggles?.map((f) => (
                  <label key={f} className="mt-4 flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={input[f]}
                      onChange={(e) => set(f, e.target.checked)}
                      className="mt-0.5 size-4 accent-brand-600"
                    />
                    <span>
                      {t(`tax.f.${f}`)}
                      <span className="block text-xs text-slate-500">{t(`tax.h.${f}`)}</span>
                    </span>
                  </label>
                ))}
              </Card>
            ))}
          </div>

          {/* Result: stays in view while editing on a wide screen */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <Summary result={result} onCopy={copySummary} insightCount={insights.length} />
          </div>
        </div>

        <Insights items={insights} />
        <OfferCompare profile={input} />
        <Working result={result} />
        <Slabs result={result} />
        <Traps />
        <Notes />
      </main>

      {/* Phones and tablets: the result card sits below the long form, so keep the two totals in
          view at the bottom of the screen; tapping jumps to the full result */}
      <a
        href="#summary"
        className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-slate-200 bg-surface/95 px-4 py-3 text-sm shadow-lg backdrop-blur lg:hidden print:hidden"
      >
        <span className="tabular-nums">
          {t('tax.old')} <strong>{inr(result.old.total)}</strong> · {t('tax.new')} <strong>{inr(result.new.total)}</strong>
        </span>
        <span className="shrink-0 font-medium text-brand-600 dark:text-brand-300">{t('tax.seeResult')}</span>
      </a>
    </div>
  );
}

function verdict(result, t) {
  if (result.better === 'same') return t('tax.same');
  return t(result.better === 'new' ? 'tax.betterNew' : 'tax.betterOld', { amount: inr(result.saving) });
}

function HeaderButton({ onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 print:hidden"
    >
      <Icon className="size-4" aria-hidden /> <span className="hidden sm:inline">{label}</span>
      <span className="sr-only sm:hidden">{label}</span>
    </button>
  );
}

function Card({ title, intro, badge, fold, open, children }) {
  const heading = (
    <>
      <h3 className="flex flex-wrap items-center gap-2 font-semibold">
        {title}
        {badge && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{badge}</span>}
      </h3>
      {intro && <p className="mt-1 text-sm text-slate-500">{intro}</p>}
    </>
  );
  // optional sections fold away so the everyday form stays short
  if (fold) {
    return (
      <details open={open} className="group rounded-xl border border-slate-200 bg-surface">
        <summary className="flex cursor-pointer list-none items-start gap-3 p-5 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0 flex-1">{heading}</div>
          <ChevronDown className="mt-1 size-4 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden />
        </summary>
        <div className="px-5 pb-5">{children}</div>
      </details>
    );
  }
  return (
    <section className="rounded-xl border border-slate-200 bg-surface p-5">
      <div className="mb-4">{heading}</div>
      {children}
    </section>
  );
}

// A rupee amount. type="number" brings up the number pad on phones; the line below repeats the
// value with Indian commas and in lakh/crore, so 1500000 is easy to read as 15 lakh.
// Years of service and the number of children are plain counts, without the ₹ sign.
const COUNTS = ['yearsOfService', 'children'];
function MoneyField({ name, value, onChange }) {
  const { t } = useTranslation();
  const id = `tax-${name}`;
  const money = !COUNTS.includes(name);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {t(`tax.f.${name}`)}
      </label>
      <div className="relative mt-1">
        {money && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min="0"
          step={money ? 1000 : 1}
          value={value || ''}
          placeholder="0"
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          aria-describedby={`${id}-hint`}
          className={`w-full rounded-lg border border-slate-300 bg-surface py-2 pr-3 outline-none ${money ? 'pl-7' : 'pl-3'} focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20`}
        />
      </div>
      <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
        {money && value > 0 && <span className="font-medium text-slate-600">{inr(value)} {inWords(value, t) && `· ${inWords(value, t)}`} · </span>}
        {t(`tax.h.${name}`)}
      </p>
    </div>
  );
}

// Turns a CTC from an offer letter into the salary fields above, using a typical structure
function CtcTool({ metro, onFill }) {
  const { t } = useTranslation();
  const [ctc, setCtc] = useState(1200000);
  const [basicPct, setBasicPct] = useState(0.4);
  const [variablePct, setVariablePct] = useState(0);
  const [pfCapped, setPfCapped] = useState(true);
  const [filled, setFilled] = useState(false);
  const preview = splitCtc({ ctc, basicPct, variablePct, metro, pfCapped });

  const fill = () => {
    // gratuity stays out: it is part of the CTC but paid only when you leave (after 5 years)
    const { basic, hra, special, bonus, employerPf, employeePf } = preview;
    onFill({ basic, hra, special, bonus, employerPf, employeePf, employerNps: 0, otherAllowances: 0, lta: 0 });
    setFilled(true);
    setTimeout(() => setFilled(false), 2000);
  };

  return (
    <Card title={t('tax.s.ctc')} intro={t('tax.si.ctc')}>
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField name="ctc" value={ctc} onChange={setCtc} />
        <SelectField
          label={t('tax.f.basicPct')}
          value={basicPct}
          onChange={setBasicPct}
          options={[0.4, 0.5].map((v) => [v, `${v * 100}%`])}
        />
        <SelectField
          label={t('tax.f.variablePct')}
          value={variablePct}
          onChange={setVariablePct}
          options={[0, 0.05, 0.1, 0.15, 0.2].map((v) => [v, `${v * 100}%`])}
        />
        <SelectField
          label={t('tax.f.pf')}
          value={pfCapped ? 'capped' : 'full'}
          onChange={(v) => setPfCapped(v === 'capped')}
          options={[
            ['capped', t('tax.pfCapped')],
            ['full', t('tax.pfFull')],
          ]}
        />
      </div>
      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        {t('tax.ctcPreview', {
          basic: inr(preview.basic),
          hra: inr(preview.hra),
          special: inr(preview.special),
          bonus: inr(preview.bonus),
          pf: inr(preview.employerPf),
          gratuity: inr(preview.gratuity),
        })}
      </p>
      <button
        type="button"
        onClick={fill}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 active:bg-brand-800"
      >
        {filled ? <Check className="size-4" aria-hidden /> : <Wand2 className="size-4" aria-hidden />}
        {filled ? t('tax.ctcFilled') : t('tax.ctcFill')}
      </button>
    </Card>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(e) => {
          const option = options.find(([v]) => String(v) === e.target.value);
          onChange(option[0]);
        }}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-surface px-3 py-2 font-normal outline-none focus:border-brand-500"
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

// The answer: which regime wins and by how much, then tax and in-hand pay for each
function Summary({ result, onCopy, insightCount }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const { better, breakEven } = result;

  return (
    <section aria-labelledby="summary" aria-live="polite" className="rounded-xl border border-slate-200 bg-surface p-5 shadow-sm">
      <h2 id="summary" className="scroll-mt-24 font-semibold">
        {t('tax.result')}
      </h2>
      <p
        className={`mt-3 rounded-lg p-3 text-sm font-medium ${
          better === 'same' ? 'bg-slate-100' : 'bg-green-50 text-green-800 dark:text-green-300'
        }`}
      >
        {verdict(result, t)}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {['old', 'new'].map((regime) => {
          const r = result[regime];
          const wins = better === regime;
          return (
            <div
              key={regime}
              className={`rounded-lg border p-3 transition ${wins ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-200'}`}
            >
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t(`tax.${regime}`)} {wins && <Check className="size-3.5 text-green-600" aria-label={t('tax.lower')} />}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums">{inr(r.total)}</p>
              <p className="text-xs text-slate-500">{t('tax.taxPayable')}</p>
              <dl className="mt-3 space-y-1.5 text-xs">
                <Stat label={t('tax.monthlyInHand')} value={inr(r.monthlyInHand)} strong />
                <Stat label={t('tax.monthlyTds')} value={inr(r.monthlyTds)} />
                <Stat label={t('tax.taxable')} value={inr(r.totalIncome)} />
                <Stat label={t('tax.effective')} value={pct(r.effectiveRate)} />
              </dl>
            </div>
          );
        })}
      </div>

      {/* How far the old regime is from winning: the number people really want when choosing */}
      {better === 'new' && breakEven > 0 && (
        <p className="mt-4 text-sm text-slate-600">{t('tax.breakEven', { amount: inr(breakEven) })}</p>
      )}
      {better === 'new' && breakEven === null && <p className="mt-4 text-sm text-slate-600">{t('tax.breakEvenNever')}</p>}
      <p className="mt-2 text-xs text-slate-500">{t('tax.inHandNote')}</p>

      {insightCount > 0 && (
        <a
          href="#insights"
          className="mt-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:text-amber-200 print:hidden"
        >
          <AlertTriangle className="size-4 shrink-0" aria-hidden /> {t('tax.checks', { count: insightCount })}
          <ArrowDown className="ml-auto size-4" aria-hidden />
        </a>
      )}

      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        <a
          href="#working"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
        >
          <ArrowDown className="size-4" aria-hidden /> {t('tax.seeWorking')}
        </a>
        <button
          type="button"
          onClick={async () => {
            if (!(await onCopy())) return;
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
        >
          {copied ? <Check className="size-4 text-green-600" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? t('tax.copied') : t('tax.copy')}
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value, strong }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`tabular-nums ${strong ? 'font-semibold' : ''}`}>{value}</dd>
    </div>
  );
}

// Every step from salary to tax, old and new side by side (the same order as the return form)
function Working({ result }) {
  const { t } = useTranslation();
  const o = result.old;
  const n = result.new;
  const minus = (v) => (v ? `− ${inr(v)}` : inr(0));
  const deductionKeys = Object.keys(o.deductionItems).filter(
    (k) => k !== 'extra' && (o.deductionItems[k] || n.deductionItems[k]),
  );

  const rows = [
    ['grossSalary', inr(o.grossSalary), inr(n.grossSalary)],
    ['hraExempt', minus(o.hraExempt), minus(n.hraExempt)],
    ['ltaExempt', minus(o.ltaExempt), minus(n.ltaExempt)],
    // only shown when leaving a job this year
    ...(o.gratuityExempt || o.leaveExempt
      ? [
          ['gratuityExempt', minus(o.gratuityExempt), minus(n.gratuityExempt)],
          ['leaveExempt', minus(o.leaveExempt), minus(n.leaveExempt)],
        ]
      : []),
    ...(o.otherExempt || n.otherExempt ? [['otherExempt', minus(o.otherExempt), minus(n.otherExempt)]] : []),
    ['standardDeduction', minus(o.standardDeduction), minus(n.standardDeduction)],
    ['professionalTax', minus(o.professionalTax), minus(n.professionalTax)],
    ['salaryIncome', inr(o.salaryIncome), inr(n.salaryIncome), true],
    ['houseProperty', inr(o.houseProperty), inr(n.houseProperty)],
    ...(o.business ? [['business', inr(o.business), inr(n.business)]] : []),
    ['otherSources', inr(o.otherSources), inr(n.otherSources)],
    ...(o.gainsAtSlab ? [['gainsAtSlab', inr(o.gainsAtSlab), inr(n.gainsAtSlab)]] : []),
    ['grossTotal', inr(o.grossTotal), inr(n.grossTotal), true],
    ...deductionKeys.map((k) => [k, minus(o.deductionItems[k]), minus(n.deductionItems[k])]),
    ['normalTaxable', inr(o.normalTaxable), inr(n.normalTaxable), true],
    ['gains', inr(o.stcg + o.ltcg), inr(n.stcg + n.ltcg)],
    ['slabTax', inr(o.slabTax), inr(n.slabTax)],
    ['capitalGainsTax', inr(o.capitalGainsTax), inr(n.capitalGainsTax)],
    ['rebate', minus(o.rebate), minus(n.rebate)],
    ['marginalRelief', minus(o.marginalRelief), minus(n.marginalRelief)],
    [
      'surcharge',
      `${inr(o.surcharge)}${o.surchargeRate ? ` (${o.surchargeRate * 100}%)` : ''}`,
      `${inr(n.surcharge)}${n.surchargeRate ? ` (${n.surchargeRate * 100}%)` : ''}`,
    ],
    ['cess', inr(o.cess), inr(n.cess)],
    ['total', inr(o.total), inr(n.total), true],
  ];

  return (
    <section id="working" aria-labelledby="working-title" className="mt-8 scroll-mt-20">
      <h2 id="working-title" className="text-lg font-semibold">
        {t('tax.working')}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{t('tax.workingIntro')}</p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-surface">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">
                {t('tax.step')}
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                {t('tax.old')}
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                {t('tax.new')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([key, a, b, strong]) => (
              <tr key={key} className={`border-t border-slate-100 ${strong ? 'bg-slate-50/60 font-semibold' : ''}`}>
                <th scope="row" className="px-4 py-2 text-left font-[inherit]">
                  {t(`tax.w.${key}`)}
                </th>
                <td className="px-4 py-2 text-right tabular-nums">{a}</td>
                <td className="px-4 py-2 text-right tabular-nums">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// How the slab tax adds up, band by band, for each regime
function Slabs({ result }) {
  const { t } = useTranslation();
  const band = (from, to) =>
    to === Infinity ? t('tax.above', { from: inr(from) }) : `${inr(from)} – ${inr(to)}`;
  return (
    <section aria-labelledby="slabs-title" className="mt-8">
      <h2 id="slabs-title" className="text-lg font-semibold">
        {t('tax.slabs')}
      </h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {['old', 'new'].map((regime) => (
          <div key={regime} className="overflow-x-auto rounded-xl border border-slate-200 bg-surface">
            <p className="border-b border-slate-100 px-4 py-2 text-sm font-semibold">{t(`tax.${regime}`)}</p>
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-1.5 font-medium">{t('tax.band')}</th>
                  <th scope="col" className="px-2 py-1.5 text-right font-medium">{t('tax.rate')}</th>
                  <th scope="col" className="px-4 py-1.5 text-right font-medium">{t('tax.taxOnBand')}</th>
                </tr>
              </thead>
              <tbody>
                {result[regime].slabRows.map((row) => (
                  <tr
                    key={row.from}
                    className={`border-t border-slate-100 ${row.amount > 0 ? '' : 'text-slate-400'}`}
                  >
                    <td className="px-4 py-1.5">{band(row.from, row.to)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{row.rate * 100}%</td>
                    <td className="px-4 py-1.5 text-right tabular-nums">{inr(row.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  );
}

// Alerts worked out from the numbers entered (insights.js): the effects the totals hide
const LEVELS = {
  warn: { icon: AlertTriangle, box: 'border-amber-300 bg-amber-50/60', iconColor: 'text-amber-600' },
  save: { icon: PiggyBank, box: 'border-green-300 bg-green-50/60', iconColor: 'text-green-600' },
  info: { icon: Info, box: 'border-slate-200 bg-surface', iconColor: 'text-brand-600 dark:text-brand-300' },
};
const LEVEL_ORDER = ['warn', 'save', 'info'];

function Insights({ items }) {
  const { t } = useTranslation();
  const sorted = [...items].sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));
  return (
    <section id="insights" aria-labelledby="insights-title" className="mt-8 scroll-mt-20">
      <h2 id="insights-title" className="flex items-center gap-2 text-lg font-semibold">
        <ShieldAlert className="size-5 text-amber-600" aria-hidden /> {t('tax.insights')}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{t('tax.insightsIntro')}</p>
      {sorted.length === 0 ? (
        <p className="mt-3 rounded-xl border border-slate-200 bg-surface p-4 text-sm text-slate-600">{t('tax.insightsNone')}</p>
      ) : (
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {sorted.map((item) => {
            const level = LEVELS[item.level];
            const Icon = level.icon;
            return (
              <li key={item.id} className={`flex gap-3 rounded-xl border p-4 motion-safe:animate-fade-up ${level.box}`}>
                <Icon className={`mt-0.5 size-5 shrink-0 ${level.iconColor}`} aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t(`tax.level.${item.level}`)}</p>
                  <p className="font-medium">{t(`tax.alert.${item.id}.title`, item.vars)}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {item.parts.map((part) => t(`tax.alert.${item.id}.${part}`, item.vars)).join(' ')}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// Traps that apply to everyone (traps.js), grouped; the first group starts open
function Traps() {
  const { t } = useTranslation();
  const total = TRAPS.reduce((sum, g) => sum + g.items.length, 0);
  return (
    <section aria-labelledby="traps-title" className="mt-8">
      <h2 id="traps-title" className="text-lg font-semibold">
        {t('tax.traps', { count: total })}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{t('tax.trapsIntro')}</p>
      <div className="mt-3 space-y-2">
        {TRAPS.map((group, index) => (
          <details key={group.id} open={index === 0} className="group rounded-xl border border-slate-200 bg-surface">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              {t(`tax.trapGroup.${group.id}`)}
              <span className="rounded-full bg-slate-100 px-2 text-xs text-slate-600">{group.items.length}</span>
              <ChevronDown className="ml-auto size-4 text-slate-400 transition group-open:rotate-180" aria-hidden />
            </summary>
            <dl className="grid gap-3 border-t border-slate-100 p-4 md:grid-cols-2">
              {group.items.map((item) => (
                <div key={item} className="rounded-lg bg-slate-50 p-3">
                  <dt className="text-sm font-semibold">{t(`tax.trap.${item}.title`)}</dt>
                  <dd className="mt-1 text-sm text-slate-700">{t(`tax.trap.${item}.text`)}</dd>
                </div>
              ))}
            </dl>
          </details>
        ))}
      </div>
    </section>
  );
}

// The rules in plain words, and what this calculator does not cover
const NOTES = ['rules2026', 'act2025', 'regimes', 'rebate', 'hra', 'deductions', 'surcharge', 'gains', 'tds', 'switching', 'notCovered'];

function Notes() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="notes-title" className="mt-8 rounded-xl border border-slate-200 bg-surface p-5">
      <h2 id="notes-title" className="text-lg font-semibold">
        {t('tax.notesTitle')}
      </h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {NOTES.map((k) => (
          <li key={k} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
            <span>{t(`tax.n.${k}`)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:text-amber-200">{t('tax.disclaimer')}</p>
    </section>
  );
}
