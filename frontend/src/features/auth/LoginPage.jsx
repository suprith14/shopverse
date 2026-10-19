// /login: email + password. On success the API returns an access token (kept in memory) and
// sets the refresh cookie; then we go back to the page that sent us here.
// 5 wrong passwords lock the account for 15 minutes (server side); the page then shows a live
// countdown instead of an error.

// import = bring in code from another file or package
// Trans = a translated sentence with elements (links, bold) inside it; <0> = the first element
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { Trans, useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useState = a value the component remembers; calling its setter redraws the component
import { useState } from 'react';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
// useLocation = the current URL (pathname, search) and any state passed to it
// useNavigate = gives navigate(url) to change page from code
import { Link, useLocation, useNavigate } from 'react-router';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { Input } from '@/components/ui/Input';
// import = bring in code from another file or package
import { ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { useLogin } from './auth.api';
// import = bring in code from another file or package
import { useRetryCountdown } from '@/lib/use-retry-countdown';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';
// import = bring in code from another file or package
import { useSiteContent } from '@/content/use-site-content';

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function LoginPage() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { brand } = useSiteContent();
  // const = a name for a value that is never reassigned
  // useNavigate = gives navigate(url) to change page from code
  const navigate = useNavigate();
  // const = a name for a value that is never reassigned
  // useLocation = the current URL (pathname, search) and any state passed to it
  const location = useLocation();
  // If the user was redirected here from a protected page, send them back after login.
  // const = a name for a value that is never reassigned
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // a ?? b = a, unless a is null/undefined, then b
  const from = location.state?.from ?? '/';
  // the POST /api/auth/login call with its loading/error state (auth.api.js)
  // const = a name for a value that is never reassigned
  const login = useLogin();
  // const = a name for a value that is never reassigned
  const retry = useRetryCountdown(login.error); // 429 -> live "try again in 14:05"
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [form, setForm] = useState({ email: '', password: '' });

  // const = a name for a value that is never reassigned
  // onSubmit = runs when the form is sent (Enter or submit button)
  // => = an arrow function (a short function)
  const onSubmit = (e) => {
    // preventDefault = stop the browser's default action (form submit reload, link follow)
    e.preventDefault();
    // replace: Back won't return to the login form after logging in
    // mutate = run the mutation (send the change)
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    login.mutate(form, { onSuccess: () => navigate(from, { replace: true }) });
  };

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="mx-auto max-w-sm py-12">
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <PageTitle title={t('auth.loginTitle')} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <h1 className="text-2xl font-bold">{t('auth.welcomeBack')}</h1>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <p className="mt-1 text-sm text-slate-500">{t('auth.loginSubtitle', { brand: brand.name })}</p>

      {/* <form> = groups inputs; Enter or a submit button sends it (onSubmit)
         onSubmit = runs when the form is sent (Enter or submit button)
         { } in JSX = run JavaScript here and show its result
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* While rate-limited, a live countdown replaces the generic error message */}
        {/* { } in JSX = run JavaScript here and show its result
           a ? b : c = ternary: if a then b else c */}
        {retry.blocked ? (
          // role = tells screen readers what this element is (status, tab, group...)
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {/* Trans = a translated sentence with elements (links, bold) inside it; <0> = the first element */}
            <Trans
              i18nKey="auth.rateLimited"
              // { } in JSX = run JavaScript here and show its result
              values={{ time: retry.label }}
              // { } in JSX = run JavaScript here and show its result
              components={[
                // key = a stable id for list items so React can track them between redraws
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                <b key="time" className="tabular-nums" />,
                // Link = a link to another page of this app (no full page reload)
                // key = a stable id for list items so React can track them between redraws
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                <Link key="reset" to="/forgot-password" className="font-medium underline" />,
              ]}
            />
          </div>
        ) : (
          // isError = the request failed
          // a && b = AND; in JSX: show b only when a is true
          // { } in JSX = run JavaScript here and show its result
          login.isError && <ErrorState error={login.error} />
        )}
        <Input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          label={t('auth.email')}
          name="email"
          type="email"
          // required = the browser won't submit the form while this is empty
          required
          // autoComplete = tells the browser what to auto-fill (email, password, address...)
          autoComplete="email"
          // { } in JSX = run JavaScript here and show its result
          value={form.email}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          // ...x = spread: copy all items/properties of x into here
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          label={t('auth.password')}
          name="password"
          type="password"
          // required = the browser won't submit the form while this is empty
          required
          // password managers fill the saved password
          // autoComplete = tells the browser what to auto-fill (email, password, address...)
          autoComplete="current-password"
          // { } in JSX = run JavaScript here and show its result
          value={form.password}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          // ...x = spread: copy all items/properties of x into here
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="-mt-2 text-right">
          {/* Link = a link to another page of this app (no full page reload)
             className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <Link to="/forgot-password" className="text-sm text-brand-600 dark:text-brand-300 hover:underline">
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('auth.forgotPassword')}
          </Link>
        </div>
        {/* Disabled while locked out; the label shows the countdown */}
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           loading="lazy" = load the image only when it gets near the screen
           { } in JSX = run JavaScript here and show its result
           isPending = the request is running right now
           disabled = can't be clicked or typed in */}
        <Button type="submit" className="w-full" loading={login.isPending} disabled={retry.blocked}>
          {/* { } in JSX = run JavaScript here and show its result
             a ? b : c = ternary: if a then b else c
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {retry.blocked ? t('auth.tryAgainIn', { time: retry.label }) : t('auth.loginTitle')}
        </Button>
      </form>

      {/* Demo login for visitors and recruiters. "Fill in" types it into the form for them. */}
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="mt-4 rounded-lg bg-brand-50 p-3 text-xs text-brand-700 dark:text-brand-300">
        {/* Trans = a translated sentence with elements (links, bold) inside it; <0> = the first element */}
        <Trans
          i18nKey="auth.demoAccount"
          // { } in JSX = run JavaScript here and show its result
          values={{ email: 'demo@shopverse.dev', password: 'Demo@12345' }}
          // { } in JSX = run JavaScript here and show its result
          // key = a stable id for list items so React can track them between redraws
          components={[<b key="email" />, <b key="password" />]}
        />
        <button
          type="button"
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="ml-2 underline"
          // onClick = what happens on click/tap
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onClick={() => setForm({ email: 'demo@shopverse.dev', password: 'Demo@12345' })}
        >
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('auth.fillIn')}
        </button>
      </div>

      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <p className="mt-6 text-center text-sm text-slate-600">
        {/* { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {t('auth.newHere')}{' '}
        {/* Link = a link to another page of this app (no full page reload)
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Link to="/register" className="font-medium text-brand-600 dark:text-brand-300 hover:underline">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('auth.createAnAccount')}
        </Link>
      </p>
    </div>
  );
}
