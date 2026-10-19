// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useState = a value the component remembers; calling its setter redraws the component
import { useState } from 'react';
// import = bring in code from another file or package
import { Tag, X } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { formatPrice, getErrorMessage } from '@/lib/format';
// import = bring in code from another file or package
import { useCouponStore } from './coupon.store';

// The "Have a coupon?" box in the cart's order summary.
// The preview itself is loaded by the cart page (it also needs the numbers for the total).
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function CouponBox({ preview }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { code, apply, remove } = useCouponStore();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [input, setInput] = useState('');

  // const = a name for a value that is never reassigned
  // onSubmit = runs when the form is sent (Enter or submit button)
  // => = an arrow function (a short function)
  const onSubmit = (e) => {
    // preventDefault = stop the browser's default action (form submit reload, link follow)
    e.preventDefault();
    // if (...) = run the next part only when the condition is true
    // .trim = remove spaces at both ends
    if (input.trim()) apply(input);
  };

  // No coupon applied yet: show the input.
  // No coupon yet: a text field + Apply. Applying only stores the code; the cart page asks the server.
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  if (!code) {
    // return = give this value back and stop the function here
    return (
      // <form> = groups inputs; Enter or a submit button sends it (onSubmit)
      // onSubmit = runs when the form is sent (Enter or submit button)
      // { } in JSX = run JavaScript here and show its result
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          // { } in JSX = run JavaScript here and show its result
          value={input}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onChange={(e) => setInput(e.target.value)}
          // placeholder = grey hint text inside an empty input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          placeholder={t('coupon.placeholder')}
          // aria-label = the name screen readers read for this element
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          aria-label={t('coupon.placeholder')}
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-brand-500"
        />
        <Button type="submit" variant="secondary">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('coupon.apply')}
        </Button>
      </form>
    );
  }

  // Coupon applied: show it as a chip, with either the saving or why it doesn't work.
  // return = give this value back and stop the function here
  return (
    <div
      // red box if the server refused the code (expired, minimum not reached...), green with the saving if accepted
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      // { } in JSX = run JavaScript here and show its result
      // `text ${x}` = a template string: text with values inserted
      // a ? b : c = ternary: if a then b else c
      // isError = the request failed
      className={`rounded-lg border p-3 text-sm ${preview.isError ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}
    >
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex items-center justify-between">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <span className="flex items-center gap-1.5 font-medium">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result */}
          <Tag className="size-4" /> {code}
        </span>
        <button
          // onClick = what happens on click/tap
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onClick={() => {
            remove();
            setInput('');
          }}
          // aria-label = the name screen readers read for this element
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          aria-label={t('coupon.remove')}
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="rounded p-0.5 hover:bg-black/5"
        >
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <X className="size-4" />
        </button>
      </div>
      {/* { } in JSX = run JavaScript here and show its result
         isError = the request failed
         a && b = AND; in JSX: show b only when a is true
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      {preview.isError && <p className="mt-1 text-red-700">{getErrorMessage(preview.error)}</p>}
      {/* { } in JSX = run JavaScript here and show its result
         ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
         === = strictly equal (same value AND same type)
         ! = NOT: flips true/false
         isError = the request failed
         a && b = AND; in JSX: show b only when a is true */}
      {preview.data?.code === code && !preview.isError && (
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <p className="mt-1 text-green-700">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('coupon.youSave', { description: preview.data.description, amount: formatPrice(preview.data.discount) })}
        </p>
      )}
    </div>
  );
}
