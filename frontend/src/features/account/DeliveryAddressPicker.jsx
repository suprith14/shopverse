// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
// useState = a value the component remembers; calling its setter redraws the component
import { useEffect, useState } from 'react';
// import = bring in code from another file or package
import { Plus } from 'lucide-react';
// import = bring in code from another file or package
import { Spinner } from '@/components/ui/States';
// import = bring in code from another file or package
import { AddressForm } from './AddressForm';
// import = bring in code from another file or package
import { AddressLines } from './AddressCard';
// import = bring in code from another file or package
import { useAddAddress, useProfile } from './account.api';

// "Deliver to" at checkout: pick a saved address (the default is pre-selected) or add one.
// Only the chosen address id goes to the backend, which copies the address into the order.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// onChange = runs on every change of an input
export function DeliveryAddressPicker({ value, onChange }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // isLoading = first load, no data yet
  const { data: profile, isLoading } = useProfile();
  // const = a name for a value that is never reassigned
  const add = useAddAddress();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [adding, setAdding] = useState(false);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [showAll, setShowAll] = useState(false);

  // Pre-select the default address once the profile loads (or if the chosen one was deleted).
  // Pick an address automatically: the default one, or again if the chosen one was deleted
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // return = give this value back and stop the function here
    if (!profile) return;
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // a || b = OR: a if it is truthy, else b
    // .some = true if at least one item passes the test
    // => = an arrow function (a short function)
    // === = strictly equal (same value AND same type)
    // onChange = runs on every change of an input
    if (!value || !profile.addresses.some((a) => a.id === value)) onChange(profile.defaultAddressId);
  // onChange = runs on every change of an input
  }, [profile, value, onChange]);

  // if (...) = run the next part only when the condition is true
  // isLoading = first load, no data yet
  // a || b = OR: a if it is truthy, else b
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  // { } in JSX = run JavaScript here and show its result
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  if (isLoading || !profile) return <Spinner label={t('address.loading')} />;

  // const = a name for a value that is never reassigned
  // .find = the first item that passes a test (or undefined)
  // => = an arrow function (a short function)
  // === = strictly equal (same value AND same type)
  const selected = profile.addresses.find((a) => a.id === value);
  // const = a name for a value that is never reassigned
  // === = strictly equal (same value AND same type)
  const noAddresses = profile.addresses.length === 0;

  // No address yet, or "add new" clicked: show the form. A new address becomes the choice.
  // No saved address (or "Add a new address" clicked): show the address form right here
  // if (...) = run the next part only when the condition is true
  // a || b = OR: a if it is truthy, else b
  if (noAddresses || adding) {
    // return = give this value back and stop the function here
    return (
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      <div className="space-y-2">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           a ? b : c = ternary: if a then b else c
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <p className="text-sm font-medium">{noAddresses ? t('address.whereToDeliver') : t('address.new')}</p>
        <AddressForm
          // { } in JSX = run JavaScript here and show its result
          defaultName={profile.name}
          // { } in JSX = run JavaScript here and show its result
          defaultPhone={profile.phone}
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          submitLabel={t('address.useThis')}
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
              onSuccess: (p) => {
                // The new address is the one whose id wasn't in the list before.
                // const = a name for a value that is never reassigned
                // new = create an object from a class (e.g. new Date())
                // Set = a collection of unique values with fast .has() lookup
                // .map = make a new array by transforming each item (in JSX: one element per item)
                // => = an arrow function (a short function)
                const before = new Set(profile.addresses.map((a) => a.id));
                // the new address = the one that wasn't there before saving; select it
                // const = a name for a value that is never reassigned
                // .find = the first item that passes a test (or undefined)
                // => = an arrow function (a short function)
                // ! = NOT: flips true/false
                const created = p.addresses.find((a) => !before.has(a.id));
                // onChange = runs on every change of an input
                // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
                // a ?? b = a, unless a is null/undefined, then b
                onChange(created?.id ?? p.defaultAddressId);
                setAdding(false);
              },
            })
          }
          // { } in JSX = run JavaScript here and show its result
          // a ? b : c = ternary: if a then b else c
          // => = an arrow function (a short function)
          onCancel={noAddresses ? undefined : () => setAdding(false)}
        />
      </div>
    );
  }

  // Collapsed: show the chosen address with a "Change" link (like most stores).
  // Normal case: show just the chosen address with a "Change" link
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // a && b = AND; in JSX: show b only when a is true
  if (!showAll && selected) {
    // return = give this value back and stop the function here
    return (
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      <div className="space-y-2">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="flex items-center justify-between">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <p className="text-sm font-medium">{t('address.deliverTo')}</p>
          {/* onClick = what happens on click/tap
             { } in JSX = run JavaScript here and show its result
             => = an arrow function (a short function)
             className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <button onClick={() => setShowAll(true)} className="text-sm text-brand-600 dark:text-brand-300 hover:underline">
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('address.change')}
          </button>
        </div>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="rounded-lg border border-slate-200 p-3">
          {/* { } in JSX = run JavaScript here and show its result */}
          <AddressLines address={selected} />
        </div>
      </div>
    );
  }

  // return = give this value back and stop the function here
  return (
    // <fieldset> = a group of related form fields (with a <legend> title)
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <fieldset className="space-y-2">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result
         t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
      <legend className="mb-1 text-sm font-medium">{t('address.deliverTo')}</legend>
      {/* { } in JSX = run JavaScript here and show its result
         .map = make a new array by transforming each item (in JSX: one element per item)
         => = an arrow function (a short function) */}
      {profile.addresses.map((a) => (
        // <label> = the name of an input; clicking it focuses the input
        <label
          // key = a stable id for list items so React can track them between redraws
          // { } in JSX = run JavaScript here and show its result
          key={a.id}
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          // { } in JSX = run JavaScript here and show its result
          // `text ${x}` = a template string: text with values inserted
          // a ? b : c = ternary: if a then b else c
          // === = strictly equal (same value AND same type)
          className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${a.id === value ? 'border-brand-500 bg-brand-50/40' : 'border-slate-200'}`}
        >
          <input
            type="radio"
            name="delivery-address"
            // { } in JSX = run JavaScript here and show its result
            // === = strictly equal (same value AND same type)
            checked={a.id === value}
            // onChange = runs on every change of an input
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            onChange={() => {
              // onChange = runs on every change of an input
              onChange(a.id);
              setShowAll(false);
            }}
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="mt-1"
          />
          <div>
            {/* { } in JSX = run JavaScript here and show its result
               a || b = OR: a if it is truthy, else b
               a && b = AND; in JSX: show b only when a is true */}
            {(a.label || a.isDefault) && (
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {/* { } in JSX = run JavaScript here and show its result */}
                {a.label}
                {/* { } in JSX = run JavaScript here and show its result
                   a && b = AND; in JSX: show b only when a is true */}
                {a.label && a.isDefault && ' · '}
                {/* { } in JSX = run JavaScript here and show its result
                   a && b = AND; in JSX: show b only when a is true
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                {a.isDefault && t('address.default')}
              </p>
            )}
            {/* { } in JSX = run JavaScript here and show its result */}
            <AddressLines address={a} />
          </div>
        </label>
      ))}
      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true */}
      {profile.addresses.length < 10 && (
        <button
          // onClick = what happens on click/tap
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onClick={() => setAdding(true)}
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-300 hover:underline"
        >
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <Plus className="size-4" /> {t('address.addNew')}
        </button>
      )}
    </fieldset>
  );
}
