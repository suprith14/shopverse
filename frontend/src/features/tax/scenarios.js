// Ready-made cases for the "Try a scenario" buttons: each one shows a different rule at work.
// Salaries come from splitCtc() where an offer letter would give a CTC; the edge cases set the
// salary directly so the exact line (12 lakh, 50 lakh) is hit.

import { EMPTY_INPUT, splitCtc } from './taxEngine.js';

const PT = 2400; // professional tax most states charge (Karnataka: 200 a month)

const fromCtc = (options, extra = {}) => {
  // gratuity is left out: it is paid on leaving, not every year
  const { basic, hra, special, bonus, employerPf, employeePf } = splitCtc(options);
  return { ...EMPTY_INPUT, basic, hra, special, bonus, employerPf, employeePf, professionalTax: PT, metro: !!options.metro, ...extra };
};

export const SCENARIOS = [
  // 6 LPA first job: both regimes end at zero, the new one with less paperwork
  { id: 'fresher', input: fromCtc({ ctc: 600000, basicPct: 0.4 }) },
  // the 12 lakh rebate line: 12.75 lakh salary - 75k standard deduction = 12 lakh, no tax
  { id: 'zeroTax', input: { ...EMPTY_INPUT, basic: 510000, hra: 255000, special: 510000, employerPf: 21600, employeePf: 21600, professionalTax: PT } },
  // 10,000 over the line: marginal relief keeps the tax at about 10,000 instead of 63,960
  { id: 'marginal', input: { ...EMPTY_INPUT, basic: 514000, hra: 257000, special: 514000, employerPf: 21600, employeePf: 21600, professionalTax: PT } },
  // renting in Bengaluru (an HRA "metro" from FY 2026-27) with the usual deductions
  {
    id: 'renter',
    input: fromCtc(
      { ctc: 1800000, basicPct: 0.5, metro: true },
      { rentMonthly: 30000, inv80C: 50000, healthSelf: 25000, healthParents: 50000, parentsSenior: true },
    ),
  },
  // home loan + full 80C + NPS: the case where the old regime can still win
  {
    id: 'homeLoan',
    input: fromCtc(
      { ctc: 3000000, basicPct: 0.5, metro: true, pfCapped: false },
      { homeLoanInterest: 200000, inv80C: 0, nps80CCD1B: 50000, healthSelf: 25000, healthParents: 50000, parentsSenior: true, rentMonthly: 0 },
    ),
  },
  // senior management: surcharge above 50 lakh, and employer NPS as a tax-free part of CTC
  {
    id: 'highEarner',
    input: (() => {
      const s = fromCtc({ ctc: 6000000, basicPct: 0.5, variablePct: 0.15, metro: true, pfCapped: false });
      const employerNps = Math.round(s.basic * 0.14);
      return { ...s, special: s.special - employerNps, employerNps, rentMonthly: 80000 };
    })(),
  },
  // a 60+ employee: bigger old-regime exemption, 80TTB on interest, 50k health cover limit
  {
    id: 'senior',
    input: fromCtc(
      { ctc: 1500000, basicPct: 0.5 },
      { age: 'senior', fdInterest: 120000, savingsInterest: 15000, healthSelf: 50000 },
    ),
  },
  // salary plus shares and a let-out flat
  {
    id: 'investor',
    input: fromCtc(
      { ctc: 1000000, basicPct: 0.4 },
      { stcgEquity: 50000, ltcgEquity: 300000, rentReceived: 240000, municipalTax: 6000, savingsInterest: 8000 },
    ),
  },
];
