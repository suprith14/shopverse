// The one button style for the whole store, in three looks (variants).
// <Button loading> shows a spinner and disables itself, so a form can't be sent twice.

// import = bring in code from another file or package
import { Loader2 } from 'lucide-react';

// Tailwind classes per look. bg-surface / slate colours switch in dark mode by themselves
// (they're design tokens, see index.css).
// const = a name for a value that is never reassigned
const variants = {
  // the main action on a screen (Add to cart, Log in)
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-500/60',
  // less important actions (Cancel, Apply price)
  secondary: 'border border-slate-300 bg-surface text-slate-800 hover:bg-slate-50',
  // quiet text-like buttons (Edit, Clear all filters)
  ghost: 'text-slate-700 hover:bg-slate-100',
};

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// x = value (in parameters) = the default used when x is not given
// children = whatever is written between this component's opening and closing tags
// ...rest = collect the remaining items/properties
export function Button({ variant = 'primary', loading, className = '', children, disabled, ...rest }) {
  // return = give this value back and stop the function here
  return (
    <button
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      // { } in JSX = run JavaScript here and show its result
      // `text ${x}` = a template string: text with values inserted
      // obj[key] = read the property whose name is stored in key
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      // no double submits while a request is running
      // disabled = can't be clicked or typed in
      // { } in JSX = run JavaScript here and show its result
      // a || b = OR: a if it is truthy, else b
      disabled={disabled || loading}
      // {...rest} = pass all the other props on to this element
      {...rest}
    >
      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      {loading && <Loader2 className="size-4 animate-spin" />}
      {/* { } in JSX = run JavaScript here and show its result
         children = whatever is written between this component's opening and closing tags */}
      {children}
    </button>
  );
}
