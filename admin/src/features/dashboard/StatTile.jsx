// import = bring in code from another file or package
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
// import = bring in code from another file or package
import { chart } from './chartTheme';

// A headline number + how it changed vs the previous period (or a plain hint).
// Not a chart: one number is best shown as a number.
// The change is shown with an arrow AND words, so it never relies on colour alone.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function StatTile({ label, value, change, days, hint, loading }) {
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <p className="text-sm text-slate-500">{label}</p>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         `text ${x}` = a template string: text with values inserted
         a ? b : c = ternary: if a then b else c */}
      <p className={`mt-1 text-2xl font-bold ${loading ? 'animate-pulse text-slate-300' : 'text-slate-900'}`}>
        {/* { } in JSX = run JavaScript here and show its result
           a ? b : c = ternary: if a then b else c */}
        {loading ? '—' : value}
      </p>
      {/* { } in JSX = run JavaScript here and show its result
         a ? b : c = ternary: if a then b else c
         !== = not strictly equal */}
      {hint !== undefined ? (
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        // { } in JSX = run JavaScript here and show its result
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : (
        // { } in JSX = run JavaScript here and show its result
        // a ?? b = a, unless a is null/undefined, then b
        <Change change={change ?? null} days={days ?? 30} />
      )}
    </div>
  );
}

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function Change({ change, days }) {
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // === = strictly equal (same value AND same type)
  // a || b = OR: a if it is truthy, else b
  const Icon = change === null || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // === = strictly equal (same value AND same type)
  // a || b = OR: a if it is truthy, else b
  const color = change === null || change === 0 ? chart.textSecondary : change > 0 ? chart.up : chart.down;
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    // { } in JSX = run JavaScript here and show its result
    <p className="mt-1 flex items-center gap-1 text-xs" style={{ color }}>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         aria-hidden = screen readers skip this (decoration) */}
      <Icon className="size-3.5" aria-hidden />
      {/* { } in JSX = run JavaScript here and show its result
         a ? b : c = ternary: if a then b else c
         === = strictly equal (same value AND same type) */}
      {change === null
        ? 'No data for the previous period'
        // `text ${x}` = a template string: text with values inserted
        // a ? b : c = ternary: if a then b else c
        : `${change > 0 ? '+' : ''}${change}% vs previous ${days} days`}
    </p>
  );
}
