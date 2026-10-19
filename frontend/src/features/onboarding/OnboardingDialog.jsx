// import = bring in code from another file or package
// Trans = a translated sentence with elements (links, bold) inside it; <0> = the first element
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { Trans, useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
// useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
// useState = a value the component remembers; calling its setter redraws the component
import { useEffect, useRef, useState } from 'react';
// import = bring in code from another file or package
// useNavigate = gives navigate(url) to change page from code
import { useNavigate } from 'react-router';
// import = bring in code from another file or package
import { Cake, Camera, MapPin, Phone, X } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { PhotoPicker } from '@/components/ui/PhotoPicker';
// import = bring in code from another file or package
import { Input } from '@/components/ui/Input';
// import = bring in code from another file or package
import { ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { notify } from '@/lib/notify';
// import = bring in code from another file or package
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/features/account/account.api';
// import = bring in code from another file or package
import { useOnboardingStore } from './onboarding.store';

// const = a name for a value that is never reassigned
const STEPS = ['photo', 'phone', 'birthday', 'address']; // keys in onboarding.steps.* (i18n)
// const = a name for a value that is never reassigned
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// const = a name for a value that is never reassigned
const MAX_PHOTO_MB = 5;

// "Set up your profile" wizard, shown once after sign-up.
//  - 4 small steps instead of one long form, each skippable.
//  - Every step SAVES on "Next", so closing half-way keeps what was entered.
//  - Built on the browser's <dialog>: showModal() keeps keyboard focus inside, Esc closes it,
//    and screen readers announce it as a dialog. No library needed.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function OnboardingDialog() {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const open = useOnboardingStore((s) => s.open);
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const finish = useOnboardingStore((s) => s.finish);
  // const = a name for a value that is never reassigned
  // useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
  const dialogRef = useRef(null);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [step, setStep] = useState(0);
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { data: profile } = useProfile();

  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // const = a name for a value that is never reassigned
    const dialog = dialogRef.current;
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // return = give this value back and stop the function here
    if (!dialog) return;
    // if (...) = run the next part only when the condition is true
    // a && b = AND; in JSX: show b only when a is true
    // ! = NOT: flips true/false
    if (open && !dialog.open) {
      setStep(0);
      // showModal = open a <dialog> as a modal (dims the page, traps focus)
      dialog.showModal();
    }
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // a && b = AND; in JSX: show b only when a is true
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Move between steps without going past the first or the last
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // Math = number helpers (min, max, round, floor...)
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // Math = number helpers (min, max, round, floor...)
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // return = give this value back and stop the function here
  return (
    // onClose fires for Esc too, which counts as "skip the rest".
    // <dialog> = the browser's built-in popup (focus trap, Esc to close)
    <dialog
      // ref = after drawing, put this element into a useRef box (.current)
      // { } in JSX = run JavaScript here and show its result
      ref={dialogRef}
      // onClose = runs when the dialog closes
      // { } in JSX = run JavaScript here and show its result
      onClose={finish}
      // aria-labelledby = the element (by id) that names this one
      aria-labelledby="onboarding-title"
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      className="bg-surface text-slate-900 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 shadow-xl backdrop:bg-night/60"
    >
      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true */}
      {open && profile && (
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <div className="p-6">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <h2 id="onboarding-title" className="text-lg font-bold">
                {/* { } in JSX = run JavaScript here and show its result
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                   .split = cut a string into an array */}
                {t('onboarding.welcome', { name: profile.name.split(' ')[0] })}
              </h2>
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <p className="text-sm text-slate-500">{t('onboarding.intro')}</p>
            </div>
            <button
              // onClick = what happens on click/tap
              // { } in JSX = run JavaScript here and show its result
              onClick={finish}
              // aria-label = the name screen readers read for this element
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              aria-label={t('common.close')}
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <X className="size-5" />
            </button>
          </div>

          {/* Progress: "Step 2 of 4" in words and as a bar */}
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <p className="mt-5 text-xs font-medium text-slate-500">
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('onboarding.progress', {
              step: step + 1,
              total: STEPS.length,
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              // `text ${x}` = a template string: text with values inserted
              // obj[key] = read the property whose name is stored in key
              name: t(`onboarding.steps.${STEPS[step]}`),
            })}
          </p>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             aria-hidden = screen readers skip this (decoration) */}
          <div className="mt-1.5 flex gap-1.5" aria-hidden>
            {/* { } in JSX = run JavaScript here and show its result
               .map = make a new array by transforming each item (in JSX: one element per item)
               => = an arrow function (a short function) */}
            {STEPS.map((s, i) => (
              // key = a stable id for list items so React can track them between redraws
              // { } in JSX = run JavaScript here and show its result
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              // `text ${x}` = a template string: text with values inserted
              // a ? b : c = ternary: if a then b else c
              <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />
            ))}
          </div>

          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="mt-6">
            {/* { } in JSX = run JavaScript here and show its result
               === = strictly equal (same value AND same type)
               a && b = AND; in JSX: show b only when a is true */}
            {step === 0 && <PhotoStep avatarUrl={profile.avatarUrl} initial={profile.name.charAt(0)} onNext={next} />}
            {/* { } in JSX = run JavaScript here and show its result
               === = strictly equal (same value AND same type)
               a && b = AND; in JSX: show b only when a is true */}
            {step === 1 && <PhoneStep initial={profile.phone} onNext={next} onBack={back} />}
            {/* { } in JSX = run JavaScript here and show its result
               === = strictly equal (same value AND same type)
               a && b = AND; in JSX: show b only when a is true */}
            {step === 2 && <BirthdayStep initial={profile.dateOfBirth} onNext={next} onBack={back} />}
            {/* { } in JSX = run JavaScript here and show its result
               === = strictly equal (same value AND same type)
               a && b = AND; in JSX: show b only when a is true */}
            {step === 3 && <AddressStep onBack={back} />}
          </div>
        </div>
      )}
    </dialog>
  );
}

// The buttons at the bottom of each step: Back on the left, Skip + the step's main button on the right
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// children = whatever is written between this component's opening and closing tags
function StepFooter({ onBack, onSkip, children }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="mt-6 flex items-center gap-2">
      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true */}
      {onBack && (
        // onClick = what happens on click/tap
        // { } in JSX = run JavaScript here and show its result
        <Button type="button" variant="ghost" onClick={onBack}>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('onboarding.back')}
        </Button>
      )}
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="ml-auto flex gap-2">
        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true */}
        {onSkip && (
          // onClick = what happens on click/tap
          // { } in JSX = run JavaScript here and show its result
          <Button type="button" variant="ghost" onClick={onSkip}>
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('onboarding.skip')}
          </Button>
        )}
        {/* { } in JSX = run JavaScript here and show its result
           children = whatever is written between this component's opening and closing tags */}
        {children}
      </div>
    </div>
  );
}

// Icon + title + one line of explanation at the top of each step
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function StepIntro({ icon: Icon, title, text }) {
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="mb-4 flex gap-3">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:text-brand-300">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Icon className="size-5" />
      </span>
      <div>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result */}
        <h3 className="font-semibold">{title}</h3>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result */}
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ 1. Photo

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function PhotoStep({ avatarUrl, initial, onNext }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  const upload = useUploadAvatar();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [localError, setLocalError] = useState(null);

  // Uploads as soon as a photo is picked, so "Next" just moves on.
  // From the camera or a file: the same checks either way
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
    upload.mutate(file);
  };

  // return = give this value back and stop the function here
  return (
    // <> </> = a fragment: groups elements without adding an extra HTML element
    <>
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <StepIntro icon={Camera} title={t('onboarding.photoTitle')} text={t('onboarding.photoText')} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex flex-col items-center gap-3">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="size-24 overflow-hidden rounded-full bg-slate-100">
          {/* { } in JSX = run JavaScript here and show its result
             a ? b : c = ternary: if a then b else c */}
          {avatarUrl ? (
            // { } in JSX = run JavaScript here and show its result
            // alt = text describing the image for screen readers (empty = decorative)
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <img src={avatarUrl} alt={t('account.photoAlt')} className="size-full object-cover" />
          ) : (
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <div className="flex size-full items-center justify-center text-3xl font-semibold text-slate-400">
              {/* { } in JSX = run JavaScript here and show its result */}
              {initial.toUpperCase()}
            </div>
          )}
        </div>
        {/* { } in JSX = run JavaScript here and show its result
           accept = which file types the file picker shows
           .join = turn an array into one string with a separator
           loading="lazy" = load the image only when it gets near the screen
           isPending = the request is running right now */}
        <PhotoPicker onFile={onPick} accept={PHOTO_TYPES.join(',')} loading={upload.isPending} />
        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        {localError && <p className="text-sm text-red-600">{localError}</p>}
        {/* { } in JSX = run JavaScript here and show its result
           isError = the request failed
           a && b = AND; in JSX: show b only when a is true */}
        {upload.isError && <ErrorState error={upload.error} />}
      </div>
      {/* { } in JSX = run JavaScript here and show its result
         a ? b : c = ternary: if a then b else c */}
      <StepFooter onSkip={avatarUrl ? undefined : onNext}>
        {/* onClick = what happens on click/tap
           { } in JSX = run JavaScript here and show its result
           disabled = can't be clicked or typed in
           isPending = the request is running right now */}
        <Button onClick={onNext} disabled={upload.isPending}>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('onboarding.next')}
        </Button>
      </StepFooter>
    </>
  );
}

// ------------------------------------------------------------------ 2. Mobile number

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function PhoneStep({ initial, onNext, onBack }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  // a ?? b = a, unless a is null/undefined, then b
  const [phone, setPhone] = useState(initial ?? '');
  // const = a name for a value that is never reassigned
  const update = useUpdateProfile();

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const submit = (e) => {
    // preventDefault = stop the browser's default action (form submit reload, link follow)
    e.preventDefault();
    // left empty = skipped: nothing to save
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // .trim = remove spaces at both ends
    // return = give this value back and stop the function here
    if (!phone.trim()) return onNext();
    // The backend cleans it up ("+91 98765-43210" -> "+919876543210") and explains bad formats.
    // mutate = run the mutation (send the change)
    // .trim = remove spaces at both ends
    // onSuccess = runs after the request succeeded
    update.mutate({ phone: phone.trim() }, { onSuccess: onNext });
  };

  // return = give this value back and stop the function here
  return (
    // <form> = groups inputs; Enter or a submit button sends it (onSubmit)
    // onSubmit = runs when the form is sent (Enter or submit button)
    // { } in JSX = run JavaScript here and show its result
    <form onSubmit={submit}>
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <StepIntro icon={Phone} title={t('onboarding.phoneTitle')} text={t('onboarding.phoneText')} />
      {/* { } in JSX = run JavaScript here and show its result
         isError = the request failed
         a && b = AND; in JSX: show b only when a is true */}
      {update.isError && (
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <div className="mb-3">
          {/* { } in JSX = run JavaScript here and show its result */}
          <ErrorState error={update.error} />
        </div>
      )}
      <Input
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        label={t('onboarding.steps.phone')}
        name="phone"
        type="tel"
        // { } in JSX = run JavaScript here and show its result
        value={phone}
        // onChange = runs on every change of an input
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        onChange={(e) => setPhone(e.target.value)}
        // placeholder = grey hint text inside an empty input
        placeholder="+91 98765 43210"
        // autoComplete = tells the browser what to auto-fill (email, password, address...)
        autoComplete="tel"
        // autoFocus = put the cursor here when it appears
        autoFocus
      />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <p className="mt-1 text-xs text-slate-500">{t('onboarding.phoneHint')}</p>
      {/* { } in JSX = run JavaScript here and show its result */}
      <StepFooter onBack={onBack} onSkip={onNext}>
        {/* loading="lazy" = load the image only when it gets near the screen
           { } in JSX = run JavaScript here and show its result
           isPending = the request is running right now */}
        <Button type="submit" loading={update.isPending}>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('onboarding.next')}
        </Button>
      </StepFooter>
    </form>
  );
}

// ------------------------------------------------------------------ 3. Date of birth

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function BirthdayStep({ initial, onNext, onBack }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  // a ?? b = a, unless a is null/undefined, then b
  const [date, setDate] = useState(initial ?? '');
  // const = a name for a value that is never reassigned
  const update = useUpdateProfile();

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const submit = (e) => {
    // preventDefault = stop the browser's default action (form submit reload, link follow)
    e.preventDefault();
    // left empty = skipped: nothing to save
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // return = give this value back and stop the function here
    if (!date) return onNext();
    // mutate = run the mutation (send the change)
    // onSuccess = runs after the request succeeded
    update.mutate({ dateOfBirth: date }, { onSuccess: onNext }); // backend checks it's a real date and age 13+
  };

  // return = give this value back and stop the function here
  return (
    // <form> = groups inputs; Enter or a submit button sends it (onSubmit)
    // onSubmit = runs when the form is sent (Enter or submit button)
    // { } in JSX = run JavaScript here and show its result
    <form onSubmit={submit}>
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <StepIntro icon={Cake} title={t('onboarding.birthdayTitle')} text={t('onboarding.birthdayText')} />
      {/* { } in JSX = run JavaScript here and show its result
         isError = the request failed
         a && b = AND; in JSX: show b only when a is true */}
      {update.isError && (
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <div className="mb-3">
          {/* { } in JSX = run JavaScript here and show its result */}
          <ErrorState error={update.error} />
        </div>
      )}
      <Input
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        label={t('onboarding.steps.birthday')}
        name="dateOfBirth"
        type="date"
        // { } in JSX = run JavaScript here and show its result
        value={date}
        // onChange = runs on every change of an input
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        onChange={(e) => setDate(e.target.value)}
        // no birthdays in the future (today as YYYY-MM-DD)
        // { } in JSX = run JavaScript here and show its result
        // new = create an object from a class (e.g. new Date())
        // Date = a point in time
        // .slice = a copy of part of an array/string
        max={new Date().toISOString().slice(0, 10)}
        // autoComplete = tells the browser what to auto-fill (email, password, address...)
        autoComplete="bday"
      />
      {/* { } in JSX = run JavaScript here and show its result */}
      <StepFooter onBack={onBack} onSkip={onNext}>
        {/* loading="lazy" = load the image only when it gets near the screen
           { } in JSX = run JavaScript here and show its result
           isPending = the request is running right now */}
        <Button type="submit" loading={update.isPending}>
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('onboarding.next')}
        </Button>
      </StepFooter>
    </form>
  );
}

// ------------------------------------------------------------------ 4. Address (info)

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function AddressStep({ onBack }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const finish = useOnboardingStore((s) => s.finish);
  // const = a name for a value that is never reassigned
  // useNavigate = gives navigate(url) to change page from code
  const navigate = useNavigate();

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const done = () => {
    finish();
    // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
    notify.success(t('onboarding.finished'));
  };

  // return = give this value back and stop the function here
  return (
    // <> </> = a fragment: groups elements without adding an extra HTML element
    <>
      {/* { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <StepIntro icon={MapPin} title={t('onboarding.addressTitle')} text={t('onboarding.addressText')} />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="rounded-lg bg-brand-50 p-4 text-sm text-brand-800 dark:text-brand-300">
        {/* Trans = a translated sentence with elements (links, bold) inside it; <0> = the first element
           { } in JSX = run JavaScript here and show its result
           key = a stable id for list items so React can track them between redraws */}
        <Trans i18nKey="onboarding.whereToFind" components={[<b key="where" />]} />
      </div>
      {/* { } in JSX = run JavaScript here and show its result */}
      <StepFooter onBack={onBack}>
        <Button
          variant="secondary"
          // onClick = what happens on click/tap
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onClick={() => {
            done();
            navigate('/account');
          }}
        >
          {/* { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          {t('onboarding.addNow')}
        </Button>
        {/* onClick = what happens on click/tap
           { } in JSX = run JavaScript here and show its result
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <Button onClick={done}>{t('onboarding.done')}</Button>
      </StepFooter>
    </>
  );
}
