// import = bring in code from another file or package
import { AlertCircle, Loader2 } from 'lucide-react';

// Reusable loading / error / empty states, so every page handles them the same way.

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// x = value (in parameters) = the default used when x is not given
export function Spinner({ label = 'Loading...' }) {
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <Loader2 className="size-5 animate-spin" /> {label}
    </div>
  );
}

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function ErrorState({ message }) {
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  if (!message) return null; // e.g. a server error: the popup shows it instead
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <AlertCircle className="size-4 shrink-0" /> {message}
    </div>
  );
}

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function EmptyState({ title, hint }) {
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <p className="font-medium text-slate-700">{title}</p>
      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
