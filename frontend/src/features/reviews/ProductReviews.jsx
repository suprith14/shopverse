// import = bring in code from another file or package
// useState = a value the component remembers; calling its setter redraws the component
import { useState } from 'react';
// import = bring in code from another file or package
// Trans = a translated sentence with elements (links, bold) inside it; <0> = the first element
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { Trans, useTranslation } from 'react-i18next';
// import = bring in code from another file or package
import { formatDate } from '@/lib/format';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
// useLocation = the current URL (pathname, search) and any state passed to it
import { Link, useLocation } from 'react-router';
// import = bring in code from another file or package
import { BadgeCheck, Pencil } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { ErrorState, Spinner } from '@/components/ui/States';
// import = bring in code from another file or package
import { StarRating } from '@/components/ui/StarRating';
// import = bring in code from another file or package
import { useAuthStore } from '@/features/auth/auth.store';
// import = bring in code from another file or package
import { useMyReview, useReviews } from './reviews.api';
// import = bring in code from another file or package
import { ReviewForm } from './ReviewForm';

// The "Customer reviews" section at the bottom of a product page.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function ProductReviews({ productId }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // which page of reviews (newest first)
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [page, setPage] = useState(1);
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // isLoading = first load, no data yet
  // isError = the request failed
  // isFetching = a request is running (even if old data is shown)
  const { data, isLoading, isError, error, isFetching } = useReviews(productId, page);

  // return = give this value back and stop the function here
  return (
    // <section> = a themed part of the page with its own heading
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <section className="space-y-6 border-t border-slate-200 pt-10">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <h2 className="text-xl font-bold">{t('reviews.title')}</h2>

      {/* { } in JSX = run JavaScript here and show its result
         isLoading = first load, no data yet
         a && b = AND; in JSX: show b only when a is true */}
      {isLoading && <Spinner />}
      {/* { } in JSX = run JavaScript here and show its result
         isError = the request failed
         a && b = AND; in JSX: show b only when a is true */}
      {isError && <ErrorState error={error} />}

      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true */}
      {data && (
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <div className="grid gap-10 md:grid-cols-[280px_1fr]">
          {/* Summary: average + how many of each star */}
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="space-y-4">
            <div>
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result
                 a ? b : c = ternary: if a then b else c
                 .toFixed(n) = number as text with n decimals */}
              <p className="text-4xl font-bold">{data.ratingCount ? data.ratingAvg.toFixed(1) : '–'}</p>
              {/* { } in JSX = run JavaScript here and show its result */}
              <StarRating value={data.ratingAvg} size="md" />
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <p className="mt-1 text-sm text-slate-500">
                {/* { } in JSX = run JavaScript here and show its result
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                {t('reviews.count', { count: data.ratingCount })}
              </p>
            </div>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <ul className="space-y-1.5">
              {/* { } in JSX = run JavaScript here and show its result
                 .map = make a new array by transforming each item (in JSX: one element per item)
                 => = an arrow function (a short function) */}
              {[5, 4, 3, 2, 1].map((star) => {
                // const = a name for a value that is never reassigned
                // obj[key] = read the property whose name is stored in key
                const count = data.distribution[star];
                // share of reviews with this many stars, for the bar
                // const = a name for a value that is never reassigned
                // a ? b : c = ternary: if a then b else c
                // Math = number helpers (min, max, round, floor...)
                const percent = data.ratingCount ? Math.round((count / data.ratingCount) * 100) : 0;
                // return = give this value back and stop the function here
                return (
                  // key = a stable id for list items so React can track them between redraws
                  // { } in JSX = run JavaScript here and show its result
                  // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                  <li key={star} className="flex items-center gap-2 text-sm">
                    {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                       { } in JSX = run JavaScript here and show its result
                       t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                    <span className="w-14 text-slate-600">{t('reviews.stars', { count: star })}</span>
                    {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                         { } in JSX = run JavaScript here and show its result
                         `text ${x}` = a template string: text with values inserted */}
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                    </div>
                    {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                       { } in JSX = run JavaScript here and show its result */}
                    <span className="w-9 text-right text-slate-500">{percent}%</span>
                  </li>
                );
              })}
            </ul>
            {/* { } in JSX = run JavaScript here and show its result */}
            <MyReviewBox productId={productId} />
          </div>

          {/* The reviews themselves */}
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             a ? b : c = ternary: if a then b else c
             isFetching = a request is running (even if old data is shown) */}
          <div className={isFetching ? 'opacity-60' : ''}>
            {/* { } in JSX = run JavaScript here and show its result
               a ? b : c = ternary: if a then b else c
               === = strictly equal (same value AND same type) */}
            {data.items.length === 0 ? (
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              <p className="text-slate-500">{t('reviews.none')}</p>
            ) : (
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              <ul className="divide-y divide-slate-200">
                {/* { } in JSX = run JavaScript here and show its result
                   .map = make a new array by transforming each item (in JSX: one element per item)
                   => = an arrow function (a short function) */}
                {data.items.map((review) => (
                  // key = a stable id for list items so React can track them between redraws
                  // { } in JSX = run JavaScript here and show its result
                  // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                  <li key={review.id} className="space-y-1.5 py-5 first:pt-0">
                    {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                    <div className="flex items-center gap-2">
                      {/* { } in JSX = run JavaScript here and show its result */}
                      <StarRating value={review.rating} />
                      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                         { } in JSX = run JavaScript here and show its result */}
                      <span className="font-semibold">{review.title}</span>
                    </div>
                    {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      {/* { } in JSX = run JavaScript here and show its result */}
                      {review.author} · {formatDate(review.createdAt)}
                      {/* { } in JSX = run JavaScript here and show its result
                         a && b = AND; in JSX: show b only when a is true */}
                      {review.verifiedPurchase && (
                        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                        <span className="flex items-center gap-0.5 font-medium text-green-700">
                          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                             { } in JSX = run JavaScript here and show its result
                             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                          <BadgeCheck className="size-3.5" /> {t('reviews.verified')}
                        </span>
                      )}
                    </p>
                    {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                       { } in JSX = run JavaScript here and show its result */}
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{review.body}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* { } in JSX = run JavaScript here and show its result
               a && b = AND; in JSX: show b only when a is true */}
            {data.totalPages > 1 && (
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              <div className="mt-4 flex items-center gap-3">
                {/* disabled = can't be clicked or typed in
                   { } in JSX = run JavaScript here and show its result
                   onClick = what happens on click/tap
                   => = an arrow function (a short function) */}
                <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  {/* { } in JSX = run JavaScript here and show its result
                     t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                  {t('reviews.newer')}
                </Button>
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                <span className="text-sm text-slate-500">
                  {/* { } in JSX = run JavaScript here and show its result
                     t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                  {t('common.pageOf', { page, total: data.totalPages })}
                </span>
                {/* disabled = can't be clicked or typed in
                   { } in JSX = run JavaScript here and show its result
                   onClick = what happens on click/tap
                   => = an arrow function (a short function) */}
                <Button variant="secondary" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                  {/* { } in JSX = run JavaScript here and show its result
                     t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                  {t('reviews.older')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// What the current visitor can do: log in / write / edit, or why they can't review.
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function MyReviewBox({ productId }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const status = useAuthStore((s) => s.status);
  // const = a name for a value that is never reassigned
  // useLocation = the current URL (pathname, search) and any state passed to it
  const location = useLocation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { data: mine } = useMyReview(productId);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [editing, setEditing] = useState(false);

  // Guests: "Log in to review this product"
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  if (status === 'guest') {
    // return = give this value back and stop the function here
    return (
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      <p className="text-sm text-slate-600">
        {/* <0> in the text becomes the link, so each language can put it where its grammar needs it */}
        {/* Trans = a translated sentence with elements (links, bold) inside it; <0> = the first element */}
        <Trans
          i18nKey="reviews.logInToReview"
          // { } in JSX = run JavaScript here and show its result
          components={[
            // Link = a link to another page of this app (no full page reload)
            <Link
              // key = a stable id for list items so React can track them between redraws
              key="login"
              to="/login"
              // { } in JSX = run JavaScript here and show its result
              state={{ from: location.pathname }}
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              className="font-medium text-brand-600 dark:text-brand-300 hover:underline"
            />,
          ]}
        />
      </p>
    );
  }
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  if (!mine) return null;

  // The form takes over the summary column while open.
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  // => = an arrow function (a short function)
  if (editing) return <ReviewForm productId={productId} existing={mine.review} onDone={() => setEditing(false)} />;

  // if (...) = run the next part only when the condition is true
  if (mine.review) {
    // return = give this value back and stop the function here
    return (
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      // onClick = what happens on click/tap
      // { } in JSX = run JavaScript here and show its result
      // => = an arrow function (a short function)
      <Button variant="secondary" className="w-full" onClick={() => setEditing(true)}>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <Pencil className="size-4" /> {t('reviews.edit')}
      </Button>
    );
  }
  // Bought it and no review yet: "Write a review"
  // if (...) = run the next part only when the condition is true
  if (mine.canReview) {
    // return = give this value back and stop the function here
    return (
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      // onClick = what happens on click/tap
      // { } in JSX = run JavaScript here and show its result
      // => = an arrow function (a short function)
      <Button className="w-full" onClick={() => setEditing(true)}>
        {/* { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {t('reviews.write')}
      </Button>
    );
  }
  // Otherwise the server says why not (e.g. "Only customers who bought this can review it")
  // return = give this value back and stop the function here
  // className = CSS classes (Tailwind) for this element (class is a JS keyword)
  // { } in JSX = run JavaScript here and show its result
  return <p className="text-sm text-slate-500">{mine.reason}</p>;
}
