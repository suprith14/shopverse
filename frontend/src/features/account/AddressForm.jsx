// The address form (receiver, phone, address lines, city, state, postcode, country, label).
// Used to add/edit addresses on My account and to add one during checkout. It only collects
// the fields: the parent decides what saving means (onSubmit) and shows saving/errors.

// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useState = a value the component remembers; calling its setter redraws the component
import { useState } from 'react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { Input } from '@/components/ui/Input';
// import = bring in code from another file or package
import { ErrorState } from '@/components/ui/States';
// import = bring in code from another file or package
import { COUNTRIES, countryName } from './countries';

// Add / edit an address. Used on the "My account" page and at checkout.
// Validation messages come from the backend (e.g. "Postcode should look like 560001").
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// onSubmit = runs when the form is sent (Enter or submit button)
export function AddressForm({ address, defaultName, defaultPhone, saving, error, submitLabel, onSubmit, onCancel }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // Start from the address being edited, or empty (name/phone prefilled from the profile)
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [form, setForm] = useState({
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    label: address?.label ?? '',
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    fullName: address?.fullName ?? defaultName ?? '',
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    phone: address?.phone ?? defaultPhone ?? '',
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    line1: address?.line1 ?? '',
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    line2: address?.line2 ?? '',
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    city: address?.city ?? '',
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    state: address?.state ?? '',
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    postalCode: address?.postalCode ?? '',
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // a ?? b = a, unless a is null/undefined, then b
    country: address?.country ?? 'IN',
  });
  // set({ city: 'Mysuru' }) changes one field and keeps the rest
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // ...x = spread: copy all items/properties of x into here
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const submit = (e) => {
    // preventDefault = stop the browser's default action (form submit reload, link follow)
    e.preventDefault();
    // empty optional fields are sent as null, not ""
    // onSubmit = runs when the form is sent (Enter or submit button)
    // ...x = spread: copy all items/properties of x into here
    // .trim = remove spaces at both ends
    // a || b = OR: a if it is truthy, else b
    onSubmit({ ...form, label: form.label.trim() || null, line2: form.line2.trim() || null });
  };

  // return = give this value back and stop the function here
  return (
    // <form> = groups inputs; Enter or a submit button sends it (onSubmit)
    // onSubmit = runs when the form is sent (Enter or submit button)
    // { } in JSX = run JavaScript here and show its result
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <form onSubmit={submit} className="space-y-3">
      {/* { } in JSX = run JavaScript here and show its result
         !!x = turn any value into true/false
         ! = NOT: flips true/false
         a && b = AND; in JSX: show b only when a is true */}
      {!!error && <ErrorState error={error} />}
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          label={t('address.fullName')}
          name="fullName"
          // required = the browser won't submit the form while this is empty
          required
          // { } in JSX = run JavaScript here and show its result
          value={form.fullName}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onChange={(e) => set({ fullName: e.target.value })}
          // autoComplete = tells the browser what to auto-fill (email, password, address...)
          autoComplete="name"
        />
        <Input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          label={t('address.phone')}
          name="phone"
          // required = the browser won't submit the form while this is empty
          required
          // { } in JSX = run JavaScript here and show its result
          value={form.phone}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onChange={(e) => set({ phone: e.target.value })}
          // placeholder = grey hint text inside an empty input
          placeholder="+91 98765 43210"
          // autoComplete = tells the browser what to auto-fill (email, password, address...)
          autoComplete="tel"
        />
      </div>
      <Input
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        label={t('address.line1')}
        name="line1"
        // required = the browser won't submit the form while this is empty
        required
        // { } in JSX = run JavaScript here and show its result
        value={form.line1}
        // onChange = runs on every change of an input
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        onChange={(e) => set({ line1: e.target.value })}
        // placeholder = grey hint text inside an empty input
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        placeholder={t('address.line1Placeholder')}
        // autoComplete lets the browser fill the whole address in one tap
        // autoComplete = tells the browser what to auto-fill (email, password, address...)
        autoComplete="address-line1"
      />
      <Input
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        label={t('address.line2')}
        name="line2"
        // { } in JSX = run JavaScript here and show its result
        value={form.line2}
        // onChange = runs on every change of an input
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        onChange={(e) => set({ line2: e.target.value })}
        // placeholder = grey hint text inside an empty input
        // { } in JSX = run JavaScript here and show its result
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        placeholder={t('address.line2Placeholder')}
        // autoComplete = tells the browser what to auto-fill (email, password, address...)
        autoComplete="address-line2"
      />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          label={t('address.city')}
          name="city"
          // required = the browser won't submit the form while this is empty
          required
          // { } in JSX = run JavaScript here and show its result
          value={form.city}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onChange={(e) => set({ city: e.target.value })}
          // autoComplete = tells the browser what to auto-fill (email, password, address...)
          autoComplete="address-level2"
        />
        <Input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          label={t('address.state')}
          name="state"
          // required = the browser won't submit the form while this is empty
          required
          // { } in JSX = run JavaScript here and show its result
          value={form.state}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onChange={(e) => set({ state: e.target.value })}
          // autoComplete = tells the browser what to auto-fill (email, password, address...)
          autoComplete="address-level1"
        />
        <Input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          label={t('address.postalCode')}
          name="postalCode"
          // required = the browser won't submit the form while this is empty
          required
          // { } in JSX = run JavaScript here and show its result
          value={form.postalCode}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onChange={(e) => set({ postalCode: e.target.value })}
          // autoComplete = tells the browser what to auto-fill (email, password, address...)
          autoComplete="postal-code"
        />
      </div>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* <label> = the name of an input; clicking it focuses the input
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <label className="block">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             { } in JSX = run JavaScript here and show its result
             t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
          <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('address.country')}</span>
          {/* <select> = a dropdown list */}
          <select
            // { } in JSX = run JavaScript here and show its result
            value={form.country}
            // onChange = runs on every change of an input
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            onChange={(e) => set({ country: e.target.value })}
            // autoComplete = tells the browser what to auto-fill (email, password, address...)
            autoComplete="country"
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="w-full rounded-lg border border-slate-300 bg-surface px-3 py-2.5 text-sm"
          >
            {/* { } in JSX = run JavaScript here and show its result
               .map = make a new array by transforming each item (in JSX: one element per item)
               => = an arrow function (a short function) */}
            {COUNTRIES.map((c) => (
              // key = a stable id for list items so React can track them between redraws
              // { } in JSX = run JavaScript here and show its result
              <option key={c.code} value={c.code}>
                {/* { } in JSX = run JavaScript here and show its result */}
                {countryName(c.code)}
              </option>
            ))}
          </select>
        </label>
        <Input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          label={t('address.label')}
          name="label"
          // { } in JSX = run JavaScript here and show its result
          value={form.label}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onChange={(e) => set({ label: e.target.value })}
          // placeholder = grey hint text inside an empty input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          placeholder={t('address.labelPlaceholder')}
        />
      </div>
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="flex gap-2">
        {/* loading="lazy" = load the image only when it gets near the screen
           { } in JSX = run JavaScript here and show its result */}
        <Button type="submit" loading={saving}>
          {/* { } in JSX = run JavaScript here and show its result */}
          {submitLabel}
        </Button>
        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true */}
        {onCancel && (
          // onClick = what happens on click/tap
          // { } in JSX = run JavaScript here and show its result
          <Button type="button" variant="ghost" onClick={onCancel}>
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}
