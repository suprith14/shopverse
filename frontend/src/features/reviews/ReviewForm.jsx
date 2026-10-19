// Write or edit my review: star picker, title, text; Delete when editing.
// Shown on the product page (ProductReviews) only to customers who bought the product; the server
// checks that again. Saving refreshes the reviews, the average and the stars on product cards.

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useState = a value the component remembers; calling its setter redraws the component
import { useState } from 'react';
// import = bring in code from another file or package
import { Star } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { Input } from '@/components/ui/Input';
// import = bring in code from another file or package
import { ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { useDeleteReview, useSaveReview } from './reviews.api';
// import = bring in code from another file or package
import { notify } from '@/lib/notify';


// Write a new review, or edit / delete your existing one.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function ReviewForm({ productId, existing, onDone }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // a ?? b = a, unless a is null/undefined, then b
  const [rating, setRating] = useState(existing?.rating ?? 0);
  // the star under the mouse: hovering previews a rating before clicking
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [hover, setHover] = useState(0);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // a ?? b = a, unless a is null/undefined, then b
  const [title, setTitle] = useState(existing?.title ?? '');
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // a ?? b = a, unless a is null/undefined, then b
  const [body, setBody] = useState(existing?.body ?? '');
  // const = a name for a value that is never reassigned
  const save = useSaveReview(productId);
  // const = a name for a value that is never reassigned
  const remove = useDeleteReview(productId);

  // const = a name for a value that is never reassigned
  // onSubmit = runs when the form is sent (Enter or submit button)
  // => = an arrow function (a short function)
  const onSubmit = (e) => {
    // preventDefault = stop the browser's default action (form submit reload, link follow)
    e.preventDefault();
    // mutate = run the mutation (send the change)
    save.mutate(
      { rating, title, body },
      {
        // onSuccess = runs after the request succeeded
        // => = an arrow function (a short function)
        onSuccess: () => {
          onDone();
          // a ? b : c = ternary: if a then b else c
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          notify.success(existing ? t('reviewForm.updated') : t('reviewForm.posted'));
        },
      },
    );
  };

  // what the stars show: the hovered rating, else the chosen one
  // const = a name for a value that is never reassigned
  // a || b = OR: a if it is truthy, else b
  const shown = hover || rating;

  // return = give this value back and stop the function here
  return (
    // <form> = groups inputs; Enter or a submit button sends it (onSubmit)
    // onSubmit = runs when the form is sent (Enter or submit button)
    // { } in JSX = run JavaScript here and show its result
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-surface p-5">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         a ? b : c = ternary: if a then b else c
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <h3 className="font-semibold">{existing ? t('reviews.edit') : t('reviews.write')}</h3>

      {/* Star picker: hover previews, click sets. Buttons so it works with the keyboard too. */}
      <div>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('reviewForm.yourRating')}</span>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           onMouseLeave = the pointer left the element
           { } in JSX = run JavaScript here and show its result
           => = an arrow function (a short function) */}
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {/* { } in JSX = run JavaScript here and show its result
             .map = make a new array by transforming each item (in JSX: one element per item)
             => = an arrow function (a short function) */}
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              // key = a stable id for list items so React can track them between redraws
              // { } in JSX = run JavaScript here and show its result
              key={n}
              type="button"
              // onClick = what happens on click/tap
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              onClick={() => setRating(n)}
              // onMouseEnter = the pointer moved over the element
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              onMouseEnter={() => setHover(n)}
              // aria-label = the name screen readers read for this element
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              aria-label={t('reviewForm.stars', { count: n })}
              // each star is a button: works with the keyboard, announced as pressed/not
              // aria-pressed = a toggle button's on/off state
              // { } in JSX = run JavaScript here and show its result
              // === = strictly equal (same value AND same type)
              aria-pressed={rating === n}
            >
              <Star
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                // { } in JSX = run JavaScript here and show its result
                // `text ${x}` = a template string: text with values inserted
                // a ? b : c = ternary: if a then b else c
                className={`size-7 transition ${n <= shown ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
              />
            </button>
          ))}
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             a ? b : c = ternary: if a then b else c
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
             `text ${x}` = a template string: text with values inserted */}
          <span className="ml-2 text-sm text-slate-500">{shown ? t(`reviewForm.ratingLabels.${shown}`) : ''}</span>
        </div>
      </div>

      <Input
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        label={t('reviewForm.title')}
        name="title"
        // { } in JSX = run JavaScript here and show its result
        value={title}
        // onChange = runs on every change of an input
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        onChange={(e) => setTitle(e.target.value)}
        // maxLength = maximum number of characters
        // { } in JSX = run JavaScript here and show its result
        maxLength={100}
        // placeholder = grey hint text inside an empty input
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        placeholder={t('reviewForm.titlePlaceholder')}
        // required = the browser won't submit the form while this is empty
        required
      />

      {/* <label> = the name of an input; clicking it focuses the input
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <label className="block">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('reviewForm.review')}</span>
        <textarea
          // { } in JSX = run JavaScript here and show its result
          value={body}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onChange={(e) => setBody(e.target.value)}
          // { } in JSX = run JavaScript here and show its result
          rows={4}
          // maxLength = maximum number of characters
          // { } in JSX = run JavaScript here and show its result
          maxLength={2000}
          // required = the browser won't submit the form while this is empty
          required
          // placeholder = grey hint text inside an empty input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          placeholder={t('reviewForm.reviewPlaceholder')}
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="w-full rounded-lg border border-slate-300 bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </label>

      {/* The backend's validation messages, e.g. "Review must be at least 10 characters" */}
      {/* { } in JSX = run JavaScript here and show its result
         isError = the request failed
         a || b = OR: a if it is truthy, else b
         a && b = AND; in JSX: show b only when a is true
         a ?? b = a, unless a is null/undefined, then b */}
      {(save.isError || remove.isError) && <ErrorState error={save.error ?? remove.error} />}

      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* loading="lazy" = load the image only when it gets near the screen
           { } in JSX = run JavaScript here and show its result
           isPending = the request is running right now
           disabled = can't be clicked or typed in
           === = strictly equal (same value AND same type) */}
        <Button type="submit" loading={save.isPending} disabled={rating === 0}>
          {/* { } in JSX = run JavaScript here and show its result
             a ? b : c = ternary: if a then b else c
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {existing ? t('reviewForm.save') : t('reviewForm.post')}
        </Button>
        {/* onClick = what happens on click/tap
           { } in JSX = run JavaScript here and show its result */}
        <Button type="button" variant="ghost" onClick={onDone}>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('common.cancel')}
        </Button>
        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true */}
        {existing && (
          <Button
            type="button"
            variant="ghost"
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="ml-auto text-red-600 hover:bg-red-50"
            // loading="lazy" = load the image only when it gets near the screen
            // { } in JSX = run JavaScript here and show its result
            // isPending = the request is running right now
            loading={remove.isPending}
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            onClick={() => {
              // deleting a review can't be undone, so it asks first
              // if (...) = run the next part only when the condition is true
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              if (confirm(t('reviewForm.confirmDelete')))
                // mutate = run the mutation (send the change)
                remove.mutate(undefined, {
                  // onSuccess = runs after the request succeeded
                  // => = an arrow function (a short function)
                  onSuccess: () => {
                    onDone();
                    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                    notify.success(t('reviewForm.deleted'));
                  },
                });
            }}
          >
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('reviewForm.delete')}
          </Button>
        )}
      </div>
    </form>
  );
}
