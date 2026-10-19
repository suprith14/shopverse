// A small "sliding window" limiter, written by hand so the idea is visible.
//
// For each key (e.g. "login:email:demo@shopverse.dev" or "login:ip:203.0.113.7") it remembers
// the times of recent events (failed logins, reset requests...). If `max` events happened within
// the last `windowMs`, the key must wait until the oldest of them is older than the window.
//
//   max 5, window 15 min:  ✗ ✗ ✗ ✗ ✗  -> blocked until 15 min after the FIRST of those 5 failures
//
// The data lives in this server's memory. That's fine for ONE server (ours). With several
// servers each would count separately, and a restart forgets everything: then the counters
// belong in Redis, which every server shares and which can expire keys by itself.
// export = other files can import this
export class RateLimiter {
  // new = create an object from a class (e.g. new Date())
  // Map = key -> value lookup table
  events = new Map();

  constructor(max, windowMs) {
    this.max = max;
    this.windowMs = windowMs;
    // Every few minutes, forget keys with no recent events so memory doesn't grow forever.
    // setInterval = run a function repeatedly every N ms
    // => = an arrow function (a short function)
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref(); // unref: don't keep the process alive
  }

  // x = value (in parameters) = the default used when x is not given
  // Date = a point in time (Date.now() = milliseconds since 1970)
  recent(key, now = Date.now()) {
    // const = a name for a value that is never reassigned
    // a ?? b = a, unless a is null/undefined, then b
    // .filter = keep only the items that pass a test
    // => = an arrow function (a short function)
    const kept = (this.events.get(key) ?? []).filter((t) => now - t < this.windowMs);
    // if (...) = run the next part only when the condition is true
    if (kept.length) this.events.set(key, kept);
    else this.events.delete(key);
    // return = give this value back and stop the function here
    return kept;
  }

  // How long this key must wait, in ms. 0 = allowed now.
  retryAfterMs(key) {
    // const = a name for a value that is never reassigned
    // Date = a point in time (Date.now() = milliseconds since 1970)
    const now = Date.now();
    // const = a name for a value that is never reassigned
    const recent = this.recent(key, now);
    // if (...) = run the next part only when the condition is true
    // return = give this value back and stop the function here
    if (recent.length < this.max) return 0;
    // Allowed again once the oldest of the last `max` events leaves the window.
    // return = give this value back and stop the function here
    // obj[key] = read the property whose name is stored in key
    return recent[recent.length - this.max] + this.windowMs - now;
  }

  record(key) {
    // const = a name for a value that is never reassigned
    const recent = this.recent(key);
    // Date = a point in time (Date.now() = milliseconds since 1970)
    recent.push(Date.now());
    this.events.set(key, recent);
  }

  reset(key) {
    this.events.delete(key);
  }

  cleanup() {
    // const = a name for a value that is never reassigned
    // Object.keys = the property names of an object
    for (const key of this.events.keys()) this.recent(key);
  }
}

// const = a name for a value that is never reassigned
const MINUTE = 60 * 1000;

// The limits used across the app, in one place.
// export = other files can import this
// const = a name for a value that is never reassigned
export const limiters = {
  // new = create an object from a class (e.g. new Date())
  loginPerAccount: new RateLimiter(5, 15 * MINUTE), // brute force on one account
  // new = create an object from a class (e.g. new Date())
  loginPerIp: new RateLimiter(30, 15 * MINUTE), // "password spraying": many accounts, one machine
  // new = create an object from a class (e.g. new Date())
  resetRequestsPerIp: new RateLimiter(10, 15 * MINUTE), // "send me a code" requests
  // new = create an object from a class (e.g. new Date())
  resetFailuresPerIp: new RateLimiter(20, 15 * MINUTE), // wrong reset codes across any accounts
  // new = create an object from a class (e.g. new Date())
  guidePerUser: new RateLimiter(5, 15 * MINUTE), // wrong project-guide passwords (My account → Project guide)
};
