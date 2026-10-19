// Page buttons under the product grid: ‹ 1 2 3 ›. The current page comes from the URL
// (?page=2) and a click calls onChange, which CatalogPage writes back into the URL.

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
import { ChevronLeft, ChevronRight } from 'lucide-react';

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// onChange = runs on every change of an input
export function Pagination({ page, totalPages, onChange }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // one page only: no buttons at all (after the hook, hooks must always run)
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  if (totalPages <= 1) return null;
  // const = a name for a value that is never reassigned
  const btn = 'flex size-9 items-center justify-center rounded-lg text-sm font-medium transition';

  // return = give this value back and stop the function here
  return (
    // <nav> = a navigation area (screen readers can jump to it)
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    // aria-label = the name screen readers read for this element
    // { } in JSX = run JavaScript here and show its result
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    <nav className="flex items-center justify-center gap-1" aria-label={t('catalog.pagination')}>
      <button
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        // { } in JSX = run JavaScript here and show its result
        // `text ${x}` = a template string: text with values inserted
        className={`${btn} hover:bg-slate-200 disabled:opacity-40`}
        // disabled = can't be clicked or typed in
        // { } in JSX = run JavaScript here and show its result
        // === = strictly equal (same value AND same type)
        disabled={page === 1}
        // onClick = what happens on click/tap
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        // onChange = runs on every change of an input
        onClick={() => onChange(page - 1)}
        // aria-label = the name screen readers read for this element
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        aria-label={t('catalog.previousPage')}
      >
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <ChevronLeft className="size-4" />
      </button>
      {/* { } in JSX = run JavaScript here and show its result
         => = an arrow function (a short function)
         .map = make a new array by transforming each item (in JSX: one element per item) */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          // key = a stable id for list items so React can track them between redraws
          // { } in JSX = run JavaScript here and show its result
          key={p}
          // onClick = what happens on click/tap
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          // onChange = runs on every change of an input
          onClick={() => onChange(p)}
          // tells screen readers which page is the current one
          // aria-current = marks the current page/step/item
          // { } in JSX = run JavaScript here and show its result
          // a ? b : c = ternary: if a then b else c
          // === = strictly equal (same value AND same type)
          aria-current={p === page ? 'page' : undefined}
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          // { } in JSX = run JavaScript here and show its result
          // `text ${x}` = a template string: text with values inserted
          // a ? b : c = ternary: if a then b else c
          // === = strictly equal (same value AND same type)
          className={`${btn} ${p === page ? 'bg-slate-900 text-slate-50' : 'hover:bg-slate-200'}`}
        >
          {/* { } in JSX = run JavaScript here and show its result */}
          {p}
        </button>
      ))}
      <button
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        // { } in JSX = run JavaScript here and show its result
        // `text ${x}` = a template string: text with values inserted
        className={`${btn} hover:bg-slate-200 disabled:opacity-40`}
        // disabled = can't be clicked or typed in
        // { } in JSX = run JavaScript here and show its result
        // === = strictly equal (same value AND same type)
        disabled={page === totalPages}
        // onClick = what happens on click/tap
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        // onChange = runs on every change of an input
        onClick={() => onChange(page + 1)}
        // aria-label = the name screen readers read for this element
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        aria-label={t('catalog.nextPage')}
      >
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
