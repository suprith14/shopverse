// Run: npm test (node's built-in test runner, no extra packages).
// Expected numbers are worked out by hand from the slabs in taxRules.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breakEvenDeductions, compareRegimes, computeTax, hraExemption, splitCtc } from './taxEngine.js';

// A salary paid entirely as "special allowance", so the gross is easy to read
const salary = (gross, extra = {}) => ({ special: gross, ...extra });

test('new regime: 12.75 lakh salary pays no tax (75k standard deduction + 87A rebate)', () => {
  const r = computeTax('new', salary(1275000));
  assert.equal(r.normalTaxable, 1200000);
  assert.equal(r.slabTax, 60000);
  assert.equal(r.rebate, 60000);
  assert.equal(r.total, 0);
});

test('new regime: marginal relief just above 12 lakh', () => {
  // taxable 12,10,000: slab tax 61,500, but tax cannot exceed the 10,000 above 12 lakh
  const r = computeTax('new', salary(1285000));
  assert.equal(r.marginalRelief, 51500);
  assert.equal(r.total, 10400); // 10,000 + 4% cess
});

test('old regime slabs by age', () => {
  const income = salary(1050000); // taxable 10 lakh after the 50k standard deduction
  assert.equal(computeTax('old', income).total, 117000); // 12,500 + 1,00,000 + 4%
  assert.equal(computeTax('old', { ...income, age: 'senior' }).total, 114400); // 1,10,000 + 4%
  assert.equal(computeTax('old', { ...income, age: 'superSenior' }).total, 104000); // 1,00,000 + 4%
});

test('old regime: 87A rebate up to 5 lakh', () => {
  assert.equal(computeTax('old', salary(550000)).total, 0);
  assert.equal(computeTax('old', salary(560000)).total, 15080); // no marginal relief in the old regime
});

test('HRA exemption is the smallest of the three amounts', () => {
  // rent 3,00,000 - 10% of basic = 2,40,000 is the smallest
  assert.equal(hraExemption({ basic: 600000, hra: 300000, rentMonthly: 25000, metro: true }), 240000);
  // non-metro: 40% of basic = 2,40,000 vs HRA 2,00,000 -> HRA received
  assert.equal(hraExemption({ basic: 600000, hra: 200000, rentMonthly: 40000, metro: false }), 200000);
  assert.equal(hraExemption({ basic: 600000, hra: 300000, rentMonthly: 0, metro: true }), 0);
});

test('old regime deductions are capped', () => {
  const r = computeTax('old', salary(1500000, { employeePf: 100000, inv80C: 200000, healthSelf: 40000, nps80CCD1B: 90000, homeLoanInterest: 350000 }));
  assert.equal(r.deductionItems.sec80C, 150000);
  assert.equal(r.deductionItems.sec80D, 25000);
  assert.equal(r.deductionItems.sec80CCD1B, 50000);
  assert.equal(r.houseProperty, -200000);
});

test('surcharge: 10% above 50 lakh, with marginal relief right at the line', () => {
  const r = computeTax('new', salary(6075000)); // taxable 60 lakh
  assert.equal(r.slabTax, 1380000);
  assert.equal(r.surcharge, 138000);
  assert.equal(r.surchargeRelief, 0);
  // taxable 50,10,000: tax + surcharge may not exceed tax at 50 lakh (10,80,000) + 10,000
  const edge = computeTax('new', salary(5085000));
  assert.equal(edge.total, Math.round((1090000 * 1.04) / 10) * 10);
});

test('new regime caps the surcharge at 25%; old regime goes to 37%', () => {
  const big = salary(60000000);
  assert.equal(computeTax('new', big).surchargeRate, 0.25);
  assert.equal(computeTax('old', big).surchargeRate, 0.37);
});

test('capital gains: 1.25 lakh LTCG exemption, and no 87A rebate against gains in the new regime', () => {
  // taxable salary 10 lakh + LTCG 2 lakh: total 12 lakh, slab tax fully rebated, gains taxed
  const r = computeTax('new', salary(1075000, { ltcgEquity: 200000 }));
  assert.equal(r.rebate, 40000);
  assert.equal(r.capitalGainsTax, 9375); // 75,000 x 12.5%
  assert.equal(r.total, 9750);
});

test('unused basic exemption is used against capital gains', () => {
  // no salary, STCG 5 lakh: first 4 lakh tax-free (new regime exemption), 1 lakh at 20%
  const r = computeTax('new', { stcgEquity: 500000 });
  assert.equal(r.stcgTaxable, 100000);
});

test('employer NPS is deductible up to 14% of basic (new) and 10% (old)', () => {
  const i = { basic: 1000000, special: 500000, employerNps: 200000 };
  assert.equal(computeTax('new', i).deductionItems.sec80CCD2, 140000);
  assert.equal(computeTax('old', i).deductionItems.sec80CCD2, 100000);
});

test('employer PF + NPS above 7.5 lakh is taxable salary', () => {
  const r = computeTax('new', { basic: 5000000, employerPf: 600000, employerNps: 400000 });
  assert.equal(r.retirementExcess, 250000);
});

test('let-out property: 30% standard deduction; loss not allowed in the new regime', () => {
  const r = computeTax('old', { rentReceived: 240000, municipalTax: 0 });
  assert.equal(r.houseProperty, 168000);
  const loss = { special: 1500000, rentReceived: 120000, rentalLoanInterest: 400000 };
  assert.equal(computeTax('new', loss).houseProperty, 0);
  assert.equal(computeTax('old', loss).houseProperty, -200000);
});

test('CTC split adds back up to the CTC', () => {
  const s = splitCtc({ ctc: 1800000, basicPct: 0.5, variablePct: 0.1, metro: true, pfCapped: false });
  assert.equal(s.basic + s.hra + s.special + s.bonus + s.employerPf + s.gratuity, 1800000);
  assert.equal(s.employerPf, Math.round(0.12 * s.basic));
});

test('compare and break-even', () => {
  const c = compareRegimes(salary(1275000));
  assert.equal(c.better, 'new');
  assert.equal(c.saving, c.old.total);
  // with the break-even amount of deductions, the old regime is no dearer than the new one
  const need = breakEvenDeductions(salary(2000000));
  assert.ok(need > 0);
  assert.ok(computeTax('old', salary(2000000), { extraDeduction: need }).total <= computeTax('new', salary(2000000)).total);
});

test('take-home: monthly in-hand leaves out the bonus', () => {
  const c = compareRegimes({ basic: 600000, special: 600000, bonus: 120000, employeePf: 21600, professionalTax: 2400 });
  const n = c.new;
  // the year = 12 fixed months + the bonus, less the extra tax the bonus brings
  const bonusTax = n.salaryTax - n.monthlyTds * 12;
  assert.equal(Math.round(n.monthlyInHand * 12 + 120000 - bonusTax), Math.round(n.yearlyInHand));
  assert.ok(bonusTax > 0);
});
