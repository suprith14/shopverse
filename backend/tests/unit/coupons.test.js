import { describe, expect, test } from 'vitest';
import { calculateDiscount, describeCoupon } from '../../src/modules/coupons/coupons.service.js';

// A valid coupon; each test changes only the field it's about.
const coupon = (overrides = {}) => ({
  type: 'PERCENT',
  value: 10,
  minOrderAmount: 0,
  maxUses: null,
  usedCount: 0,
  expiresAt: null,
  isActive: true,
  ...overrides,
});

// All amounts are in cents: 5000 = $50.00

describe('calculateDiscount', () => {
  test('percent coupon takes that percentage off', () => {
    expect(calculateDiscount(coupon({ value: 10 }), 5000)).toBe(500);
  });

  test('percent discount rounds DOWN to whole cents', () => {
    // 15% of $9.99 = 149.85 cents -> 149, never 150
    expect(calculateDiscount(coupon({ value: 15 }), 999)).toBe(149);
  });

  test('fixed coupon takes a fixed amount off', () => {
    expect(calculateDiscount(coupon({ type: 'FIXED', value: 1000 }), 5000)).toBe(1000);
  });

  test('discount never makes the total negative', () => {
    // $20 off a $15 order -> $15 off (free), not -$5
    expect(calculateDiscount(coupon({ type: 'FIXED', value: 2000 }), 1500)).toBe(1500);
  });

  test('rejects a disabled coupon', () => {
    expect(() => calculateDiscount(coupon({ isActive: false }), 5000)).toThrow('Invalid coupon code');
  });

  test('rejects an expired coupon', () => {
    const now = new Date('2026-10-17T12:00:00Z');
    const expired = coupon({ expiresAt: new Date('2026-10-16T12:00:00Z') });
    expect(() => calculateDiscount(expired, 5000, now)).toThrow('This coupon has expired');
  });

  test('rejects a coupon that has been used up', () => {
    expect(() => calculateDiscount(coupon({ maxUses: 100, usedCount: 100 }), 5000)).toThrow('no longer available');
  });

  test('says how much more to add when under the minimum order', () => {
    expect(() => calculateDiscount(coupon({ minOrderAmount: 5000 }), 3500)).toThrow(
      'Add $15.00 more to use this coupon (minimum order $50.00)',
    );
  });

  test('exactly the minimum order amount is allowed', () => {
    expect(calculateDiscount(coupon({ minOrderAmount: 5000 }), 5000)).toBe(500);
  });
});

describe('describeCoupon', () => {
  test('describes both kinds of coupon', () => {
    expect(describeCoupon(coupon({ value: 10 }))).toBe('10% off');
    expect(describeCoupon(coupon({ type: 'FIXED', value: 500 }))).toBe('$5.00 off');
  });
});
