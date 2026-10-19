// /shop: the product list with category tabs, filters, sorting, search results and pages.
// Every filter lives in the URL, so a filtered page can be shared, bookmarked, reloaded, and the
// Back button works. useProducts(filters) asks the API for exactly what the URL says.

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useState = a value the component remembers; calling its setter redraws the component
import { useState } from 'react';
// import = bring in code from another file or package
// useSearchParams = read/write the ?query=part of the URL
import { useSearchParams } from 'react-router';
// import = bring in code from another file or package
import { SlidersHorizontal } from 'lucide-react';
// import = bring in code from another file or package
import { EmptyState, ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
// import = bring in code from another file or package
import { useProducts } from './catalog.api';
// import = bring in code from another file or package
import { CategoryTabs } from './components/CategoryTabs';
// import = bring in code from another file or package
import { FilterSidebar } from './components/FilterSidebar';
// import = bring in code from another file or package
import { Pagination } from './components/Pagination';
// import = bring in code from another file or package
import { ProductCard } from './components/ProductCard';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';

// "25" -> 25, missing or empty -> undefined (= no filter)
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// a ? b : c = ternary: if a then b else c
// === = strictly equal (same value AND same type)
// a || b = OR: a if it is truthy, else b
const num = (v) => (v === null || v === '' ? undefined : Number(v));

// The URL is the single source of truth for filters: /shop?category=books&sort=price_asc&page=2
// Changing a filter updates the URL, and the URL drives the API query.
// function = a named, reusable block of code
function useFiltersFromUrl() {
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useSearchParams = read/write the ?query=part of the URL
  const [params, setParams] = useSearchParams();

  // const = a name for a value that is never reassigned
  const filters = {
    // a ?? b = a, unless a is null/undefined, then b
    category: params.get('category') ?? undefined,
    // a ?? b = a, unless a is null/undefined, then b
    q: params.get('q') ?? undefined,
    // a ?? b = a, unless a is null/undefined, then b
    brand: params.get('brand') ?? undefined,
    minPrice: num(params.get('minPrice')),
    maxPrice: num(params.get('maxPrice')),
    minRating: num(params.get('minRating')),
    // No sort in the URL = let the backend choose (best match when searching, newest otherwise).
    // a ?? b = a, unless a is null/undefined, then b
    sort: params.get('sort') ?? undefined,
    // a ?? b = a, unless a is null/undefined, then b
    page: num(params.get('page')) ?? 1,
  };

  // Change some filters, e.g. update({ sort: "price_asc" }): writes a new URL, which triggers a new query.
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const update = (patch) => {
    // const = a name for a value that is never reassigned
    // ...x = spread: copy all items/properties of x into here
    const next = { ...filters, page: 1, ...patch }; // any filter change resets to page 1
    // const = a name for a value that is never reassigned
    // new = create an object from a class (e.g. new Date())
    const search = new URLSearchParams();
    // const = a name for a value that is never reassigned
    // [a, b] = destructuring: take the first and second items of an array
    // Object.entries = [key, value] pairs of an object
    for (const [key, value] of Object.entries(next)) {
      // keep the URL short: skip empty filters and page=1
      // if (...) = run the next part only when the condition is true
      // !== = not strictly equal
      // a && b = AND; in JSX: show b only when a is true
      // ! = NOT: flips true/false
      // === = strictly equal (same value AND same type)
      if (value !== undefined && value !== '' && !(key === 'page' && value === 1)) search.set(key, String(value));
    }
    setParams(search);
  };

  // "Clear all filters" keeps the search text and category tab, and clears everything else.
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const reset = () => {
    // const = a name for a value that is never reassigned
    // new = create an object from a class (e.g. new Date())
    const keep = new URLSearchParams();
    // if (...) = run the next part only when the condition is true
    if (filters.q) keep.set('q', filters.q);
    // if (...) = run the next part only when the condition is true
    if (filters.category) keep.set('category', filters.category);
    setParams(keep);
  };

  // return = give this value back and stop the function here
  return { filters, update, reset };
}

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function CatalogPage() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { filters, update, reset } = useFiltersFromUrl();
  // isFetching = a new page/filter is loading while the old results are still shown
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // isLoading = first load, no data yet
  // isError = the request failed
  // isFetching = a request is running (even if old data is shown)
  const { data, isLoading, isError, error, isFetching } = useProducts(filters);
  // phones only: is the filter panel open?
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [showFilters, setShowFilters] = useState(false);
  // how many filters are on, shown as a badge on the "Filters" button
  // const = a name for a value that is never reassigned
  // a ?? b = a, unless a is null/undefined, then b
  // .filter = keep only the items that pass a test
  const activeFilters = [filters.brand, filters.minPrice ?? filters.maxPrice, filters.minRating].filter(
    // => = an arrow function (a short function)
    // !== = not strictly equal
    (v) => v !== undefined,
  ).length;

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="space-y-6">
      {/* { } in JSX = run JavaScript here and show its result
         a ? b : c = ternary: if a then b else c
         `text ${x}` = a template string: text with values inserted
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <PageTitle title={filters.q ? `"${filters.q}"` : t('catalog.title')} />
      <div>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           a ? b : c = ternary: if a then b else c
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <h1 className="text-2xl font-bold">{filters.q ? t('catalog.resultsFor', { query: filters.q }) : t('catalog.title')}</h1>
        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true
           className = CSS classes (Tailwind) for this element (class is a JS keyword)
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {data && <p className="text-sm text-slate-500">{t('catalog.productCount', { count: data.total })}</p>}
      </div>

      {/* Changing tab clears brand (brands differ per category) */}
      <CategoryTabs
        // { } in JSX = run JavaScript here and show its result
        active={filters.category}
        // { } in JSX = run JavaScript here and show its result
        // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
        facets={data?.facets}
        // onChange = runs on every change of an input
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        onChange={(category) => update({ category, brand: undefined })}
      />

      {/* Phones and tablets: filters fold away behind a button, so products come first.
           The count shows filters are active even while they're hidden. */}
      <button
        // onClick = what happens on click/tap
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        // ! = NOT: flips true/false
        onClick={() => setShowFilters((s) => !s)}
        // aria-expanded = tells screen readers if the controlled panel is open
        // { } in JSX = run JavaScript here and show its result
        aria-expanded={showFilters}
        // aria-controls = the id of the element this button opens/closes
        aria-controls="filters"
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-surface px-4 py-2 text-sm font-medium lg:hidden"
      >
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           a ? b : c = ternary: if a then b else c
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <SlidersHorizontal className="size-4" /> {showFilters ? t('catalog.hideFilters') : t('catalog.filters')}
        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true */}
        {activeFilters > 0 && (
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          // { } in JSX = run JavaScript here and show its result
          <span className="rounded-full bg-brand-600 px-2 text-xs text-white">{activeFilters}</span>
        )}
      </button>

      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Always visible on large screens; on phones only after tapping "Filters" */}
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           a ? b : c = ternary: if a then b else c */}
        <div id="filters" className={showFilters ? 'block' : 'hidden lg:block'}>
          {/* { } in JSX = run JavaScript here and show its result
             ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
             onChange = runs on every change of an input */}
          <FilterSidebar filters={filters} facets={data?.facets} onChange={update} onReset={reset} />
        </div>

        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="space-y-6">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* No product had every word: we're showing products that match some of them. */}
            {/* { } in JSX = run JavaScript here and show its result
               a ? b : c = ternary: if a then b else c
               ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
               === = strictly equal (same value AND same type) */}
            {data?.matchMode === 'any' ? (
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {/* { } in JSX = run JavaScript here and show its result
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                {t('catalog.partialMatch', { query: filters.q })}
              </p>
            ) : (
              <span />
            )}
            {/* <select> = a dropdown list */}
            <select
              // the URL's sort, else what the server chose (best match when searching)
              // { } in JSX = run JavaScript here and show its result
              // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
              // a ?? b = a, unless a is null/undefined, then b
              value={filters.sort ?? data?.sort ?? 'newest'}
              // onChange = runs on every change of an input
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              onChange={(e) => update({ sort: e.target.value })}
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              className="rounded-lg border border-slate-300 bg-surface px-3 py-2 text-sm"
              // aria-label = the name screen readers read for this element
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              aria-label={t('catalog.sortLabel')}
            >
              {/* "Best match" only makes sense when searching */}
              {/* { } in JSX = run JavaScript here and show its result
                 a && b = AND; in JSX: show b only when a is true
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {filters.q && <option value="relevance">{t('catalog.sort.relevance')}</option>}
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <option value="newest">{t('catalog.sort.newest')}</option>
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <option value="price_asc">{t('catalog.sort.price_asc')}</option>
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <option value="price_desc">{t('catalog.sort.price_desc')}</option>
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <option value="rating">{t('catalog.sort.rating')}</option>
            </select>
          </div>

          {/* { } in JSX = run JavaScript here and show its result
             isLoading = first load, no data yet
             a && b = AND; in JSX: show b only when a is true
             className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          {isLoading && <ProductGridSkeleton count={6} className="grid grid-cols-2 gap-4 md:grid-cols-3" />}
          {/* { } in JSX = run JavaScript here and show its result
             isError = the request failed
             a && b = AND; in JSX: show b only when a is true */}
          {isError && <ErrorState error={error} />}
          {/* { } in JSX = run JavaScript here and show its result
             === = strictly equal (same value AND same type)
             a && b = AND; in JSX: show b only when a is true */}
          {data && data.items.length === 0 && (
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            <EmptyState title={t('catalog.noProducts')} hint={t('catalog.noProductsHint')} />
          )}

          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true */}
          {data && data.items.length > 0 && (
            // Faded while the next page loads, instead of an empty grid
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            // { } in JSX = run JavaScript here and show its result
            // `text ${x}` = a template string: text with values inserted
            // a ? b : c = ternary: if a then b else c
            // isFetching = a request is running (even if old data is shown)
            <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}>
              {/* { } in JSX = run JavaScript here and show its result
                 .map = make a new array by transforming each item (in JSX: one element per item)
                 => = an arrow function (a short function) */}
              {data.items.map((p) => (
                // key = a stable id for list items so React can track them between redraws
                // { } in JSX = run JavaScript here and show its result
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true
             onChange = runs on every change of an input
             => = an arrow function (a short function) */}
          {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={(page) => update({ page })} />}
        </div>
      </div>
    </div>
  );
}
