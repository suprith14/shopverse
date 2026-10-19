// /account ("My account"): profile photo, details, delivery addresses, password, project guide.
// Each card is its own small component below (PhotoSection, DetailsSection, AddressBook,
// PasswordSection, GuideSection) with its own save button, loading state and errors, so a
// problem in one never blocks the others. All data: useProfile() -> GET /api/profile.

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useState = a value the component remembers; calling its setter redraws the component
import { useState } from 'react';
// import = bring in code from another file or package
import { BookOpen, Camera, KeyRound, Lock, MapPin, Plus, Trash2, User as UserIcon } from 'lucide-react';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
import { Link } from 'react-router';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { PhotoPicker } from '@/components/ui/PhotoPicker';
// import = bring in code from another file or package
import { Input } from '@/components/ui/Input';
// import = bring in code from another file or package
import { ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { ListSkeleton } from '@/components/ui/Skeleton';
// import = bring in code from another file or package
import { AddressForm } from './AddressForm';
// import = bring in code from another file or package
import { AddressLines } from './AddressCard';
// import = bring in code from another file or package
import { PageTitle } from '@/components/layout/PageTitle';
// import = bring in code from another file or package
import { notify } from '@/lib/notify';
// import = bring in code from another file or package
import { useChangePassword } from '@/features/auth/auth.api';
// import = bring in code from another file or package
import {
  useAddAddress,
  useDeleteAddress,
  useProfile,
  useRemoveAvatar,
  useSetDefaultAddress,
  useUpdateAddress,
  useUpdateProfile,
  useUploadAvatar,
} from './account.api';

// The page: loads the profile once and hands it to each card.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function AccountPage() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // isLoading = first load, no data yet
  // isError = the request failed
  const { data: profile, isLoading, isError, error } = useProfile();
  // if (...) = run the next part only when the condition is true
  // isLoading = first load, no data yet
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  if (isLoading) return <ListSkeleton rows={3} />;
  // if (...) = run the next part only when the condition is true
  // isError = the request failed
  // a || b = OR: a if it is truthy, else b
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  if (isError || !profile) return <ErrorState error={error} />;

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="mx-auto max-w-3xl space-y-6">
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <PageTitle title={t('nav.myAccount')} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <h1 className="text-2xl font-bold">{t('nav.myAccount')}</h1>
      {/* { } in JSX = run JavaScript here and show its result */}
      <PhotoSection profile={profile} />
      {/* key: re-create the form with fresh values after a save */}
      {/* key = a stable id for list items so React can track them between redraws
         { } in JSX = run JavaScript here and show its result
         `text ${x}` = a template string: text with values inserted */}
      <DetailsSection key={`${profile.name}|${profile.phone}|${profile.dateOfBirth}`} profile={profile} />
      {/* { } in JSX = run JavaScript here and show its result */}
      <AddressBook profile={profile} />
      <PasswordSection />
      <GuideSection />
    </div>
  );
}

// Link to the password-protected project guide (/account/guide)
// function Name() = a React component (capital letter): returns what to show (JSX)
function GuideSection() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // return = give this value back and stop the function here
  return (
    // { } in JSX = run JavaScript here and show its result
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    <Section title={t('guide.title')} icon={BookOpen}>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <p className="max-w-md text-sm text-slate-600">{t('guide.teaser')}</p>
        {/* Link = a link to another page of this app (no full page reload) */}
        <Link
          to="/account/guide"
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-surface px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
        >
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <Lock className="size-4" /> {t('guide.open')}
        </Link>
      </div>
    </Section>
  );
}

// The white card with an icon + title that every section uses
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// children = whatever is written between this component's opening and closing tags
function Section({ title, icon: Icon, children }) {
  // return = give this value back and stop the function here
  return (
    // <section> = a themed part of the page with its own heading
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <section className="rounded-xl border border-slate-200 bg-surface p-5">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result */}
        <Icon className="size-4 text-slate-500" /> {title}
      </h2>
      {/* { } in JSX = run JavaScript here and show its result
         children = whatever is written between this component's opening and closing tags */}
      {children}
    </section>
  );
}

// ------------------------------------------------------------------ Photo

// const = a name for a value that is never reassigned
const MAX_PHOTO_MB = 5;
// const = a name for a value that is never reassigned
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function PhotoSection({ profile }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  const upload = useUploadAvatar();
  // const = a name for a value that is never reassigned
  const remove = useRemoveAvatar();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [localError, setLocalError] = useState(null);

  // Quick checks in the browser, so a 40 MB file fails instantly instead of after a long upload.
  // (Cloudinary enforces the formats too: the browser check is only for convenience.)
  // From the camera or a file: the same checks either way
  // Checked here first for a quick message; the server and Cloudinary check again
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const onPick = (file) => {
    setLocalError(null);
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // .includes = true if the array/string contains the value
    // return = give this value back and stop the function here
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    if (!PHOTO_TYPES.includes(file.type)) return setLocalError(t('account.photoType'));
    // if (...) = run the next part only when the condition is true
    // return = give this value back and stop the function here
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return setLocalError(t('account.photoSize', { mb: MAX_PHOTO_MB }));
    // mutate = run the mutation (send the change)
    // onSuccess = runs after the request succeeded
    // => = an arrow function (a short function)
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    upload.mutate(file, { onSuccess: () => notify.success(t('account.photoUpdated')) });
  };

  // return = give this value back and stop the function here
  return (
    // { } in JSX = run JavaScript here and show its result
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    <Section title={t('account.photo')} icon={Camera}>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex items-center gap-5">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="size-20 shrink-0 overflow-hidden rounded-full bg-slate-100">
          {/* { } in JSX = run JavaScript here and show its result
             a ? b : c = ternary: if a then b else c */}
          {profile.avatarUrl ? (
            // { } in JSX = run JavaScript here and show its result
            // alt = text describing the image for screen readers (empty = decorative)
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <img src={profile.avatarUrl} alt={t('account.photoAlt')} className="size-full object-cover" />
          ) : (
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <div className="flex size-full items-center justify-center text-2xl font-semibold text-slate-400">
              {/* { } in JSX = run JavaScript here and show its result */}
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="space-y-2">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="flex flex-wrap gap-2">
            {/* { } in JSX = run JavaScript here and show its result
               accept = which file types the file picker shows
               .join = turn an array into one string with a separator
               loading="lazy" = load the image only when it gets near the screen
               isPending = the request is running right now */}
            <PhotoPicker onFile={onPick} accept={PHOTO_TYPES.join(',')} loading={upload.isPending} />
            {/* { } in JSX = run JavaScript here and show its result
               a && b = AND; in JSX: show b only when a is true */}
            {profile.avatarUrl && (
              <Button
                variant="ghost"
                // loading="lazy" = load the image only when it gets near the screen
                // { } in JSX = run JavaScript here and show its result
                // isPending = the request is running right now
                loading={remove.isPending}
                // onClick = what happens on click/tap
                // { } in JSX = run JavaScript here and show its result
                // => = an arrow function (a short function)
                // mutate = run the mutation (send the change)
                // onSuccess = runs after the request succeeded
                // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                onClick={() => remove.mutate(undefined, { onSuccess: () => notify.success(t('account.photoRemoved')) })}
              >
                {/* { } in JSX = run JavaScript here and show its result
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                {t('cart.remove')}
              </Button>
            )}
          </div>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <p className="text-xs text-slate-500">{t('account.photoHint', { mb: MAX_PHOTO_MB })}</p>
          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true
             className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          {localError && <p className="text-sm text-red-600">{localError}</p>}
          {/* { } in JSX = run JavaScript here and show its result
             isError = the request failed
             a || b = OR: a if it is truthy, else b
             a && b = AND; in JSX: show b only when a is true
             a ?? b = a, unless a is null/undefined, then b */}
          {(upload.isError || remove.isError) && <ErrorState error={upload.error ?? remove.error} />}
        </div>
      </div>
    </Section>
  );
}

// ------------------------------------------------------------------ Details

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function DetailsSection({ profile }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  const update = useUpdateProfile();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [form, setForm] = useState({
    name: profile.name,
    // a ?? b = a, unless a is null/undefined, then b
    phone: profile.phone ?? '',
    // a ?? b = a, unless a is null/undefined, then b
    dateOfBirth: profile.dateOfBirth ?? '',
  });

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const submit = (e) => {
    // preventDefault = stop the browser's default action (form submit reload, link follow)
    e.preventDefault();
    // Empty fields are sent as null = "remove it".
    // mutate = run the mutation (send the change)
    update.mutate(
      // .trim = remove spaces at both ends
      // a || b = OR: a if it is truthy, else b
      { name: form.name, phone: form.phone.trim() || null, dateOfBirth: form.dateOfBirth || null },
      // onSuccess = runs after the request succeeded
      // => = an arrow function (a short function)
      // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
      { onSuccess: () => notify.success(t('account.detailsSaved')) },
    );
  };

  // return = give this value back and stop the function here
  return (
    // { } in JSX = run JavaScript here and show its result
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    <Section title={t('account.details')} icon={UserIcon}>
      {/* <form> = groups inputs; Enter or a submit button sends it (onSubmit)
         onSubmit = runs when the form is sent (Enter or submit button)
         { } in JSX = run JavaScript here and show its result
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <form onSubmit={submit} className="space-y-3">
        {/* { } in JSX = run JavaScript here and show its result
           isError = the request failed
           a && b = AND; in JSX: show b only when a is true */}
        {update.isError && <ErrorState error={update.error} />}
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            label={t('auth.name')}
            name="name"
            // required = the browser won't submit the form while this is empty
            required
            // { } in JSX = run JavaScript here and show its result
            value={form.name}
            // onChange = runs on every change of an input
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            // ...x = spread: copy all items/properties of x into here
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            // autoComplete = tells the browser what to auto-fill (email, password, address...)
            autoComplete="name"
          />
          {/* Email is shown but not editable: changing the login email needs re-verification. */}
          <Input
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            label={t('auth.email')}
            name="email"
            // { } in JSX = run JavaScript here and show its result
            value={profile.email}
            // disabled = can't be clicked or typed in
            disabled
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="bg-slate-50 text-slate-500"
          />
          <Input
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            label={t('account.phoneOptional')}
            name="phone"
            // { } in JSX = run JavaScript here and show its result
            value={form.phone}
            // onChange = runs on every change of an input
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            // ...x = spread: copy all items/properties of x into here
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            // placeholder = grey hint text inside an empty input
            placeholder="+91 98765 43210"
            // autoComplete = tells the browser what to auto-fill (email, password, address...)
            autoComplete="tel"
          />
          <Input
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            label={t('account.birthdayOptional')}
            name="dateOfBirth"
            type="date"
            // { } in JSX = run JavaScript here and show its result
            value={form.dateOfBirth}
            // onChange = runs on every change of an input
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            // ...x = spread: copy all items/properties of x into here
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            // autoComplete = tells the browser what to auto-fill (email, password, address...)
            autoComplete="bday"
          />
        </div>
        {/* loading="lazy" = load the image only when it gets near the screen
           { } in JSX = run JavaScript here and show its result
           isPending = the request is running right now */}
        <Button type="submit" loading={update.isPending}>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('account.saveDetails')}
        </Button>
      </form>
    </Section>
  );
}

// ------------------------------------------------------------------ Address book

// ------------------------------------------------------------------ Password

// function Name() = a React component (capital letter): returns what to show (JSX)
function PasswordSection() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  const change = useChangePassword();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  // "Show passwords" checkbox: switches the inputs between type="password" and type="text"
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [show, setShow] = useState(false);
  // Checked in the browser for instant feedback; the server checks the real rules.
  // only complain once something was typed in "Confirm"
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
    change.mutate(
      { currentPassword: form.currentPassword, newPassword: form.newPassword },
      {
        // onSuccess = runs after the request succeeded
        // => = an arrow function (a short function)
        onSuccess: () => {
          setForm({ currentPassword: '', newPassword: '', confirm: '' });
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          notify.success(t('account.passwordChanged'));
        },
      },
    );
  };

  // return = give this value back and stop the function here
  return (
    // { } in JSX = run JavaScript here and show its result
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    <Section title={t('account.password')} icon={KeyRound}>
      {/* <form> = groups inputs; Enter or a submit button sends it (onSubmit)
         onSubmit = runs when the form is sent (Enter or submit button)
         { } in JSX = run JavaScript here and show its result
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <form onSubmit={submit} className="space-y-3">
        {/* { } in JSX = run JavaScript here and show its result
           isError = the request failed
           a && b = AND; in JSX: show b only when a is true */}
        {change.isError && <ErrorState error={change.error} />}
        <Input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          label={t('account.currentPassword')}
          name="currentPassword"
          // { } in JSX = run JavaScript here and show its result
          // a ? b : c = ternary: if a then b else c
          type={show ? 'text' : 'password'}
          // required = the browser won't submit the form while this is empty
          required
          // autoComplete = tells the browser what to auto-fill (email, password, address...)
          autoComplete="current-password"
          // { } in JSX = run JavaScript here and show its result
          value={form.currentPassword}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          // ...x = spread: copy all items/properties of x into here
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* autoComplete="new-password" lets the browser's password manager suggest a strong one */}
          <Input
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            label={t('auth.newPassword')}
            name="newPassword"
            // { } in JSX = run JavaScript here and show its result
            // a ? b : c = ternary: if a then b else c
            type={show ? 'text' : 'password'}
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
            // { } in JSX = run JavaScript here and show its result
            // a ? b : c = ternary: if a then b else c
            type={show ? 'text' : 'password'}
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
        </div>
        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true
           className = CSS classes (Tailwind) for this element (class is a JS keyword)
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {mismatch && <p className="text-sm text-red-600">{t('account.passwordsMismatch')}</p>}
        {/* <label> = the name of an input; clicking it focuses the input
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          {/* { } in JSX = run JavaScript here and show its result
             onChange = runs on every change of an input
             => = an arrow function (a short function) */}
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />{' '}
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('account.showPasswords')}
        </label>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <p className="text-xs text-slate-500">{t('account.passwordHint')}</p>
        {/* loading="lazy" = load the image only when it gets near the screen
           { } in JSX = run JavaScript here and show its result
           isPending = the request is running right now
           disabled = can't be clicked or typed in */}
        <Button type="submit" loading={change.isPending} disabled={mismatch}>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('account.changePassword')}
        </Button>
      </form>
    </Section>
  );
}

// The list of saved addresses (max 10) + "Add address".
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function AddressBook({ profile }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // true while the "new address" form is open
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [adding, setAdding] = useState(false);
  // const = a name for a value that is never reassigned
  const add = useAddAddress();

  // return = give this value back and stop the function here
  return (
    // { } in JSX = run JavaScript here and show its result
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    <Section title={t('account.addresses', { count: profile.addresses.length })} icon={MapPin}>
      {/* { } in JSX = run JavaScript here and show its result
         === = strictly equal (same value AND same type)
         ! = NOT: flips true/false
         a && b = AND; in JSX: show b only when a is true */}
      {profile.addresses.length === 0 && !adding && (
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        <p className="mb-3 text-sm text-slate-500">{t('account.noAddresses')}</p>
      )}
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <ul className="space-y-3">
        {/* { } in JSX = run JavaScript here and show its result
           .map = make a new array by transforming each item (in JSX: one element per item)
           => = an arrow function (a short function) */}
        {profile.addresses.map((a) => (
          // key = a stable id for list items so React can track them between redraws
          // { } in JSX = run JavaScript here and show its result
          <AddressRow key={a.id} address={a} />
        ))}
      </ul>

      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="mt-4">
        {/* { } in JSX = run JavaScript here and show its result
           a ? b : c = ternary: if a then b else c */}
        {adding ? (
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          <div className="rounded-lg border border-slate-200 p-4">
            <AddressForm
              // { } in JSX = run JavaScript here and show its result
              defaultName={profile.name}
              // { } in JSX = run JavaScript here and show its result
              defaultPhone={profile.phone}
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              submitLabel={t('account.saveAddress')}
              // { } in JSX = run JavaScript here and show its result
              // isPending = the request is running right now
              saving={add.isPending}
              // { } in JSX = run JavaScript here and show its result
              error={add.error}
              // onSubmit = runs when the form is sent (Enter or submit button)
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              onSubmit={(input) =>
                // mutate = run the mutation (send the change)
                add.mutate(input, {
                  // onSuccess = runs after the request succeeded
                  // => = an arrow function (a short function)
                  onSuccess: () => {
                    setAdding(false);
                    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                    notify.success(t('account.addressSaved'));
                  },
                })
              }
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              onCancel={() => setAdding(false)}
            />
          </div>
        ) : (
          // a && b = AND; in JSX: show b only when a is true
          profile.addresses.length < 10 && (
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            <Button variant="secondary" onClick={() => setAdding(true)}>
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <Plus className="size-4" /> {t('account.addAddress')}
            </Button>
          )
        )}
      </div>
    </Section>
  );
}

// One saved address: shown normally, or as the edit form when "Edit" is clicked.
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function AddressRow({ address }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // true while this address is shown as the edit form
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [editing, setEditing] = useState(false);
  // const = a name for a value that is never reassigned
  const update = useUpdateAddress();
  // const = a name for a value that is never reassigned
  const setDefault = useSetDefaultAddress();
  // const = a name for a value that is never reassigned
  const remove = useDeleteAddress();

  // if (...) = run the next part only when the condition is true
  if (editing) {
    // return = give this value back and stop the function here
    return (
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      <li className="rounded-lg border border-slate-200 p-4">
        <AddressForm
          // { } in JSX = run JavaScript here and show its result
          address={address}
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          submitLabel={t('account.saveChanges')}
          // { } in JSX = run JavaScript here and show its result
          // isPending = the request is running right now
          saving={update.isPending}
          // { } in JSX = run JavaScript here and show its result
          error={update.error}
          // onSubmit = runs when the form is sent (Enter or submit button)
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onSubmit={(input) =>
            // mutate = run the mutation (send the change)
            update.mutate(
              // ...x = spread: copy all items/properties of x into here
              { id: address.id, ...input },
              {
                // onSuccess = runs after the request succeeded
                // => = an arrow function (a short function)
                onSuccess: () => {
                  setEditing(false);
                  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                  notify.success(t('account.addressUpdated'));
                },
              },
            )
          }
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  // return = give this value back and stop the function here
  return (
    <li
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      // { } in JSX = run JavaScript here and show its result
      // `text ${x}` = a template string: text with values inserted
      // a ? b : c = ternary: if a then b else c
      className={`flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4 ${address.isDefault ? 'border-brand-500 bg-brand-50/40' : 'border-slate-200'}`}
    >
      <div>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="mb-1 flex items-center gap-2">
          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true */}
          {address.label && (
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            // { } in JSX = run JavaScript here and show its result
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{address.label}</span>
          )}
          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true */}
          {address.isDefault && (
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
              {/* { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              {t('address.default')}
            </span>
          )}
        </div>
        {/* { } in JSX = run JavaScript here and show its result */}
        <AddressLines address={address} />
        {/* { } in JSX = run JavaScript here and show its result
           isError = the request failed
           a || b = OR: a if it is truthy, else b
           a && b = AND; in JSX: show b only when a is true */}
        {(setDefault.isError || remove.isError) && (
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          <div className="mt-2">
            {/* { } in JSX = run JavaScript here and show its result
               a ?? b = a, unless a is null/undefined, then b */}
            <ErrorState error={setDefault.error ?? remove.error} />
          </div>
        )}
      </div>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex flex-wrap gap-1">
        {/* { } in JSX = run JavaScript here and show its result
           ! = NOT: flips true/false
           a && b = AND; in JSX: show b only when a is true */}
        {!address.isDefault && (
          <Button
            variant="ghost"
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="px-2 py-1 text-xs"
            // loading="lazy" = load the image only when it gets near the screen
            // { } in JSX = run JavaScript here and show its result
            // isPending = the request is running right now
            loading={setDefault.isPending}
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            // mutate = run the mutation (send the change)
            onClick={() => setDefault.mutate(address.id)}
          >
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('account.makeDefault')}
          </Button>
        )}
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           onClick = what happens on click/tap
           { } in JSX = run JavaScript here and show its result
           => = an arrow function (a short function) */}
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setEditing(true)}>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('account.edit')}
        </Button>
        <Button
          variant="ghost"
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          // loading="lazy" = load the image only when it gets near the screen
          // { } in JSX = run JavaScript here and show its result
          // isPending = the request is running right now
          loading={remove.isPending}
          // onClick = what happens on click/tap
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onClick={() => {
            // if (...) = run the next part only when the condition is true
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            if (confirm(t('account.confirmDeleteAddress')))
              // mutate = run the mutation (send the change)
              // onSuccess = runs after the request succeeded
              // => = an arrow function (a short function)
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              remove.mutate(address.id, { onSuccess: () => notify.success(t('account.addressDeleted')) });
          }}
        >
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <Trash2 className="size-3.5" /> {t('account.delete')}
        </Button>
      </div>
    </li>
  );
}
