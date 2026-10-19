// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
import { Check } from 'lucide-react';

// Where the customer is in the purchase. Three honest steps that match the real flow:
// 1) cart page (items + delivery address) -> 2) Stripe's payment page -> 3) our order page.
// const = a name for a value that is never reassigned
const STEPS = ['cart', 'payment', 'confirmation']; // keys in checkout.* (i18n)

// `current` is the step in progress (1-3). `done` marks everything as finished (paid).
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// x = value (in parameters) = the default used when x is not given
export function CheckoutSteps({ current, done = false }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    // aria-label = the name screen readers read for this element
    // { } in JSX = run JavaScript here and show its result
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    <ol className="flex items-center gap-2 text-sm" aria-label={t('checkout.progress')}>
      {/* { } in JSX = run JavaScript here and show its result
         .map = make a new array by transforming each item (in JSX: one element per item)
         => = an arrow function (a short function) */}
      {STEPS.map((key, i) => {
        // const = a name for a value that is never reassigned
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        // `text ${x}` = a template string: text with values inserted
        const label = t(`checkout.${key}`);
        // const = a name for a value that is never reassigned
        const step = i + 1;
        // const = a name for a value that is never reassigned
        // a || b = OR: a if it is truthy, else b
        const complete = done || step < current;
        // const = a name for a value that is never reassigned
        // ! = NOT: flips true/false
        // a && b = AND; in JSX: show b only when a is true
        // === = strictly equal (same value AND same type)
        const active = !done && step === current;
        // return = give this value back and stop the function here
        return (
          // key = a stable id for list items so React can track them between redraws
          // { } in JSX = run JavaScript here and show its result
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          // aria-current = marks the current page/step/item
          // a ? b : c = ternary: if a then b else c
          <li key={key} className="flex flex-1 items-center gap-2" aria-current={active ? 'step' : undefined}>
            <span
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              // { } in JSX = run JavaScript here and show its result
              // `text ${x}` = a template string: text with values inserted
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                // a ? b : c = ternary: if a then b else c
                complete
                  ? 'bg-brand-600 text-white'
                  // a ? b : c = ternary: if a then b else c
                  : active
                    ? 'border-2 border-brand-600 text-brand-700 dark:text-brand-300'
                    : 'border border-slate-300 text-slate-400'
              }`}
            >
              {/* { } in JSX = run JavaScript here and show its result
                 a ? b : c = ternary: if a then b else c
                 className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 aria-hidden = screen readers skip this (decoration) */}
              {complete ? <Check className="size-4" aria-hidden /> : step}
            </span>
            {/* Labels hide on very small screens; the numbers still show progress */}
            <span
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              // { } in JSX = run JavaScript here and show its result
              // `text ${x}` = a template string: text with values inserted
              // a ? b : c = ternary: if a then b else c
              className={`hidden sm:inline ${active ? 'font-semibold text-slate-900' : complete ? 'text-slate-700' : 'text-slate-400'}`}
            >
              {/* { } in JSX = run JavaScript here and show its result */}
              {label}
              {/* { } in JSX = run JavaScript here and show its result
                 a && b = AND; in JSX: show b only when a is true
                 className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {complete && <span className="sr-only"> {t('checkout.done')}</span>}
            </span>
            {/* { } in JSX = run JavaScript here and show its result
               a && b = AND; in JSX: show b only when a is true */}
            {step < STEPS.length && (
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              // { } in JSX = run JavaScript here and show its result
              // `text ${x}` = a template string: text with values inserted
              // a ? b : c = ternary: if a then b else c
              // aria-hidden = screen readers skip this (decoration)
              <span className={`h-0.5 flex-1 ${complete ? 'bg-brand-600' : 'bg-slate-200'}`} aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
