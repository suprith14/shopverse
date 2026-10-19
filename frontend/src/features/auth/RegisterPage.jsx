// /register: create an account (name, email, password).
// On success the API logs the new user straight in, the page goes home and the
// "set up your profile" wizard opens. Validation rules live on the backend (auth.schema.js);
// the required/minLength attributes here only give quick feedback in the browser.

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useState = a value the component remembers; calling its setter redraws the component
import { useState } from 'react';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
// useNavigate = gives navigate(url) to change page from code
import { Link, useNavigate } from 'react-router';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { Input } from '@/components/ui/Input';
// import = bring in code from another file or package
import { ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { useRegister } from './auth.api';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';
// import = bring in code from another file or package
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function RegisterPage() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // useNavigate = gives navigate(url) to change page from code
  const navigate = useNavigate();
  // the API call + its loading/error state (features/auth/auth.api.js)
  // const = a name for a value that is never reassigned
  const register = useRegister();
  // opens the profile wizard (features/onboarding/)
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const startOnboarding = useOnboardingStore((s) => s.start);
  // one object for all fields; each input updates its own key
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  // const = a name for a value that is never reassigned
  // onSubmit = runs when the form is sent (Enter or submit button)
  // => = an arrow function (a short function)
  const onSubmit = (e) => {
    // stop the browser's own form submit (page reload); React handles it
    // preventDefault = stop the browser's default action (form submit reload, link follow)
    e.preventDefault();
    // mutate = run the mutation (send the change)
    register.mutate(form, {
      // onSuccess = runs after the request succeeded
      // => = an arrow function (a short function)
      onSuccess: () => {
        // replace: Back won't return to the sign-up form
        navigate('/', { replace: true });
        startOnboarding(); // the "set up your profile" wizard, only after creating an account
      },
    });
  };

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="mx-auto max-w-sm py-12">
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <PageTitle title={t('nav.createAccount')} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <h1 className="text-2xl font-bold">{t('auth.createTitle')}</h1>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <p className="mt-1 text-sm text-slate-500">{t('auth.createSubtitle')}</p>

      {/* <form> = groups inputs; Enter or a submit button sends it (onSubmit)
         onSubmit = runs when the form is sent (Enter or submit button)
         { } in JSX = run JavaScript here and show its result
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* e.g. "An account with this email already exists" from the API */}
        {/* { } in JSX = run JavaScript here and show its result
           isError = the request failed
           a && b = AND; in JSX: show b only when a is true */}
        {register.isError && <ErrorState error={register.error} />}
        <Input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          label={t('auth.name')}
          name="name"
          // required = the browser won't submit the form while this is empty
          required
          // minLength = minimum number of characters
          // { } in JSX = run JavaScript here and show its result
          minLength={2}
          // autoComplete = tells the browser what to auto-fill (email, password, address...)
          autoComplete="name"
          // { } in JSX = run JavaScript here and show its result
          value={form.name}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          // ...x = spread: copy all items/properties of x into here
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
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
          // minLength = minimum number of characters
          // { } in JSX = run JavaScript here and show its result
          minLength={8}
          // lets the browser suggest a strong password
          // autoComplete = tells the browser what to auto-fill (email, password, address...)
          autoComplete="new-password"
          // { } in JSX = run JavaScript here and show its result
          value={form.password}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          // ...x = spread: copy all items/properties of x into here
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           loading="lazy" = load the image only when it gets near the screen
           { } in JSX = run JavaScript here and show its result
           isPending = the request is running right now */}
        <Button type="submit" className="w-full" loading={register.isPending}>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('nav.createAccount')}
        </Button>
      </form>

      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <p className="mt-6 text-center text-sm text-slate-600">
        {/* { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {t('auth.haveAccount')}{' '}
        {/* Link = a link to another page of this app (no full page reload)
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Link to="/login" className="font-medium text-brand-600 dark:text-brand-300 hover:underline">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('auth.loginTitle')}
        </Link>
      </p>
    </div>
  );
}
