// import = bring in code from another file or package
// describe = a group of related tests
// expect(value) = check a value; the test fails if the check is false
// test = one test
import { describe, expect, test } from 'vitest';
// import = bring in code from another file or package
import { calculateDiscount, describeCoupon } from '../../src/modules/coupons/coupons.service.js';

// A valid coupon; each test changes only the field it's about.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// x = value (in parameters) = the default used when x is not given
const coupon = (overrides = {}) => ({
  type: 'PERCENT',
  value: 10,
  minOrderAmount: 0,
  maxUses: null,
  usedCount: 0,
  expiresAt: null,
  isActive: true,
  // ...x = spread: copy all items/properties of x into here
  ...overrides,
});

// All amounts are in cents: 5000 = $50.00

// describe = a group of related tests
// => = an arrow function (a short function)
describe('calculateDiscount', () => {
  // test = one test
  // => = an arrow function (a short function)
  test('percent coupon takes that percentage off', () => {
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(calculateDiscount(coupon({ value: 10 }), 5000)).toBe(500);
  });

  // test = one test
  // => = an arrow function (a short function)
  test('percent discount rounds DOWN to whole cents', () => {
    // 15% of $9.99 = 149.85 cents -> 149, never 150
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(calculateDiscount(coupon({ value: 15 }), 999)).toBe(149);
  });

  // test = one test
  // => = an arrow function (a short function)
  test('fixed coupon takes a fixed amount off', () => {
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(calculateDiscount(coupon({ type: 'FIXED', value: 1000 }), 5000)).toBe(1000);
  });

  // test = one test
  // => = an arrow function (a short function)
  test('discount never makes the total negative', () => {
    // $20 off a $15 order -> $15 off (free), not -$5
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(calculateDiscount(coupon({ type: 'FIXED', value: 2000 }), 1500)).toBe(1500);
  });

  // test = one test
  // => = an arrow function (a short function)
  test('rejects a disabled coupon', () => {
    // expect(value) = check a value; the test fails if the check is false
    // => = an arrow function (a short function)
    // .toThrow = the function throws an error
    expect(() => calculateDiscount(coupon({ isActive: false }), 5000)).toThrow('Invalid coupon code');
  });

  // test = one test
  // => = an arrow function (a short function)
  test('rejects an expired coupon', () => {
    // const = a name for a value that is never reassigned
    // new = create an object from a class (e.g. new Date())
    // Date = a point in time (Date.now() = milliseconds since 1970)
    const now = new Date('2026-10-17T12:00:00Z');
    // const = a name for a value that is never reassigned
    // new = create an object from a class (e.g. new Date())
    // Date = a point in time (Date.now() = milliseconds since 1970)
    const expired = coupon({ expiresAt: new Date('2026-10-16T12:00:00Z') });
    // expect(value) = check a value; the test fails if the check is false
    // => = an arrow function (a short function)
    // .toThrow = the function throws an error
    expect(() => calculateDiscount(expired, 5000, now)).toThrow('This coupon has expired');
  });

  // test = one test
  // => = an arrow function (a short function)
  test('rejects a coupon that has been used up', () => {
    // expect(value) = check a value; the test fails if the check is false
    // => = an arrow function (a short function)
    // .toThrow = the function throws an error
    expect(() => calculateDiscount(coupon({ maxUses: 100, usedCount: 100 }), 5000)).toThrow('no longer available');
  });

  // test = one test
  // => = an arrow function (a short function)
  test('says how much more to add when under the minimum order', () => {
    // expect(value) = check a value; the test fails if the check is false
    // => = an arrow function (a short function)
    // .toThrow = the function throws an error
    expect(() => calculateDiscount(coupon({ minOrderAmount: 5000 }), 3500)).toThrow(
      'Add $15.00 more to use this coupon (minimum order $50.00)',
    );
  });

  // test = one test
  // => = an arrow function (a short function)
  test('exactly the minimum order amount is allowed', () => {
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(calculateDiscount(coupon({ minOrderAmount: 5000 }), 5000)).toBe(500);
  });
});

// describe = a group of related tests
// => = an arrow function (a short function)
describe('describeCoupon', () => {
  // test = one test
  // => = an arrow function (a short function)
  test('describes both kinds of coupon', () => {
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(describeCoupon(coupon({ value: 10 }))).toBe('10% off');
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(describeCoupon(coupon({ type: 'FIXED', value: 500 }))).toBe('$5.00 off');
  });
});
