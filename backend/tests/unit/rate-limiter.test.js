import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { RateLimiter } from '../../src/lib/rate-limiter.js';

const MINUTE = 60 * 1000;

describe('RateLimiter (5 failures per 15 minutes)', () => {
  let limiter;

  // Fake timers: the test controls the clock, so "wait 15 minutes" takes no time at all.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-17T12:00:00Z'));
    limiter = new RateLimiter(5, 15 * MINUTE);
  });
  afterEach(() => vi.useRealTimers());

  const fail = (times, key = 'login:email:a@test.dev') => {
    for (let i = 0; i < times; i++) limiter.record(key);
  };

  test('allows the first 4 failures', () => {
    fail(4);
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBe(0);
  });

  test('blocks after the 5th failure, for 15 minutes', () => {
    fail(5);
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBe(15 * MINUTE);
  });

  test('the wait counts down as time passes', () => {
    fail(5);
    vi.advanceTimersByTime(10 * MINUTE);
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBe(5 * MINUTE);
  });

  test('allowed again once the window has passed', () => {
    fail(5);
    vi.advanceTimersByTime(15 * MINUTE);
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBe(0);
  });

  test('sliding window: only failures inside the last 15 minutes count', () => {
    fail(3); // at 12:00
    vi.advanceTimersByTime(10 * MINUTE);
    fail(2); // at 12:10 -> 5 inside the window, blocked
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBeGreaterThan(0);

    vi.advanceTimersByTime(5 * MINUTE); // 12:15: the three 12:00 failures drop out
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBe(0);
  });

  test('keys are counted separately', () => {
    fail(5, 'login:email:a@test.dev');
    expect(limiter.retryAfterMs('login:email:b@test.dev')).toBe(0);
  });

  test('reset clears a key (e.g. after a successful login)', () => {
    fail(5);
    limiter.reset('login:email:a@test.dev');
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBe(0);
  });
});
