// Each alert must appear exactly when its rule applies, and stay quiet otherwise.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareRegimes, computeTax, gratuityExemption, leaveExemption } from './taxEngine.js';
import { findInsights } from './insights.js';

const ids = (input) => findInsights(input, compareRegimes(input)).map((x) => x.id);

test('no salary, no alerts', () => {
  assert.deepEqual(ids({}), []);
});

test('just over 12 lakh: marginal relief zone, with the employer NPS fix when it fits', () => {
  const list = findInsights({ basic: 600000, special: 685000 }, compareRegimes({ basic: 600000, special: 685000 }));
  const zone = list.find((x) => x.id === 'marginalZone');
  assert.ok(zone);
  assert.deepEqual(zone.parts, ['text', 'nps']); // 10,000 over; 14% of basic = 84,000 of room
  assert.ok(!ids({ special: 1275000 }).includes('marginalZone')); // exactly on the line: no relief needed
});

test('rebate does not cover capital gains', () => {
  assert.ok(ids({ special: 1075000, ltcgEquity: 200000 }).includes('rebateNotOnGains'));
});

test('interest pushing a tax-free salary over the line', () => {
  const list = ids({ special: 1275000, fdInterest: 50000 });
  assert.ok(list.includes('otherIncomePushesOver'));
});

test('advance tax: under 60 vs 60+', () => {
  const young = findInsights({ special: 2000000, fdInterest: 300000 }, compareRegimes({ special: 2000000, fdInterest: 300000 }));
  assert.deepEqual(young.find((x) => x.id === 'advanceTax').parts, ['text']);
  const seniorInput = { special: 2000000, fdInterest: 300000, age: 'senior' };
  const senior = findInsights(seniorInput, compareRegimes(seniorInput));
  assert.deepEqual(senior.find((x) => x.id === 'advanceTax').parts, ['senior']);
});

test('80C: wasted above the cap when the old regime is in play', () => {
  const input = { basic: 1000000, hra: 500000, special: 500000, rentMonthly: 50000, metro: true, employeePf: 120000, inv80C: 100000, homeLoanInterest: 0, healthSelf: 25000, healthParents: 50000, parentsSenior: true, nps80CCD1B: 50000 };
  const result = compareRegimes(input);
  assert.equal(result.better, 'old');
  assert.ok(findInsights(input, result).some((x) => x.id === 'over80C'));
  assert.ok(findInsights(input, result).some((x) => x.id === 'declareOld'));
});

test('80C investments flagged as useless when the new regime wins', () => {
  assert.ok(ids({ special: 1500000, inv80C: 50000 }).includes('investNoBenefit'));
});

test('HRA cases', () => {
  assert.ok(ids({ basic: 600000, special: 600000, rentMonthly: 20000 }).includes('rentNoHra'));
  assert.ok(ids({ basic: 600000, hra: 240000, special: 360000, rentMonthly: 4000 }).includes('rentTooLow'));
  assert.ok(ids({ basic: 600000, hra: 240000, special: 360000 }).includes('hraTaxable'));
  const renter = ids({ basic: 600000, hra: 240000, special: 360000, rentMonthly: 20000 });
  assert.ok(renter.includes('landlordPan'));
  assert.ok(renter.includes('nonMetro'));
  assert.ok(!ids({ basic: 600000, hra: 240000, special: 360000, rentMonthly: 20000, metro: true }).includes('nonMetro'));
});

test('surcharge edge and employer PF + NPS cap', () => {
  assert.ok(ids({ special: 5300000 }).includes('surchargeEdge')); // taxable 52.25 lakh
  assert.ok(!ids({ special: 7000000 }).includes('surchargeEdge'));
  assert.ok(ids({ basic: 5000000, employerPf: 600000, employerNps: 400000 }).includes('retirementCap'));
});

test('employer NPS saving tip shows a real saving', () => {
  const input = { basic: 1000000, special: 1000000 };
  const tip = findInsights(input, compareRegimes(input)).find((x) => x.id === 'employerNps');
  assert.ok(tip);
  const before = computeTax('new', input).total;
  const after = computeTax('new', { ...input, employerNps: 140000, special: 860000 }).total;
  assert.equal(tip.vars.saving, `₹${Math.round(before - after).toLocaleString('en-IN')}`);
});

test('job switch, gratuity and leave encashment', () => {
  assert.ok(ids({ special: 1500000, switchedJob: true }).includes('switchedJob'));
  assert.ok(ids({ basic: 600000, special: 600000, gratuityReceived: 100000, yearsOfService: 3 }).includes('gratuityYears'));
  // 15/26 x 50,000 a month x 6 years = 1,73,077 tax-free of 3,00,000
  assert.equal(Math.round(gratuityExemption({ gratuityReceived: 300000, basic: 600000, yearsOfService: 6 })), 173077);
  // 10 months of basic = 5,00,000 tax-free of 8,00,000
  assert.equal(leaveExemption({ leaveEncashment: 800000, basic: 600000 }), 500000);
  // both are exempt in the new regime too
  const r = computeTax('new', { basic: 600000, special: 600000, gratuityReceived: 300000, yearsOfService: 6, leaveEncashment: 800000 });
  assert.equal(Math.round(r.gratuityExempt + r.leaveExempt), 673077);
});

test('PF alone filling 80C is not called waste', () => {
  const list = ids({ basic: 2500000, special: 1000000, employeePf: 300000, rentMonthly: 100000, hra: 1250000, metro: true });
  assert.ok(!list.includes('over80C'));
  assert.ok(list.includes('pfFills80C'));
});

test('marginal vs average is not shown in the relief zone', () => {
  assert.ok(!ids({ basic: 600000, special: 685000 }).includes('marginalVsAverage'));
});

test('marginal vs average rate is explained when tax is due', () => {
  const t = findInsights({ special: 2000000 }, compareRegimes({ special: 2000000 })).find((x) => x.id === 'marginalVsAverage');
  assert.equal(t.vars.top, '20%');
});
