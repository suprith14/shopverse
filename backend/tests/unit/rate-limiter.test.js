// import = bring in code from another file or package
// afterEach = run after every test
// beforeEach = run before every test
// describe = a group of related tests
// expect(value) = check a value; the test fails if the check is false
// test = one test
// vi = vitest helpers: fake timers, mocks
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
// import = bring in code from another file or package
import { RateLimiter } from '../../src/lib/rate-limiter.js';

// const = a name for a value that is never reassigned
const MINUTE = 60 * 1000;

// describe = a group of related tests
// => = an arrow function (a short function)
describe('RateLimiter (5 failures per 15 minutes)', () => {
  // let = a name whose value can be changed later
  let limiter;

  // Fake timers: the test controls the clock, so "wait 15 minutes" takes no time at all.
  // beforeEach = run before every test
  // => = an arrow function (a short function)
  beforeEach(() => {
    // vi = vitest helpers: fake timers, mocks
    // vi.useFakeTimers = fake clock: time only moves when the test says so
    vi.useFakeTimers();
    // vi = vitest helpers: fake timers, mocks
    // vi.setSystemTime = set the fake clock to this date
    // new = create an object from a class (e.g. new Date())
    // Date = a point in time (Date.now() = milliseconds since 1970)
    vi.setSystemTime(new Date('2026-10-17T12:00:00Z'));
    // new = create an object from a class (e.g. new Date())
    limiter = new RateLimiter(5, 15 * MINUTE);
  });
  // afterEach = run after every test
  // => = an arrow function (a short function)
  // vi = vitest helpers: fake timers, mocks
  // vi.useRealTimers = back to the real clock
  afterEach(() => vi.useRealTimers());

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // x = value (in parameters) = the default used when x is not given
  const fail = (times, key = 'login:email:a@test.dev') => {
    // let = a name whose value can be changed later
    for (let i = 0; i < times; i++) limiter.record(key);
  };

  // test = one test
  // => = an arrow function (a short function)
  test('allows the first 4 failures', () => {
    fail(4);
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBe(0);
  });

  // test = one test
  // => = an arrow function (a short function)
  test('blocks after the 5th failure, for 15 minutes', () => {
    fail(5);
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBe(15 * MINUTE);
  });

  // test = one test
  // => = an arrow function (a short function)
  test('the wait counts down as time passes', () => {
    fail(5);
    // vi = vitest helpers: fake timers, mocks
    // vi.advanceTimersByTime = move the fake clock forward N ms
    vi.advanceTimersByTime(10 * MINUTE);
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBe(5 * MINUTE);
  });

  // test = one test
  // => = an arrow function (a short function)
  test('allowed again once the window has passed', () => {
    fail(5);
    // vi = vitest helpers: fake timers, mocks
    // vi.advanceTimersByTime = move the fake clock forward N ms
    vi.advanceTimersByTime(15 * MINUTE);
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBe(0);
  });

  // test = one test
  // => = an arrow function (a short function)
  test('sliding window: only failures inside the last 15 minutes count', () => {
    fail(3); // at 12:00
    // vi = vitest helpers: fake timers, mocks
    // vi.advanceTimersByTime = move the fake clock forward N ms
    vi.advanceTimersByTime(10 * MINUTE);
    fail(2); // at 12:10 -> 5 inside the window, blocked
    // expect(value) = check a value; the test fails if the check is false
    // .toBeGreaterThan = is a bigger number
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBeGreaterThan(0);

    // vi = vitest helpers: fake timers, mocks
    // vi.advanceTimersByTime = move the fake clock forward N ms
    vi.advanceTimersByTime(5 * MINUTE); // 12:15: the three 12:00 failures drop out
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBe(0);
  });

  // test = one test
  // => = an arrow function (a short function)
  test('keys are counted separately', () => {
    fail(5, 'login:email:a@test.dev');
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(limiter.retryAfterMs('login:email:b@test.dev')).toBe(0);
  });

  // test = one test
  // => = an arrow function (a short function)
  test('reset clears a key (e.g. after a successful login)', () => {
    fail(5);
    limiter.reset('login:email:a@test.dev');
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(limiter.retryAfterMs('login:email:a@test.dev')).toBe(0);
  });
});
