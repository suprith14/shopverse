import { create } from 'zustand';

// Notices when the API is slow to answer, so the page can say why instead of spinning silently.
// On the free hosting plan the API sleeps after 15 idle minutes and takes 30–50 s to wake up.
//
// Every request calls track() when it starts and the returned done() when it ends.
// If anything has been waiting longer than SLOW_AFTER_MS, `slow` becomes true.

const SLOW_AFTER_MS = 4000;

export const useNetworkStatus = create(() => ({ slow: false }));

let inFlight = 0;
let timer;

export function track() {
  inFlight++;
  if (inFlight === 1) timer = setTimeout(() => useNetworkStatus.setState({ slow: true }), SLOW_AFTER_MS);

  let finished = false;
  return function done() {
    if (finished) return; // safe to call twice
    finished = true;
    inFlight--;
    if (inFlight === 0) {
      clearTimeout(timer);
      useNetworkStatus.setState({ slow: false });
    }
  };
}
