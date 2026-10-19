// import = bring in code from another file or package
// useState = a value the component remembers; calling its setter redraws the component
import { useState } from 'react';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
import { Link } from 'react-router';
// import = bring in code from another file or package
// useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
import { useMutation } from '@tanstack/react-query';
// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
import { ArrowLeft, BookOpen, Lock } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { Input } from '@/components/ui/Input';
// import = bring in code from another file or package
import { ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';
// import = bring in code from another file or package
// api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
import { api } from '@/lib/api-client';
// import = bring in code from another file or package
import { useRetryCountdown } from '@/lib/use-retry-countdown';
// import = bring in code from another file or package
import { useTheme } from '@/lib/theme';

// /account/guide: the project guide (system map, flows, code, data), behind a password.
// The server checks the password and only then sends the guide (POST /api/guide/unlock), so it
// is never in the store's own JavaScript. The guide is kept in memory only: leaving the page or
// reloading locks it again.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function GuidePage() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const theme = useTheme((s) => s.resolved);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [password, setPassword] = useState('');
  // const = a name for a value that is never reassigned
  // useMutation = CHANGE server data (POST/PUT/DELETE); gives mutate() and isPending
  const unlock = useMutation({
    // mutationFn = the function that sends the change to the server
    // => = an arrow function (a short function)
    // async = this function works with await and returns a Promise
    // await = wait for a Promise (async result) before continuing
    // api = our axios instance: adds the login token and refreshes it on 401 (lib/api-client.js)
    mutationFn: async (pw) => (await api.post('/guide/unlock', { password: pw })).data.html,
  });
  // const = a name for a value that is never reassigned
  const retry = useRetryCountdown(unlock.error); // 429 -> "try again in 14:05"
  // const = a name for a value that is never reassigned
  const html = unlock.data;

  // if (...) = run the next part only when the condition is true
  if (html) {
    // A complete document for the frame, in the store's current theme (the guide reads data-theme).
    // sandbox: the guide's own script may run, but it can't touch the store's page, cookies or
    // storage (no allow-same-origin). Links may still open in a new tab.
    // const = a name for a value that is never reassigned
    // `text ${x}` = a template string: text with values inserted
    const doc = `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${html}</body></html>`;
    // return = give this value back and stop the function here
    return (
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      <div className="space-y-4">
        {/* { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <PageTitle title={t('guide.title')} />
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Link = a link to another page of this app (no full page reload) */}
          <Link
            to="/account"
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-300 hover:underline"
          >
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <ArrowLeft className="size-4" /> {t('nav.myAccount')}
          </Link>
          {/* onClick = what happens on click/tap
             { } in JSX = run JavaScript here and show its result
             => = an arrow function (a short function) */}
          <Button variant="secondary" onClick={() => unlock.reset()}>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <Lock className="size-4" /> {t('guide.lock')}
          </Button>
        </div>
        {/* <iframe> = a separate page shown inside this one */}
        <iframe
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          title={t('guide.title')}
          // srcDoc = HTML to show inside the iframe
          // { } in JSX = run JavaScript here and show its result
          srcDoc={doc}
          // sandbox = limits what the iframe's content may do
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="h-[calc(100vh-11rem)] min-h-[32rem] w-full rounded-xl border border-slate-200 bg-surface"
        />
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <p className="text-xs text-slate-500">{t('guide.englishOnly')}</p>
      </div>
    );
  }

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="mx-auto max-w-md py-10">
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <PageTitle title={t('guide.title')} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-surface p-6">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:text-brand-300">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             aria-hidden = screen readers skip this (decoration) */}
          <BookOpen className="size-6" aria-hidden />
        </span>
        <div>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <h1 className="text-xl font-bold">{t('guide.title')}</h1>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <p className="mt-1 text-sm text-slate-500">{t('guide.intro')}</p>
        </div>
        {/* <form> = groups inputs; Enter or a submit button sends it (onSubmit) */}
        <form
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="space-y-4"
          // onSubmit = runs when the form is sent (Enter or submit button)
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onSubmit={(e) => {
            // preventDefault = stop the browser's default action (form submit reload, link follow)
            e.preventDefault();
            // mutate = run the mutation (send the change)
            unlock.mutate(password);
          }}
        >
          {/* { } in JSX = run JavaScript here and show its result
             a ? b : c = ternary: if a then b else c */}
          {retry.blocked ? (
            // role = tells screen readers what this element is (status, tab, group...)
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {t('guide.tooMany', { time: retry.label })}
            </div>
          ) : (
            // isError = the request failed
            // a && b = AND; in JSX: show b only when a is true
            // { } in JSX = run JavaScript here and show its result
            unlock.isError && <ErrorState error={unlock.error} />
          )}
          <Input
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            label={t('guide.password')}
            name="guide-password"
            type="password"
            // autoComplete = tells the browser what to auto-fill (email, password, address...)
            autoComplete="off"
            // required = the browser won't submit the form while this is empty
            required
            // autoFocus = put the cursor here when it appears
            autoFocus
            // { } in JSX = run JavaScript here and show its result
            value={password}
            // onChange = runs on every change of an input
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             loading="lazy" = load the image only when it gets near the screen
             { } in JSX = run JavaScript here and show its result
             isPending = the request is running right now
             disabled = can't be clicked or typed in */}
          <Button type="submit" className="w-full" loading={unlock.isPending} disabled={retry.blocked}>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
               { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            <Lock className="size-4" /> {t('guide.unlock')}
          </Button>
        </form>
        {/* Link = a link to another page of this app (no full page reload) */}
        <Link
          to="/account"
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-300 hover:underline"
        >
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <ArrowLeft className="size-4" /> {t('nav.myAccount')}
        </Link>
      </div>
    </div>
  );
}
