// Five stars for a product's rating, e.g. 4.3 -> four filled stars. Used on product cards,
// the product page and reviews. `count` (optional) shows the number of reviews next to the stars.

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
import { Star } from 'lucide-react';

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// x = value (in parameters) = the default used when x is not given
export function StarRating({ value, count, size = 'sm' }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // small stars in lists, bigger ones on the product page
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // === = strictly equal (same value AND same type)
  const px = size === 'sm' ? 'size-3.5' : 'size-5';
  // return = give this value back and stop the function here
  return (
    // Screen readers hear "Rated 4.3 out of 5" instead of five separate icons
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    // aria-label = the name screen readers read for this element
    // { } in JSX = run JavaScript here and show its result
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    // .toFixed(n) = number as text with n decimals
    <div className="flex items-center gap-1" aria-label={t('product.rated', { value: value.toFixed(1) })}>
      {/* { } in JSX = run JavaScript here and show its result
         .map = make a new array by transforming each item (in JSX: one element per item)
         => = an arrow function (a short function) */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          // key = a stable id for list items so React can track them between redraws
          // { } in JSX = run JavaScript here and show its result
          key={i}
          // star i is filled when the rounded rating reaches it
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          // { } in JSX = run JavaScript here and show its result
          // `text ${x}` = a template string: text with values inserted
          // a ? b : c = ternary: if a then b else c
          // Math = number helpers (min, max, round, floor...)
          className={`${px} ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
      {/* { } in JSX = run JavaScript here and show its result
         !== = not strictly equal
         a && b = AND; in JSX: show b only when a is true
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      {count !== undefined && <span className="ml-1 text-xs text-slate-500">({count})</span>}
    </div>
  );
}
