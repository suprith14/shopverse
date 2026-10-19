// import = bring in code from another file or package
// create (zustand) = make a small global store any component can read
import { create } from 'zustand';

// Notices when the API is slow to answer, so the page can say why instead of spinning silently.
// On the free hosting plan the API sleeps after 15 idle minutes and takes 30–50 s to wake up.
//
// Every request calls track() when it starts and the returned done() when it ends.
// If anything has been waiting longer than SLOW_AFTER_MS, `slow` becomes true.

// const = a name for a value that is never reassigned
const SLOW_AFTER_MS = 4000;

// export = other files can import this
// const = a name for a value that is never reassigned
// create (zustand) = make a small global store any component can read
// => = an arrow function (a short function)
export const useNetworkStatus = create(() => ({ slow: false }));

// let = a name whose value can be changed later
let inFlight = 0;
// let = a name whose value can be changed later
let timer;

// export = other files can import this
// function = a named, reusable block of code
export function track() {
  inFlight++;
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // setTimeout = run a function once after a delay (ms)
  // => = an arrow function (a short function)
  // setState = change the store; components using it redraw
  if (inFlight === 1) timer = setTimeout(() => useNetworkStatus.setState({ slow: true }), SLOW_AFTER_MS);

  // let = a name whose value can be changed later
  let finished = false;
  // return = give this value back and stop the function here
  return function done() {
    // if (...) = run the next part only when the condition is true
    // return = give this value back and stop the function here
    if (finished) return; // safe to call twice
    finished = true;
    inFlight--;
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    if (inFlight === 0) {
      // clearTimeout = cancel a setTimeout
      clearTimeout(timer);
      // setState = change the store; components using it redraw
      useNetworkStatus.setState({ slow: false });
    }
  };
}
