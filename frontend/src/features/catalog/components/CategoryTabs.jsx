// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
import { useCategories } from '../catalog.api';

// "All | Sneakers | Electronics | Books | Home Decor" tabs.
// With facets, each tab shows how many results it has for the current search and filters,
// e.g. searching "wireless" shows "Electronics 3 · Books 0".
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// onChange = runs on every change of an input
export function CategoryTabs({ active, facets, onChange }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // x = value (in parameters) = the default used when x is not given
  const { data: categories = [] } = useCategories();
  // slug -> number of results, from the product list's facets
  // const = a name for a value that is never reassigned
  // new = create an object from a class (e.g. new Date())
  // Map = key -> value lookup table
  // ?.() = call only if the function exists
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // .map = make a new array by transforming each item (in JSX: one element per item)
  // => = an arrow function (a short function)
  const countBySlug = new Map(facets?.categories.map((c) => [c.slug, c.count]));
  // const = a name for a value that is never reassigned
  // ?.() = call only if the function exists
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // .reduce = combine all items into one value (e.g. a sum)
  // => = an arrow function (a short function)
  const total = facets?.categories.reduce((sum, c) => sum + c.count, 0);
  // const = a name for a value that is never reassigned
  const tabs = [
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    { slug: undefined, name: t('catalog.all'), count: total },
    // ...x = spread: copy all items/properties of x into here
    // .map = make a new array by transforming each item (in JSX: one element per item)
    // => = an arrow function (a short function)
    ...categories.map((c) => ({
      // ...x = spread: copy all items/properties of x into here
      ...c,
      // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
      // `text ${x}` = a template string: text with values inserted
      name: t(`category.${c.slug}`, { defaultValue: c.name }), // names come from the database
      count: countBySlug.get(c.slug),
    })),
  ];

  // return = give this value back and stop the function here
  return (
    // role = tells screen readers what this element is (status, tab, group...)
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div role="tablist" className="flex gap-2 overflow-x-auto pb-1">
      {/* { } in JSX = run JavaScript here and show its result
         .map = make a new array by transforming each item (in JSX: one element per item)
         => = an arrow function (a short function) */}
      {tabs.map((tab) => {
        // const = a name for a value that is never reassigned
        // === = strictly equal (same value AND same type)
        const selected = tab.slug === active;
        // return = give this value back and stop the function here
        return (
          <button
            // key = a stable id for list items so React can track them between redraws
            // { } in JSX = run JavaScript here and show its result
            // a ?? b = a, unless a is null/undefined, then b
            key={tab.slug ?? 'all'}
            // role = tells screen readers what this element is (status, tab, group...)
            role="tab"
            // aria-selected = which tab/option is selected
            // { } in JSX = run JavaScript here and show its result
            aria-selected={selected}
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            // onChange = runs on every change of an input
            onClick={() => onChange(tab.slug)}
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            // { } in JSX = run JavaScript here and show its result
            // `text ${x}` = a template string: text with values inserted
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
              // a ? b : c = ternary: if a then b else c
              selected ? 'bg-slate-900 text-slate-50' : 'bg-surface text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
            } ${tab.count === 0 && !selected ? 'opacity-50' : ''}`}
          >
            {/* { } in JSX = run JavaScript here and show its result */}
            {tab.name}
            {/* { } in JSX = run JavaScript here and show its result
               !== = not strictly equal
               a && b = AND; in JSX: show b only when a is true */}
            {tab.count !== undefined && (
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              // { } in JSX = run JavaScript here and show its result
              // `text ${x}` = a template string: text with values inserted
              // a ? b : c = ternary: if a then b else c
              <span className={`text-xs ${selected ? 'text-slate-300' : 'text-slate-400'}`}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
