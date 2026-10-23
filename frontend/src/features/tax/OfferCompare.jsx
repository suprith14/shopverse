import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Trophy } from 'lucide-react';
import { compareOffers } from './taxEngine';
import { inr, pct } from './format';

// Two job offers side by side on the same personal situation (age, rent, deductions from the main
// form). Each offer is worked out in its better regime; the winner is the higher fixed in-hand pay.

const DEFAULT_OFFERS = [
  { ctc: 1200000, basicPct: 0.4, variablePct: 0.1, expectedPayout: 0.8, joiningBonus: 0, metro: true, pfCapped: true },
  { ctc: 1500000, basicPct: 0.5, variablePct: 0.15, expectedPayout: 0.8, joiningBonus: 100000, metro: true, pfCapped: false },
];
const KEYS = ['a', 'b'];

export function OfferCompare({ profile }) {
  const { t } = useTranslation();
  const [offers, setOffers] = useState(DEFAULT_OFFERS);
  const results = useMemo(() => compareOffers(profile, offers), [profile, offers]);
  const set = (index, key, value) => setOffers((list) => list.map((o, i) => (i === index ? { ...o, [key]: value } : o)));

  const [a, b] = results;
  const diff = b.monthlyInHand - a.monthlyInHand;
  const winner = Math.abs(diff) < 1 ? null : diff > 0 ? 1 : 0;
  const loser = results[winner === 1 ? 0 : 1];

  return (
    <section id="offers" aria-labelledby="offers-title" className="mt-8 scroll-mt-20">
      <h2 id="offers-title" className="flex items-center gap-2 text-lg font-semibold">
        <Scale className="size-5 text-brand-600 dark:text-brand-300" aria-hidden /> {t('tax.offers.title')}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{t('tax.offers.intro')}</p>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {results.map((r, index) => (
          <div
            key={KEYS[index]}
            className={`rounded-xl border bg-surface p-5 transition ${winner === index ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-200'}`}
          >
            <h3 className="flex items-center gap-2 font-semibold">
              {t(`tax.offers.${KEYS[index]}`)}
              {winner === index && <Trophy className="size-4 text-green-600" aria-label={t('tax.lower')} />}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Amount id={`offer-${index}-ctc`} label={t('tax.f.ctc')} value={offers[index].ctc} onChange={(v) => set(index, 'ctc', v)} />
              <Amount
                id={`offer-${index}-joining`}
                label={t('tax.offers.joiningBonus')}
                value={offers[index].joiningBonus}
                onChange={(v) => set(index, 'joiningBonus', v)}
              />
              <Choice
                label={t('tax.f.basicPct')}
                value={offers[index].basicPct}
                options={[0.4, 0.5]}
                onChange={(v) => set(index, 'basicPct', v)}
              />
              <Choice
                label={t('tax.f.variablePct')}
                value={offers[index].variablePct}
                options={[0, 0.05, 0.1, 0.15, 0.2, 0.25]}
                onChange={(v) => set(index, 'variablePct', v)}
              />
              <Choice
                label={t('tax.offers.payout')}
                value={offers[index].expectedPayout}
                options={[0.5, 0.6, 0.7, 0.8, 0.9, 1]}
                onChange={(v) => set(index, 'expectedPayout', v)}
              />
              <label className="block text-sm font-medium">
                {t('tax.f.pf')}
                <select
                  value={offers[index].pfCapped ? 'capped' : 'full'}
                  onChange={(e) => set(index, 'pfCapped', e.target.value === 'capped')}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-surface px-3 py-2 font-normal outline-none focus:border-brand-500"
                >
                  <option value="capped">{t('tax.pfCapped')}</option>
                  <option value="full">{t('tax.pfFull')}</option>
                </select>
              </label>
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={offers[index].metro}
                onChange={(e) => set(index, 'metro', e.target.checked)}
                className="size-4 accent-brand-600"
              />
              {t('tax.offers.cityMetro')}
            </label>

            <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
              <Row label={t('tax.offers.regime')} value={t(`tax.${r.regime}`)} />
              <Row label={t('tax.offers.tax')} value={inr(r.tax)} />
              <Row label={t('tax.offers.monthly')} value={inr(r.monthlyInHand)} strong />
              <Row label={t('tax.offers.firstYear')} value={inr(r.firstYearCash)} />
              <Row label={t('tax.offers.laterYears')} value={inr(r.laterYearCash)} />
            </dl>
          </div>
        ))}
      </div>

      <div aria-live="polite" className="mt-3 rounded-xl border border-slate-200 bg-surface p-4 text-sm">
        <p className="font-medium">
          {winner === null
            ? t('tax.offers.tie')
            : t('tax.offers.winner', {
                name: t(`tax.offers.${KEYS[winner]}`),
                amount: inr(Math.abs(diff)),
                pct: `+${pct(Math.abs(diff) / Math.max(1, loser.monthlyInHand))}`,
              })}
        </p>
        <p className="mt-1 text-slate-600">
          {t('tax.offers.hike', { pct: `${b.ctc >= a.ctc ? '+' : '−'}${pct(Math.abs(b.ctc - a.ctc) / Math.max(1, a.ctc))}` })}
        </p>
        <p className="mt-1 text-xs text-slate-500">{t('tax.offers.note')}</p>
      </div>
    </section>
  );
}

function Amount({ id, label, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min="0"
          step="10000"
          value={value || ''}
          placeholder="0"
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-full rounded-lg border border-slate-300 bg-surface py-2 pl-7 pr-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>
    </div>
  );
}

function Choice({ label, value, options, onChange }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-surface px-3 py-2 font-normal outline-none focus:border-brand-500"
      >
        {options.map((v) => (
          <option key={v} value={v}>
            {Math.round(v * 100)}%
          </option>
        ))}
      </select>
    </label>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`tabular-nums ${strong ? 'font-semibold' : ''}`}>{value}</dd>
    </div>
  );
}
