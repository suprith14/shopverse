// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
// useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
// useState = a value the component remembers; calling its setter redraws the component
import { useEffect, useRef, useState } from 'react';
// import = bring in code from another file or package
import { ServerCrash } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';
// import = bring in code from another file or package
import { dismissServerError, useServerErrorOpen } from '@/lib/server-error';

// const = a name for a value that is never reassigned
const WAIT_SECONDS = 5;

// Opens when any request fails with a 5xx (see lib/server-error.js).
// "Retry" is enabled after 5 seconds and reloads the page. Why wait? Most server errors on our
// hosting are short: a restart, a database waking up. Retrying instantly usually fails again, and
// a short wait also stops many visitors hammering a struggling server at the same moment.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
export function ServerErrorDialog() {
  // const = a name for a value that is never reassigned
  const open = useServerErrorOpen();
  // const = a name for a value that is never reassigned
  // useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
  const ref = useRef(null);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);

  // Built on the browser's <dialog>: focus stays inside, Esc closes it, screen readers announce it.
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // const = a name for a value that is never reassigned
    const dialog = ref.current;
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // return = give this value back and stop the function here
    if (!dialog) return;
    // if (...) = run the next part only when the condition is true
    // a && b = AND; in JSX: show b only when a is true
    // ! = NOT: flips true/false
    if (open && !dialog.open) {
      setSecondsLeft(WAIT_SECONDS);
      // showModal = open a <dialog> as a modal (dims the page, traps focus)
      dialog.showModal();
    }
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // a && b = AND; in JSX: show b only when a is true
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Count down once per second while open.
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // a || b = OR: a if it is truthy, else b
    // === = strictly equal (same value AND same type)
    // return = give this value back and stop the function here
    if (!open || secondsLeft === 0) return;
    // const = a name for a value that is never reassigned
    // setTimeout = run a function once after a delay (ms)
    // => = an arrow function (a short function)
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    // return = give this value back and stop the function here
    // => = an arrow function (a short function)
    // clearTimeout = cancel a setTimeout
    return () => clearTimeout(timer);
  }, [open, secondsLeft]);

  // return = give this value back and stop the function here
  return (
    // <dialog> = the browser's built-in popup (focus trap, Esc to close)
    <dialog
      // ref = after drawing, put this element into a useRef box (.current)
      // { } in JSX = run JavaScript here and show its result
      ref={ref}
      // onClose = runs when the dialog closes
      // { } in JSX = run JavaScript here and show its result
      onClose={dismissServerError}
      // aria-labelledby = the element (by id) that names this one
      aria-labelledby="server-error-title"
      // aria-describedby = the element (by id) that describes this one
      aria-describedby="server-error-text"
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl p-0 shadow-xl backdrop:bg-slate-900/50"
    >
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="p-6 text-center">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
             aria-hidden = screen readers skip this (decoration) */}
          <ServerCrash className="size-6 text-red-600" aria-hidden />
        </span>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <h2 id="server-error-title" className="mt-4 text-lg font-semibold">
          Something went wrong
        </h2>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <p id="server-error-text" className="mt-2 text-sm text-slate-600">
          An error occurred on our side. Please retry after {WAIT_SECONDS} seconds.
        </p>
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="mt-6 flex flex-col gap-2">
          {/* onClick = what happens on click/tap
             { } in JSX = run JavaScript here and show its result
             => = an arrow function (a short function)
             window = the browser tab (location, events, timers)
             disabled = can't be clicked or typed in
             className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <Button onClick={() => window.location.reload()} disabled={secondsLeft > 0} className="w-full">
            {/* { } in JSX = run JavaScript here and show its result
               a ? b : c = ternary: if a then b else c
               `text ${x}` = a template string: text with values inserted */}
            {secondsLeft > 0 ? `Retry in ${secondsLeft}s` : 'Retry'}
          </Button>
          {/* onClick = what happens on click/tap
             { } in JSX = run JavaScript here and show its result
             => = an arrow function (a short function)
             ?.() = call only if the function exists
             ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
             className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <Button variant="ghost" onClick={() => ref.current?.close()} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </dialog>
  );
}
