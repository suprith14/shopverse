import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { chart } from './chartTheme';

// A headline number + how it changed vs the previous period (or a plain hint).
// Not a chart: one number is best shown as a number.
// The change is shown with an arrow AND words, so it never relies on colour alone.
export function StatTile({ label, value, change, days, hint, loading }: {
  label: string;
  value: string;
  change?: number | null; // % vs previous period; leave out to show `hint` instead
  days?: number;
  hint?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${loading ? 'animate-pulse text-slate-300' : 'text-slate-900'}`}>{loading ? '—' : value}</p>
      {hint !== undefined ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : (
        <Change change={change ?? null} days={days ?? 30} />
      )}
    </div>
  );
}

function Change({ change, days }: { change: number | null; days: number }) {
  const Icon = change === null || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;
  const color = change === null || change === 0 ? chart.textSecondary : change > 0 ? chart.up : chart.down;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs" style={{ color }}>
      <Icon className="size-3.5" aria-hidden />
      {change === null ? 'No data for the previous period' : `${change > 0 ? '+' : ''}${change}% vs previous ${days} days`}
    </p>
  );
}
