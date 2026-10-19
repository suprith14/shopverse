// The filter panel on /shop: brand, price range, minimum rating, "Clear all filters".
// It doesn't fetch anything itself: it calls onChange({ brand: ... }) and CatalogPage puts that
// into the URL. The numbers next to each option (facets) come with the product list.

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
// useState = a value the component remembers; calling its setter redraws the component
import { useEffect, useState } from 'react';
// import = bring in code from another file or package
import { Star } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';

// the API speaks cents, people type dollars: "12.50" <-> 1250
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// a ? b : c = ternary: if a then b else c
// === = strictly equal (same value AND same type)
// Math = number helpers (min, max, round, floor...)
const toCents = (dollars) => (dollars === '' ? undefined : Math.round(Number(dollars) * 100));
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// a ? b : c = ternary: if a then b else c
// === = strictly equal (same value AND same type)
const toDollars = (cents) => (cents === undefined ? '' : String(cents / 100));

// The counts come from the backend's facets. Each facet ignores its own filter, so after
// picking a brand the other brands still show their counts and can be picked instead.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// onChange = runs on every change of an input
export function FilterSidebar({ filters, facets, onChange, onReset }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // Price inputs are local state, applied on "Apply" so we don't fire a request per keystroke.
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [min, setMin] = useState(toDollars(filters.minPrice));
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [max, setMax] = useState(toDollars(filters.maxPrice));
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    setMin(toDollars(filters.minPrice));
    setMax(toDollars(filters.maxPrice));
  }, [filters.minPrice, filters.maxPrice]);

  // Hide brands with 0 results, but always keep the selected one visible so it can be unselected.
  // const = a name for a value that is never reassigned
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // a ?? b = a, unless a is null/undefined, then b
  // .filter = keep only the items that pass a test
  // => = an arrow function (a short function)
  // a || b = OR: a if it is truthy, else b
  // === = strictly equal (same value AND same type)
  const brands = (facets?.brands ?? []).filter((b) => b.count > 0 || b.value === filters.brand);

  // return = give this value back and stop the function here
  return (
    // <aside> = side content next to the main content
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <aside className="space-y-6 rounded-xl border border-slate-200 bg-surface p-5">
      {/* <section> = a themed part of the page with its own heading */}
      <section>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <h3 className="mb-2 text-sm font-semibold">{t('catalog.brand')}</h3>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="max-h-56 space-y-1.5 overflow-y-auto text-sm">
          <Option
            // { } in JSX = run JavaScript here and show its result
            // ! = NOT: flips true/false
            checked={!filters.brand}
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            // onChange = runs on every change of an input
            onSelect={() => onChange({ brand: undefined })}
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            label={t('catalog.allBrands')}
            name="brand"
          />
          {/* { } in JSX = run JavaScript here and show its result
             .map = make a new array by transforming each item (in JSX: one element per item)
             => = an arrow function (a short function) */}
          {brands.map((b) => (
            <Option
              // key = a stable id for list items so React can track them between redraws
              // { } in JSX = run JavaScript here and show its result
              key={b.value}
              name="brand"
              // { } in JSX = run JavaScript here and show its result
              // === = strictly equal (same value AND same type)
              checked={filters.brand === b.value}
              // { } in JSX = run JavaScript here and show its result
              count={b.count}
              // { } in JSX = run JavaScript here and show its result
              label={b.value}
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              // onChange = runs on every change of an input
              onSelect={() => onChange({ brand: b.value })}
            />
          ))}
          {/* { } in JSX = run JavaScript here and show its result
             === = strictly equal (same value AND same type)
             a && b = AND; in JSX: show b only when a is true
             className = CSS classes (Tailwind) for this element (class is a JS keyword)
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {facets && brands.length === 0 && <p className="text-slate-400">{t('catalog.noBrands')}</p>}
        </div>
      </section>

      {/* <section> = a themed part of the page with its own heading */}
      <section>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <h3 className="mb-2 text-sm font-semibold">{t('catalog.price')}</h3>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            // { } in JSX = run JavaScript here and show its result
            min={0}
            // placeholder = grey hint text inside an empty input
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            placeholder={t('catalog.min')}
            // aria-label = the name screen readers read for this element
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            aria-label={t('catalog.min')}
            // { } in JSX = run JavaScript here and show its result
            value={min}
            // onChange = runs on every change of an input
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            onChange={(e) => setMin(e.target.value)}
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <span className="text-slate-400">-</span>
          <input
            type="number"
            // { } in JSX = run JavaScript here and show its result
            min={0}
            // placeholder = grey hint text inside an empty input
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            placeholder={t('catalog.max')}
            // aria-label = the name screen readers read for this element
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            aria-label={t('catalog.max')}
            // { } in JSX = run JavaScript here and show its result
            value={max}
            // onChange = runs on every change of an input
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            onChange={(e) => setMax(e.target.value)}
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <Button
          variant="secondary"
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="mt-2 w-full"
          // onClick = what happens on click/tap
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          // onChange = runs on every change of an input
          onClick={() => onChange({ minPrice: toCents(min), maxPrice: toCents(max) })}
        >
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('catalog.applyPrice')}
        </Button>
      </section>

      {/* <section> = a themed part of the page with its own heading */}
      <section>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <h3 className="mb-2 text-sm font-semibold">{t('catalog.rating')}</h3>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="space-y-1.5 text-sm">
          {/* { } in JSX = run JavaScript here and show its result
             ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
             a ?? b = a, unless a is null/undefined, then b
             .map = make a new array by transforming each item (in JSX: one element per item)
             => = an arrow function (a short function) */}
          {(facets?.ratings ?? [4, 3, 2].map((min) => ({ min, count: undefined }))).map((r) => (
            <Option
              // key = a stable id for list items so React can track them between redraws
              // { } in JSX = run JavaScript here and show its result
              key={r.min}
              name="rating"
              // { } in JSX = run JavaScript here and show its result
              // === = strictly equal (same value AND same type)
              checked={filters.minRating === r.min}
              // { } in JSX = run JavaScript here and show its result
              count={r.count}
              // disabled = can't be clicked or typed in
              // { } in JSX = run JavaScript here and show its result
              // === = strictly equal (same value AND same type)
              // a && b = AND; in JSX: show b only when a is true
              // !== = not strictly equal
              disabled={r.count === 0 && filters.minRating !== r.min}
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              // onChange = runs on every change of an input
              onSelect={() => onChange({ minRating: r.min })}
              // { } in JSX = run JavaScript here and show its result
              label={
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                <span className="flex items-center gap-1">
                  {/* { } in JSX = run JavaScript here and show its result */}
                  {r.min}
                  {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                     { } in JSX = run JavaScript here and show its result
                     t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                  <Star className="size-3.5 fill-amber-400 text-amber-400" /> {t('catalog.andUp')}
                </span>
              }
            />
          ))}
          <Option
            name="rating"
            // { } in JSX = run JavaScript here and show its result
            // === = strictly equal (same value AND same type)
            checked={filters.minRating === undefined}
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            // onChange = runs on every change of an input
            onSelect={() => onChange({ minRating: undefined })}
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            label={t('catalog.anyRating')}
          />
        </div>
      </section>

      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         onClick = what happens on click/tap
         { } in JSX = run JavaScript here and show its result */}
      <Button variant="ghost" className="w-full" onClick={onReset}>
        {/* { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {t('catalog.clearFilters')}
      </Button>
    </aside>
  );
}

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function Option({ name, label, count, checked, disabled, onSelect }) {
  // return = give this value back and stop the function here
  return (
    // <label> = the name of an input; clicking it focuses the input
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    // { } in JSX = run JavaScript here and show its result
    // `text ${x}` = a template string: text with values inserted
    // a ? b : c = ternary: if a then b else c
    <label className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}>
      {/* { } in JSX = run JavaScript here and show its result
         disabled = can't be clicked or typed in
         onChange = runs on every change of an input */}
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onSelect} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <span className="flex-1">{label}</span>
      {/* { } in JSX = run JavaScript here and show its result
         !== = not strictly equal
         a && b = AND; in JSX: show b only when a is true
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      {count !== undefined && <span className="text-xs text-slate-400">{count}</span>}
    </label>
  );
}
