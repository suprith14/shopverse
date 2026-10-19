// Grey placeholder shapes shown while data loads, shaped like the real content (a product grid,
// the product page, a list). Feels faster than a spinner and the page doesn't jump when data
// arrives. The pulse animation is off for people who chose "reduce motion" (motion-safe:).

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// Skeletons: grey shapes in the layout of the real content, shown while it loads.
// Compared with a spinner, the page doesn't jump when data arrives (no "layout shift") and it
// feels faster because the structure is visible at once.
// motion-safe: the pulse only plays if the visitor hasn't asked their device to reduce motion.

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// x = value (in parameters) = the default used when x is not given
export function Skeleton({ className = '' }) {
  // return = give this value back and stop the function here
  // aria-hidden = screen readers skip this (decoration)
  // className = CSS classes (Tailwind) for this element (class is a JS keyword)
  // { } in JSX = run JavaScript here and show its result
  // `text ${x}` = a template string: text with values inserted
  return <div aria-hidden className={`rounded-md bg-slate-200 motion-safe:animate-pulse ${className}`} />;
}

// Same grid and card shape as ProductCard.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// x = value (in parameters) = the default used when x is not given
export function ProductGridSkeleton({ count = 8, className = 'grid grid-cols-2 gap-4 md:grid-cols-4' }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    // { } in JSX = run JavaScript here and show its result
    // role = tells screen readers what this element is (status, tab, group...)
    // aria-label = the name screen readers read for this element
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    <div className={className} role="status" aria-label={t('catalog.loadingProducts')}>
      {/* { } in JSX = run JavaScript here and show its result
         => = an arrow function (a short function) */}
      {Array.from({ length: count }, (_, i) => (
        // key = a stable id for list items so React can track them between redraws
        // { } in JSX = run JavaScript here and show its result
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-surface">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <Skeleton className="aspect-square rounded-none" />
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="space-y-2 p-4">
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Skeleton className="h-3 w-1/3" />
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Skeleton className="h-4 w-3/4" />
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Skeleton className="h-3 w-1/2" />
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Same layout as the product page: gallery left, details right.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function ProductDetailSkeleton() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    // role = tells screen readers what this element is (status, tab, group...)
    // aria-label = the name screen readers read for this element
    // { } in JSX = run JavaScript here and show its result
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    <div className="grid gap-10 md:grid-cols-2" role="status" aria-label={t('product.loading')}>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <Skeleton className="aspect-square rounded-2xl" />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="space-y-4">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Skeleton className="h-3 w-24" />
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Skeleton className="h-8 w-3/4" />
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Skeleton className="h-4 w-32" />
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Skeleton className="h-8 w-28" />
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Skeleton className="h-16 w-full" />
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="flex gap-2">
          {/* { } in JSX = run JavaScript here and show its result
             => = an arrow function (a short function) */}
          {Array.from({ length: 4 }, (_, i) => (
            // key = a stable id for list items so React can track them between redraws
            // { } in JSX = run JavaScript here and show its result
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

// Rows like the cart, orders and similar lists.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// x = value (in parameters) = the default used when x is not given
export function ListSkeleton({ rows = 3 }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // return = give this value back and stop the function here
  return (
    <div
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-surface"
      // role = tells screen readers what this element is (status, tab, group...)
      role="status"
      // aria-label = the name screen readers read for this element
      // { } in JSX = run JavaScript here and show its result
      // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
      aria-label={t('common.loading')}
    >
      {/* { } in JSX = run JavaScript here and show its result
         => = an arrow function (a short function) */}
      {Array.from({ length: rows }, (_, i) => (
        // key = a stable id for list items so React can track them between redraws
        // { } in JSX = run JavaScript here and show its result
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <div key={i} className="flex items-center gap-4 p-4">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <Skeleton className="size-16 shrink-0 rounded-lg" />
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="flex-1 space-y-2">
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Skeleton className="h-4 w-1/2" />
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Skeleton className="h-3 w-1/3" />
          </div>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
