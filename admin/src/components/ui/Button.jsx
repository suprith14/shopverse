// import = bring in code from another file or package
import { Loader2 } from 'lucide-react';

// const = a name for a value that is never reassigned
const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-500/60',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-50',
  ghost: 'text-slate-700 hover:bg-slate-100 disabled:opacity-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
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
