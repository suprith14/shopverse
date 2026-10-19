// A labelled text input used by every form (login, address, account...).
// Clicking the label focuses the input because they share an id (taken from `name` if no id is given).
// Any other prop (type, value, onChange, required, autoComplete...) is passed straight to <input>.

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// x = value (in parameters) = the default used when x is not given
// ...rest = collect the remaining items/properties
export function Input({ label, id, className = '', ...rest }) {
  // label and input must share an id for screen readers and click-to-focus
  // const = a name for a value that is never reassigned
  // a ?? b = a, unless a is null/undefined, then b
  const inputId = id ?? rest.name;
  // return = give this value back and stop the function here
  return (
    // <label> = the name of an input; clicking it focuses the input
    // htmlFor = which input this label belongs to (for in HTML)
    // { } in JSX = run JavaScript here and show its result
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <label htmlFor={inputId} className="block">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        // { } in JSX = run JavaScript here and show its result
        id={inputId}
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        // { } in JSX = run JavaScript here and show its result
        // `text ${x}` = a template string: text with values inserted
        className={`w-full rounded-lg border border-slate-300 bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
        // everything else the caller passed: value, onChange, type, required...
        // {...rest} = pass all the other props on to this element
        {...rest}
      />
    </label>
  );
}
