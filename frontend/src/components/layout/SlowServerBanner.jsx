// import = bring in code from another file or package
import { Loader2 } from 'lucide-react';
// import = bring in code from another file or package
import { useNetworkStatus } from '@/lib/network-status';
// import = bring in code from another file or package
import { useSiteContent } from '@/content/use-site-content';

// Shown while a request has taken more than a few seconds. On the free hosting plan the
// API sleeps when nobody uses it, and the first visit wakes it up. Saying so (instead of an
// endless spinner) keeps visitors from thinking the site is broken.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function SlowServerBanner() {
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const slow = useNetworkStatus((s) => s.slow);
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  const { notices } = useSiteContent();
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  if (!slow) return null;
  // return = give this value back and stop the function here
  return (
    <div
      // role = tells screen readers what this element is (status, tab, group...)
      role="status"
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900"
    >
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         aria-hidden = screen readers skip this (decoration) */}
      <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
      {/* { } in JSX = run JavaScript here and show its result */}
      {notices.slowServer}
    </div>
  );
}
