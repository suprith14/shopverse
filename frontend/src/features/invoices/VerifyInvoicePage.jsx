// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useParams = the :parts of the URL, e.g. :slug in /products/:slug
import { useParams } from 'react-router';
// import = bring in code from another file or package
// useQuery = READ server data with caching, loading and error states
import { useQuery } from '@tanstack/react-query';
// import = bring in code from another file or package
import { isAxiosError } from 'axios';
// import = bring in code from another file or package
import { BadgeCheck, RotateCcw, ShieldAlert } from 'lucide-react';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';
// import = bring in code from another file or package
import { Skeleton } from '@/components/ui/Skeleton';
// import = bring in code from another file or package
// api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
import { api } from '@/lib/api-client';
// import = bring in code from another file or package
import { formatDate, formatPrice } from '@/lib/format';
// import = bring in code from another file or package
import { useSiteContent } from '@/content/use-site-content';

// /verify/:token, opened by scanning the QR code on an invoice. PUBLIC: no login, because the
// person checking may not be the customer (an accountant, an employer, a tax officer).
// It shows only what's needed to match the paper copy, never personal details.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function VerifyInvoicePage() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { brand } = useSiteContent();
  // the secret 48-character code from the QR link (not the invoice number, which is guessable)
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // x = value (in parameters) = the default used when x is not given
  // useParams = the :parts of the URL, e.g. :slug in /products/:slug
  const { token = '' } = useParams();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // isLoading = first load, no data yet
  // useQuery = READ server data with caching, loading and error states
  const { data, isLoading, error } = useQuery({
    // queryKey = the name of this data in the cache; same key = same cached answer
    queryKey: ['verify-invoice', token],
    // queryFn = the function that actually fetches the data
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    // `text ${x}` = a template string: text with values inserted
    queryFn: async () => (await api.get(`/invoices/verify/${token}`)).data.invoice,
    retry: false, // "not found" won't change by asking again
  });

  // unknown or malformed code = "not found"; anything else = "could not check right now"
  // const = a name for a value that is never reassigned
  // a && b = AND; in JSX: show b only when a is true
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // === = strictly equal (same value AND same type)
  // a || b = OR: a if it is truthy, else b
  const notFound = isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400);

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="mx-auto max-w-md py-10">
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <PageTitle title={t('invoice.pageTitle')} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="rounded-2xl border border-slate-200 bg-surface p-6 text-center shadow-sm">
        {/* { } in JSX = run JavaScript here and show its result
           isLoading = first load, no data yet
           a && b = AND; in JSX: show b only when a is true */}
        {isLoading && (
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          // role = tells screen readers what this element is (status, tab, group...)
          // aria-label = the name screen readers read for this element
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          <div className="space-y-3" role="status" aria-label={t('invoice.checking')}>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Skeleton className="mx-auto size-12 rounded-full" />
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Skeleton className="mx-auto h-5 w-2/3" />
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <Skeleton className="mx-auto h-4 w-1/2" />
          </div>
        )}

        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true */}
        {data && (
          // <> </> = a fragment: groups elements without adding an extra HTML element
          <>
            {/* { } in JSX = run JavaScript here and show its result
               a ? b : c = ternary: if a then b else c
               === = strictly equal (same value AND same type) */}
            {data.status === 'PAID' ? (
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              // aria-hidden = screen readers skip this (decoration)
              <BadgeCheck className="mx-auto size-12 text-green-600" aria-hidden />
            ) : (
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              // aria-hidden = screen readers skip this (decoration)
              <RotateCcw className="mx-auto size-12 text-amber-600" aria-hidden />
            )}
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <h1 className="mt-3 text-xl font-bold">
              {/* { } in JSX = run JavaScript here and show its result
                 a ? b : c = ternary: if a then b else c
                 === = strictly equal (same value AND same type)
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {data.status === 'PAID' ? t('invoice.genuine', { brand: brand.name }) : t('invoice.genuineRefunded')}
            </h1>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <p className="mt-1 text-sm text-slate-500">{t('invoice.compare')}</p>
            {/* <dl> = a list of terms (<dt>) and their values (<dd>)
               className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <dl className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200 text-left text-sm">
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                 className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <Row label={t('invoice.number')} value={<span className="font-mono">{data.number}</span>} />
              <Row
                // { } in JSX = run JavaScript here and show its result
                // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                label={t('invoice.issued')}
                // { } in JSX = run JavaScript here and show its result
                value={formatDate(data.issuedAt, { day: 'numeric', month: 'long', year: 'numeric' })}
              />
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <Row label={t('invoice.total')} value={formatPrice(data.total)} />
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                 a ? b : c = ternary: if a then b else c
                 === = strictly equal (same value AND same type) */}
              <Row label={t('invoice.status')} value={data.status === 'PAID' ? t('invoice.paid') : t('invoice.refunded')} />
            </dl>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <p className="mt-4 text-xs text-slate-400">
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {t('invoice.privacy')}
            </p>
          </>
        )}

        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true */}
        {error && (
          // <> </> = a fragment: groups elements without adding an extra HTML element
          <>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               aria-hidden = screen readers skip this (decoration) */}
            <ShieldAlert className="mx-auto size-12 text-red-600" aria-hidden />
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result
               a ? b : c = ternary: if a then b else c
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <h1 className="mt-3 text-xl font-bold">{notFound ? t('invoice.notFound') : t('invoice.cantCheck')}</h1>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <p className="mt-2 text-sm text-slate-600">
              {/* { } in JSX = run JavaScript here and show its result
                 a ? b : c = ternary: if a then b else c */}
              {notFound
                // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                ? t('invoice.notFoundText', { brand: brand.name })
                // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                : t('invoice.tryLater')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// One "label: value" line in the details box
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function Row({ label, value }) {
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="flex justify-between gap-4 px-4 py-2.5">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <dt className="text-slate-500">{label}</dt>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
