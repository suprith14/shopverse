// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
// useState = a value the component remembers; calling its setter redraws the component
import { useEffect, useState } from 'react';

// Returns `value`, but only after it has stopped changing for `delayMs`.
// Typing "laptop" fires 6 changes; with a 250 ms debounce only "laptop" reaches the API,
// instead of "l", "la", "lap"... (6 requests -> 1).
// export = other files can import this
// function = a named, reusable block of code
// x = value (in parameters) = the default used when x is not given
export function useDebounce(value, delayMs = 250) {
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [debounced, setDebounced] = useState(value);
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // const = a name for a value that is never reassigned
    // setTimeout = run a function once after a delay (ms)
    // => = an arrow function (a short function)
    const timer = setTimeout(() => setDebounced(value), delayMs);
    // return = give this value back and stop the function here
    // => = an arrow function (a short function)
    // clearTimeout = cancel a setTimeout
    return () => clearTimeout(timer); // value changed again before the delay: restart the timer
  }, [value, delayMs]);
  // return = give this value back and stop the function here
  return debounced;
}
