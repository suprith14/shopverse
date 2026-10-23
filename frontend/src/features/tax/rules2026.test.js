// The FY 2026-27 additions: Income-tax Rules 2026 perks, freelance income, other gains, more
// deductions, the offer comparison, share links, and that every alert and trap has its words in
// both languages.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_INPUT, compareOffers, compareRegimes, computeTax, sec80GG, splitCtc } from './taxEngine.js';
import { findInsights } from './insights.js';
import { TRAPS } from './traps.js';
import { SCENARIOS } from './scenarios.js';
import { decodeInput, encodeInput } from './share.js';
import en from '../../i18n/en.js';
import kn from '../../i18n/kn.js';

const base = { basic: 600000, special: 900000 };

test('meal cards: ₹200 a meal tax-free in both regimes', () => {
  const limit = 200 * 528;
  for (const regime of ['old', 'new']) {
    const r = computeTax(regime, { ...base, mealCards: 150000 });
    assert.equal(r.otherExempt, limit);
  }
});

test('gifts: up to ₹15,000 free, above it the whole value is taxed', () => {
  assert.equal(computeTax('new', { ...base, gifts: 15000 }).otherExempt, 15000);
  assert.equal(computeTax('new', { ...base, gifts: 15001 }).otherExempt, 0);
});

test('company car: fixed monthly values, plus the driver', () => {
  assert.equal(computeTax('new', { ...base, companyCar: 'small' }).perquisites, 60000);
  assert.equal(computeTax('new', { ...base, companyCar: 'large', carDriver: true }).perquisites, 120000);
  assert.equal(computeTax('new', { ...base, carDriver: true }).perquisites, 0); // driver without a car: nothing
});

test("children's allowances: old regime only, at most 2 children", () => {
  const input = { ...base, childEduAllowance: 120000, hostelAllowance: 300000, children: 3 };
  assert.equal(computeTax('old', input).otherExempt, 72000 + 216000);
  assert.equal(computeTax('new', input).otherExempt, 0);
});

test('80GG: smallest of ₹60,000, 25% of income, rent minus 10% of income', () => {
  assert.equal(sec80GG({ hra: 0, rentMonthly: 20000 }, 800000), 60000);
  assert.equal(sec80GG({ hra: 0, rentMonthly: 8000 }, 800000), 16000); // 96,000 - 80,000
  assert.equal(sec80GG({ hra: 100000, rentMonthly: 20000 }, 800000), 0); // gets HRA: not allowed
  const r = computeTax('old', { special: 1000000, rentMonthly: 20000 });
  assert.equal(r.deductionItems.sec80GG, 60000);
  assert.equal(computeTax('new', { special: 1000000, rentMonthly: 20000 }).deductionItems.sec80GG, 0);
});

test('freelance (44ADA): half the receipts is income, in both regimes', () => {
  const r = computeTax('new', { freelanceReceipts: 2000000 });
  assert.equal(r.business, 1000000);
  assert.equal(r.normalTaxable, 1000000);
  assert.equal(r.total, 0); // under 12 lakh: rebate
});

test('family pension: a third, capped at ₹15,000 (old) / ₹25,000 (new)', () => {
  assert.equal(computeTax('old', { familyPension: 300000 }).otherSources, 285000);
  assert.equal(computeTax('new', { familyPension: 300000 }).otherSources, 275000);
});

test('other gains: slab-rate short-term, 12.5% long-term without exemption', () => {
  const slab = computeTax('new', { special: 2075000, otherStcg: 100000 });
  assert.equal(slab.normalTaxable, 2100000); // added to slab income
  const r = computeTax('new', { special: 2075000, otherLtcg: 400000 });
  assert.equal(r.capitalGainsTax, 50000); // 12.5%, no 1.25 lakh exemption
  // old regime: 87A rebate also covers this tax when total income is under 5 lakh
  assert.equal(computeTax('old', { otherLtcg: 300000 }).total, 0); // (3L - 2.5L exemption) x 12.5% = 6,250, within 12,500
  assert.equal(computeTax('old', { otherLtcg: 400000 }).total, 6500); // 18,750 - 12,500 rebate + 4% cess
});

test('more deductions: 80U / 80DD / 80DDB old only, 80CCH in both', () => {
  const input = { special: 1500000, disabilitySelf: 'severe', disabilityDependant: 'disabled', medical80DDB: 60000, agniveer80CCH: 30000 };
  const o = computeTax('old', input).deductionItems;
  assert.deepEqual([o.sec80U, o.sec80DD, o.sec80DDB, o.sec80CCH], [125000, 75000, 40000, 30000]);
  const n = computeTax('new', input).deductionItems;
  assert.deepEqual([n.sec80U, n.sec80DD, n.sec80DDB, n.sec80CCH], [0, 0, 0, 30000]);
});

test('Bengaluru renter scenario now uses the 50% HRA rule', () => {
  const renter = SCENARIOS.find((s) => s.id === 'renter').input;
  assert.equal(renter.metro, true);
  assert.equal(computeTax('old', renter).hraExempt, Math.min(renter.hra, 360000 - 0.1 * renter.basic, 0.5 * renter.basic));
});

test('offer comparison: same profile, each offer in its better regime', () => {
  const profile = { ...EMPTY_INPUT, rentMonthly: 25000, inv80C: 50000, basic: 99999999 }; // salary fields are ignored
  const [a, b] = compareOffers(profile, [
    { ctc: 1200000, basicPct: 0.4, variablePct: 0, metro: true },
    { ctc: 1500000, basicPct: 0.4, variablePct: 0.1, expectedPayout: 0.5, joiningBonus: 100000, metro: true },
  ]);
  assert.equal(a.salary.basic, splitCtc({ ctc: 1200000, basicPct: 0.4 }).basic);
  assert.ok(b.monthlyInHand > a.monthlyInHand);
  assert.ok(b.firstYearCash > b.laterYearCash); // the joining bonus only in year 1
  const best = compareRegimes({ ...profile, ...splitCtc({ ctc: 1200000, basicPct: 0.4, metro: true }), metro: true, basic: splitCtc({ ctc: 1200000, basicPct: 0.4 }).basic });
  assert.equal(a.tax, Math.min(best.old.total, best.new.total));
});

test('share link: round trip, and nothing unexpected gets in', () => {
  const input = { ...EMPTY_INPUT, basic: 600000, age: 'senior', metro: true, companyCar: 'small' };
  assert.deepEqual(decodeInput(encodeInput(input)), input);
  const evil = btoa(JSON.stringify({ basic: -5, age: 'hacker', __proto__x: 1, special: '1e9', hra: 1e20, rentMonthly: 20000 }));
  assert.deepEqual(decodeInput(evil), { ...EMPTY_INPUT, rentMonthly: 20000 });
  assert.equal(decodeInput('not base64 !!'), null);
});

// Run every scenario plus crafted cases through the alerts; each id and text part must exist
const CASES = [
  ...SCENARIOS.map((s) => s.input),
  { basic: 600000, special: 685000 },
  { special: 1075000, ltcgEquity: 200000 },
  { special: 1275000, fdInterest: 50000 },
  { special: 2000000, fdInterest: 300000, age: 'senior' },
  { special: 2000000, freelanceReceipts: 9000000 },
  { basic: 600000, special: 600000, rentMonthly: 20000, homeLoanInterest: 300000, mealCards: 200000, gifts: 20000, companyCar: 'large', esopPerquisite: 100000, childEduAllowance: 30000, children: 1 },
  { basic: 600000, hra: 240000, special: 360000, rentMonthly: 4000, otherStcg: 10000, otherLtcg: 10000, stcgEquity: 1, ltcgEquity: 10000, bonus: 1, switchedJob: true, gratuityReceived: 500000, yearsOfService: 3 },
  { basic: 5000000, employerPf: 600000, employerNps: 400000, special: 300000 },
];

test('every alert and trap has its words in English and Kannada', () => {
  const seen = new Set();
  for (const input of CASES) {
    for (const item of findInsights(input, compareRegimes(input))) {
      seen.add(item.id);
      for (const lang of [en, kn]) {
        const words = lang.tax.alert[item.id];
        assert.ok(words?.title, `${item.id}.title`);
        for (const part of item.parts) assert.ok(words[part], `${item.id}.${part}`);
      }
    }
  }
  assert.ok(seen.size >= 35, `only ${seen.size} alerts exercised`);
  for (const group of TRAPS) {
    for (const lang of [en, kn]) {
      assert.ok(lang.tax.trapGroup[group.id]);
      for (const item of group.items) assert.ok(lang.tax.trap[item]?.title && lang.tax.trap[item]?.text, item);
    }
  }
});
