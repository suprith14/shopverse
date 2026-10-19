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
export class RateLimiter {
  events = new Map();

  constructor(max, windowMs) {
    this.max = max;
    this.windowMs = windowMs;
    // Every few minutes, forget keys with no recent events so memory doesn't grow forever.
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref(); // unref: don't keep the process alive
  }

  recent(key, now = Date.now()) {
    const kept = (this.events.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (kept.length) this.events.set(key, kept);
    else this.events.delete(key);
    return kept;
  }

  // How long this key must wait, in ms. 0 = allowed now.
  retryAfterMs(key) {
    const now = Date.now();
    const recent = this.recent(key, now);
    if (recent.length < this.max) return 0;
    // Allowed again once the oldest of the last `max` events leaves the window.
    return recent[recent.length - this.max] + this.windowMs - now;
  }

  record(key) {
    const recent = this.recent(key);
    recent.push(Date.now());
    this.events.set(key, recent);
  }

  reset(key) {
    this.events.delete(key);
  }

  cleanup() {
    for (const key of this.events.keys()) this.recent(key);
  }
}

const MINUTE = 60 * 1000;

// The limits used across the app, in one place.
export const limiters = {
  loginPerAccount: new RateLimiter(5, 15 * MINUTE), // brute force on one account
  loginPerIp: new RateLimiter(30, 15 * MINUTE), // "password spraying": many accounts, one machine
  resetRequestsPerIp: new RateLimiter(10, 15 * MINUTE), // "send me a code" requests
  resetFailuresPerIp: new RateLimiter(20, 15 * MINUTE), // wrong reset codes across any accounts
  guidePerUser: new RateLimiter(5, 15 * MINUTE), // wrong project-guide passwords (My account → Project guide)
};
