// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
import { AlertCircle, Loader2 } from 'lucide-react';
// import = bring in code from another file or package
import { getErrorMessage } from '@/lib/format';
// import = bring in code from another file or package
import { isServerError } from '@/lib/api-error';

// Reusable loading / error / empty states, so every page handles them the same way.

// While data loads (pass a label like "Loading addresses...", or get the default text)
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function Spinner({ label }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         a ?? b = a, unless a is null/undefined, then b
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <Loader2 className="size-5 animate-spin" /> {label ?? t('common.loading')}
    </div>
  );
}

// A red box with a readable message for a failed request. Server failures (5xx) are left to the
// global "Something went wrong" popup instead, so the page doesn't show both.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function ErrorState({ error }) {
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  if (isServerError(error)) return null; // the error popup explains it instead
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <AlertCircle className="size-4 shrink-0" /> {getErrorMessage(error)}
    </div>
  );
}

// When a list has nothing in it yet ("Your cart is empty"), with an optional hint
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function EmptyState({ title, hint }) {
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="rounded-xl border border-dashed border-slate-300 bg-surface py-16 text-center">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <p className="font-medium text-slate-700">{title}</p>
      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
