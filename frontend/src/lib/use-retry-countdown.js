// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
// useState = a value the component remembers; calling its setter redraws the component
import { useEffect, useState } from 'react';
// import = bring in code from another file or package
import { isAxiosError } from 'axios';

// When the server answers 429 Too Many Requests, it says how long to wait in the standard
// Retry-After header (seconds). This turns that into a live countdown, so the page can show
// "Try again in 14:32" and keep the button disabled until then, instead of letting people click
// (and fail) over and over.
// export = other files can import this
// function = a named, reusable block of code
export function useRetryCountdown(error) {
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [until, setUntil] = useState(null);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  // => = an arrow function (a short function)
  // Date = a point in time
  const [now, setNow] = useState(() => Date.now());

  // A new 429 error: start counting down from its Retry-After.
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // a || b = OR: a if it is truthy, else b
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // !== = not strictly equal
    // return = give this value back and stop the function here
    if (!isAxiosError(error) || error.response?.status !== 429) return;
    // const = a name for a value that is never reassigned
    // obj[key] = read the property whose name is stored in key
    const seconds = Number(error.response.headers['retry-after']);
    // if (...) = run the next part only when the condition is true
    // Date = a point in time
    if (seconds > 0) setUntil(Date.now() + seconds * 1000);
  }, [error]);

  // Tick once a second while counting.
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    // return = give this value back and stop the function here
    if (until === null) return;
    // const = a name for a value that is never reassigned
    // setInterval = run a function repeatedly every N ms
    // => = an arrow function (a short function)
    const timer = setInterval(() => {
      // Date = a point in time
      setNow(Date.now());
      // if (...) = run the next part only when the condition is true
      // Date = a point in time
      if (Date.now() >= until) setUntil(null);
    }, 1000);
    // return = give this value back and stop the function here
    // => = an arrow function (a short function)
    // clearInterval = stop a setInterval
    return () => clearInterval(timer);
  }, [until]);

  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // === = strictly equal (same value AND same type)
  // Math = number helpers (min, max, round, floor...)
  const remainingMs = until === null ? 0 : Math.max(0, until - now);
  // const = a name for a value that is never reassigned
  // Math = number helpers (min, max, round, floor...)
  const total = Math.ceil(remainingMs / 1000);
  // return = give this value back and stop the function here
  return {
    blocked: remainingMs > 0,
    // `text ${x}` = a template string: text with values inserted
    // Math = number helpers (min, max, round, floor...)
    // .padStart = pad a string at the start to a length
    label: `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`, // "14:05"
  };
}
