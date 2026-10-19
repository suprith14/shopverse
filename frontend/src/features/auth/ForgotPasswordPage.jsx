// import = bring in code from another file or package
// Trans = a translated sentence with elements (links, bold) inside it; <0> = the first element
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { Trans, useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useState = a value the component remembers; calling its setter redraws the component
import { useState } from 'react';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
// useNavigate = gives navigate(url) to change page from code
import { Link, useNavigate } from 'react-router';
// import = bring in code from another file or package
import { MailCheck } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { Input } from '@/components/ui/Input';
// import = bring in code from another file or package
import { ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';
// import = bring in code from another file or package
import { notify } from '@/lib/notify';
// import = bring in code from another file or package
import { useForgotPassword, useResetPassword } from './auth.api';

// /forgot-password in two steps:
//   1. enter your email   -> we email a 6-digit code (if the account exists)
//   2. code + new password -> password changed, you're logged in
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function ForgotPasswordPage() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [email, setEmail] = useState('');
  // 'email' = ask for the email; 'code' = enter the code + new password
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [step, setStep] = useState('email');

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="mx-auto max-w-sm py-12">
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <PageTitle title={t('auth.resetTitle')} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <h1 className="text-2xl font-bold">{t('auth.resetHeading')}</h1>
      {/* { } in JSX = run JavaScript here and show its result
         a ? b : c = ternary: if a then b else c
         === = strictly equal (same value AND same type) */}
      {step === 'email' ? (
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        <EmailStep email={email} setEmail={setEmail} onSent={() => setStep('code')} />
      ) : (
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        <CodeStep email={email} onChangeEmail={() => setStep('email')} />
      )}
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <p className="mt-6 text-center text-sm text-slate-600">
        {/* { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {t('auth.remembered')}{' '}
        {/* Link = a link to another page of this app (no full page reload)
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Link to="/login" className="font-medium text-brand-600 dark:text-brand-300 hover:underline">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  );
}

// Step 1: the email. The server answers the same way whether or not the account exists.
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function EmailStep({ email, setEmail, onSent }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  const forgot = useForgotPassword();
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const submit = (e) => {
    // preventDefault = stop the browser's default action (form submit reload, link follow)
    e.preventDefault();
    // mutate = run the mutation (send the change)
    // onSuccess = runs after the request succeeded
    forgot.mutate({ email }, { onSuccess: onSent });
  };
  // return = give this value back and stop the function here
  return (
    // <form> = groups inputs; Enter or a submit button sends it (onSubmit)
    // onSubmit = runs when the form is sent (Enter or submit button)
    // { } in JSX = run JavaScript here and show its result
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <form onSubmit={submit} className="mt-6 space-y-4">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <p className="text-sm text-slate-500">{t('auth.enterEmail')}</p>
      {/* { } in JSX = run JavaScript here and show its result
         isError = the request failed
         a && b = AND; in JSX: show b only when a is true */}
      {forgot.isError && <ErrorState error={forgot.error} />}
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
        // autoFocus = put the cursor here when it appears
        autoFocus
        // { } in JSX = run JavaScript here and show its result
        value={email}
        // onChange = runs on every change of an input
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        onChange={(e) => setEmail(e.target.value)}
      />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         loading="lazy" = load the image only when it gets near the screen
         { } in JSX = run JavaScript here and show its result
         isPending = the request is running right now */}
      <Button type="submit" className="w-full" loading={forgot.isPending}>
        {/* { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {t('auth.sendCode')}
      </Button>
    </form>
  );
}

// Step 2: the 6-digit code from the email and the new password. Success logs the user in.
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function CodeStep({ email, onChangeEmail }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // useNavigate = gives navigate(url) to change page from code
  const navigate = useNavigate();
  // const = a name for a value that is never reassigned
  const reset = useResetPassword();
  // "Send a new code" calls the same endpoint again (limited to one email a minute)
  // const = a name for a value that is never reassigned
  const resend = useForgotPassword();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [form, setForm] = useState({ code: '', newPassword: '', confirm: '' });
  // const = a name for a value that is never reassigned
  // a && b = AND; in JSX: show b only when a is true
  // !== = not strictly equal
  const mismatch = form.confirm.length > 0 && form.confirm !== form.newPassword;

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const submit = (e) => {
    // preventDefault = stop the browser's default action (form submit reload, link follow)
    e.preventDefault();
    // if (...) = run the next part only when the condition is true
    // return = give this value back and stop the function here
    if (mismatch) return;
    // mutate = run the mutation (send the change)
    reset.mutate(
      { email, code: form.code, newPassword: form.newPassword },
      {
        // onSuccess = runs after the request succeeded
        // => = an arrow function (a short function)
        onSuccess: () => {
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          notify.success(t('auth.resetDone'));
          navigate('/', { replace: true });
        },
      },
    );
  };

  // return = give this value back and stop the function here
  return (
    // <form> = groups inputs; Enter or a submit button sends it (onSubmit)
    // onSubmit = runs when the form is sent (Enter or submit button)
    // { } in JSX = run JavaScript here and show its result
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <form onSubmit={submit} className="mt-6 space-y-4">
      {/* Worded so it doesn't confirm whether the account exists */}
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex gap-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-800 dark:text-brand-300">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <MailCheck className="size-5 shrink-0" />
        <p>
          {/* Trans = a translated sentence with elements (links, bold) inside it; <0> = the first element
             { } in JSX = run JavaScript here and show its result
             key = a stable id for list items so React can track them between redraws */}
          <Trans i18nKey="auth.codeSent" values={{ email }} components={[<b key="email" />]} />
        </p>
      </div>
      {/* { } in JSX = run JavaScript here and show its result
         isError = the request failed
         a && b = AND; in JSX: show b only when a is true */}
      {reset.isError && <ErrorState error={reset.error} />}
      {/* inputMode="numeric": number keypad on phones. autoComplete="one-time-code": phones can
           offer the code straight from the notification. */}
      <Input
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        label={t('auth.code')}
        name="code"
        // required = the browser won't submit the form while this is empty
        required
        // inputMode = which phone keyboard to show (numeric...)
        inputMode="numeric"
        // autoComplete = tells the browser what to auto-fill (email, password, address...)
        autoComplete="one-time-code"
        // maxLength = maximum number of characters
        // { } in JSX = run JavaScript here and show its result
        maxLength={6}
        pattern="\d{6}"
        // autoFocus = put the cursor here when it appears
        autoFocus
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        className="text-center font-mono text-lg tracking-[0.5em]"
        // { } in JSX = run JavaScript here and show its result
        value={form.code}
        // onChange = runs on every change of an input
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        // ...x = spread: copy all items/properties of x into here
        onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, '') })}
      />
      <Input
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        label={t('auth.newPassword')}
        name="newPassword"
        type="password"
        // required = the browser won't submit the form while this is empty
        required
        // minLength = minimum number of characters
        // { } in JSX = run JavaScript here and show its result
        minLength={8}
        // autoComplete = tells the browser what to auto-fill (email, password, address...)
        autoComplete="new-password"
        // { } in JSX = run JavaScript here and show its result
        value={form.newPassword}
        // onChange = runs on every change of an input
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        // ...x = spread: copy all items/properties of x into here
        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
      />
      <Input
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        label={t('auth.confirmPassword')}
        name="confirm"
        type="password"
        // required = the browser won't submit the form while this is empty
        required
        // autoComplete = tells the browser what to auto-fill (email, password, address...)
        autoComplete="new-password"
        // { } in JSX = run JavaScript here and show its result
        value={form.confirm}
        // onChange = runs on every change of an input
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        // ...x = spread: copy all items/properties of x into here
        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
      />
      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true
         className = CSS classes (Tailwind) for this element (class is a JS keyword)
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      {mismatch && <p className="text-sm text-red-600">{t('auth.mismatch')}</p>}
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         loading="lazy" = load the image only when it gets near the screen
         { } in JSX = run JavaScript here and show its result
         isPending = the request is running right now
         disabled = can't be clicked or typed in
         a || b = OR: a if it is truthy, else b
         !== = not strictly equal */}
      <Button type="submit" className="w-full" loading={reset.isPending} disabled={mismatch || form.code.length !== 6}>
        {/* { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {t('auth.resetButton')}
      </Button>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex justify-between text-sm">
        {/* onClick = what happens on click/tap
           { } in JSX = run JavaScript here and show its result
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <button type="button" onClick={onChangeEmail} className="text-slate-500 hover:underline">
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('auth.differentEmail')}
        </button>
        <button
          type="button"
          // disabled = can't be clicked or typed in
          // { } in JSX = run JavaScript here and show its result
          // isPending = the request is running right now
          disabled={resend.isPending}
          // onClick = what happens on click/tap
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onClick={() =>
            // mutate = run the mutation (send the change)
            resend.mutate(
              { email },
              // onSuccess = runs after the request succeeded
              // => = an arrow function (a short function)
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              { onSuccess: () => notify.success(t('auth.newCodeSent')) },
            )
          }
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="text-brand-600 dark:text-brand-300 hover:underline disabled:opacity-50"
        >
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('auth.sendNewCode')}
        </button>
      </div>
    </form>
  );
}
