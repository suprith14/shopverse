// The tax calculation: pure functions (numbers in, numbers out), no React, so they can be unit tested
// with node --test and reused anywhere. Every rate and limit comes from taxRules.js.
//
// Order of work, the same as the return form:
//   salary + perquisites -> exemptions (HRA, LTA, meals...) -> standard deduction, professional tax
//   = income from salary; + house property + business (freelance) + other sources + slab-rate gains
//   = gross total income -> deductions (80C...) = taxable income -> slab tax + special-rate gains tax
//   -> rebate 87A -> surcharge -> cess -> total.

import { RULES } from './taxRules.js';

const pos = (n) => Math.max(0, n);
const round10 = (n) => Math.round(n / 10) * 10; // incomes and tax are rounded to the nearest 10

// Every field the calculator understands; amounts are yearly unless the name says otherwise
export const EMPTY_INPUT = {
  age: 'below60', // below60 | senior (60-79) | superSenior (80+)
  basic: 0, // basic + DA
  hra: 0,
  special: 0, // special / flexible allowance
  otherAllowances: 0,
  bonus: 0, // variable pay, joining or performance bonus
  lta: 0, // leave travel allowance received
  ltaClaimed: 0, // travel bills submitted against it (old regime)
  employerPf: 0, // in the CTC, not in the payslip
  employerNps: 0,
  employeePf: 0, // deducted from salary; counts towards 80C
  professionalTax: 0,
  // perquisites and allowances with their own limits
  mealCards: 0,
  gifts: 0, // employer gifts and vouchers
  companyCar: 'none', // none | small | large
  carDriver: false,
  esopPerquisite: 0, // market value minus exercise price, on shares exercised this year
  childEduAllowance: 0,
  hostelAllowance: 0,
  children: 0,
  rentMonthly: 0,
  metro: false, // one of the 8 HRA cities
  inv80C: 0, // 80C investments other than employee PF
  nps80CCD1B: 0,
  healthSelf: 0,
  healthParents: 0,
  parentsSenior: false,
  homeLoanInterest: 0, // own (self-occupied) house
  eduLoanInterest: 0, // 80E, no limit
  donations80G: 0, // the deductible amount
  disabilitySelf: 'none', // none | disabled | severe (80U)
  disabilityDependant: 'none', // 80DD
  medical80DDB: 0,
  agniveer80CCH: 0, // contribution to the Agniveer Corpus Fund, both regimes
  savingsInterest: 0,
  fdInterest: 0,
  otherIncome: 0,
  familyPension: 0,
  freelanceReceipts: 0, // professional side income, presumptive scheme (44ADA)
  rentReceived: 0, // let-out property
  municipalTax: 0,
  rentalLoanInterest: 0,
  stcgEquity: 0,
  ltcgEquity: 0,
  otherStcg: 0, // property / gold / unlisted held up to 24 months, and all debt fund gains: slab rate
  otherLtcg: 0, // property / gold / unlisted held over 24 months: 12.5%
  gratuityReceived: 0, // leaving a job this year
  yearsOfService: 0,
  leaveEncashment: 0, // paid on leaving (encashment while still employed is fully taxable)
  switchedJob: false, // two employers in the year (only changes the alerts, not the tax)
};

// Tax on an income, band by band; rows are for the "how the slabs add up" table
export function slabTax(income, slabs) {
  let from = 0;
  let tax = 0;
  const rows = [];
  for (const [upto, rate] of slabs) {
    const amount = pos(Math.min(income, upto) - from);
    rows.push({ from, to: upto, rate, amount, tax: amount * rate });
    tax += amount * rate;
    from = upto;
  }
  return { tax, rows };
}

// Old regime slabs depend on age (the tax-free part is bigger for 60+ and 80+)
export function slabsFor(regime, age, rules = RULES) {
  if (regime === 'new') return rules.new.slabs;
  const exemption = rules.old.exemption[age];
  // drop a band that the bigger exemption swallows (80+: the 5% band disappears)
  return [[exemption, 0], ...rules.old.bands.filter(([upto]) => upto > exemption)];
}

const exemptionFor = (regime, age, rules) => (regime === 'new' ? rules.new.exemption : rules.old.exemption[age]);

// Gratuity on leaving: tax-free up to 15 days' basic (15/26 of a month) per year of service,
// capped at 20 lakh. Years: completed years, with more than 6 months counting as a full year.
export function gratuityExemption({ gratuityReceived, basic, yearsOfService }, rules = RULES) {
  if (!gratuityReceived) return 0;
  const formula = (15 / 26) * (basic / 12) * yearsOfService;
  return Math.min(gratuityReceived, formula, rules.limits.gratuityExemptMax);
}

// Leave encashment on leaving: tax-free up to 10 months' basic, capped at 25 lakh (simplified: the
// law also caps it at 30 days of leave per year of service, which needs the leave history)
export function leaveExemption({ leaveEncashment, basic }, rules = RULES) {
  if (!leaveEncashment) return 0;
  return Math.min(leaveEncashment, 10 * (basic / 12), rules.limits.leaveEncashmentExemptMax);
}

// HRA exemption = the smallest of: HRA received, rent paid minus 10% of basic, 50% (8 cities) or 40% of basic
export function hraExemption({ basic, hra, rentMonthly, metro }) {
  const rent = rentMonthly * 12;
  if (!rent || !hra) return 0;
  return pos(Math.min(hra, rent - 0.1 * basic, (metro ? 0.5 : 0.4) * basic));
}

// 80GG (rent with no HRA in the salary): the smallest of 5,000 a month, 25% of the adjusted total
// income, and rent minus 10% of that income
export function sec80GG({ hra, rentMonthly }, adjustedIncome, rules = RULES) {
  const rent = rentMonthly * 12;
  if (hra > 0 || !rent) return 0;
  return pos(Math.min(rules.limits.sec80GGMonthly * 12, 0.25 * adjustedIncome, rent - 0.1 * adjustedIncome));
}

// Company car (work + personal use, employer pays the running costs): a fixed monthly value
export function carPerquisite({ companyCar, carDriver }, rules = RULES) {
  if (companyCar === 'none' || !rules.car[companyCar]) return 0;
  return 12 * (rules.car[companyCar] + (carDriver ? rules.car.driver : 0));
}

// Splits a CTC into a typical Indian salary structure (what an offer letter usually shows)
export function splitCtc({ ctc, basicPct = 0.4, variablePct = 0, metro = false, pfCapped = true }) {
  const bonus = Math.round(ctc * variablePct);
  const fixed = ctc - bonus;
  // Basic is a share of the fixed pay; HRA, PF and gratuity follow from basic, and the special
  // allowance is whatever is left, so the parts always add up to the CTC exactly
  const basic = Math.round(fixed * basicPct);
  const hra = Math.round(basic * (metro ? 0.5 : 0.4));
  const pf = Math.round(pfCapped ? Math.min(0.12 * basic, 0.12 * 15000 * 12) : 0.12 * basic); // capped: 12% of a 15,000 wage
  const gratuity = Math.round(basic * 0.0481); // 15/26 of a month's basic per year of service
  const special = pos(fixed - basic - hra - pf - gratuity);
  return { basic, hra, special, bonus, employerPf: pf, employeePf: pf, gratuity };
}

// The two kinds of tax relief at the bottom of the bill
function rebate87A(regime, totalIncome, slab, oldRegimeGainsTax, rules) {
  const r = rules[regime].rebate;
  if (totalIncome <= r.incomeLimit) {
    // new regime: only against slab tax (never against special-rate gains);
    // old regime: also against short-term equity gains and non-equity long-term gains
    return { rebate: Math.min(r.max, regime === 'new' ? slab : slab + oldRegimeGainsTax), marginalRelief: 0 };
  }
  // Marginal relief: just above 12 lakh, the tax may not be more than the income above 12 lakh
  if (r.marginalRelief) return { rebate: 0, marginalRelief: pos(slab - (totalIncome - r.incomeLimit)) };
  return { rebate: 0, marginalRelief: 0 };
}

function surchargeRate(regime, totalIncome, rules) {
  let rate = 0;
  for (const [threshold, r] of rules.surcharge) if (totalIncome > threshold) rate = r;
  return Math.min(rate, rules[regime].surchargeCap);
}

// Tax (before cess) on a given normal income + special-rate gains. Used twice: for the real income
// and, for surcharge marginal relief, for the income right at the surcharge threshold.
function taxBeforeCess(regime, age, normalTaxable, gains, rules) {
  const cg = rules.capitalGains;
  const { stcg, ltcg, otherLtcg } = gains;
  const totalIncome = normalTaxable + stcg + ltcg + otherLtcg;
  const slab = slabTax(normalTaxable, slabsFor(regime, age, rules));

  // Unused basic exemption (normal income below the tax-free limit) is used against the gains,
  // the 20% ones first
  let shortfall = pos(exemptionFor(regime, age, rules) - normalTaxable);
  const afterExemption = (amount) => {
    const taxable = pos(amount - shortfall);
    shortfall = pos(shortfall - amount);
    return taxable;
  };
  const stcgTaxable = afterExemption(stcg);
  const otherLtcgTaxable = afterExemption(otherLtcg);
  const ltcgTaxable = afterExemption(pos(ltcg - cg.ltcgExemption));
  const stcgTax = stcgTaxable * cg.stcgRate;
  const ltcgTax = ltcgTaxable * cg.ltcgRate + otherLtcgTaxable * cg.otherLtcgRate;

  const { rebate, marginalRelief } = rebate87A(
    regime,
    totalIncome,
    slab.tax,
    stcgTax + otherLtcgTaxable * cg.otherLtcgRate,
    rules,
  );
  // whatever of the rebate is left after the slab tax comes off the gains tax
  const normalPart = pos(slab.tax - rebate - marginalRelief);
  const gainsPart = pos(stcgTax + ltcgTax - pos(rebate - slab.tax));

  const rate = surchargeRate(regime, totalIncome, rules);
  const surcharge = normalPart * rate + gainsPart * Math.min(rate, cg.surchargeCap);
  return {
    slab,
    stcgTaxable,
    ltcgTaxable: ltcgTaxable + otherLtcgTaxable,
    stcgTax,
    ltcgTax,
    rebate,
    marginalRelief,
    surchargeRate: rate,
    surcharge,
    beforeCess: normalPart + gainsPart + surcharge,
  };
}

// The full calculation for one regime. `extraDeduction` is only for the break-even search below.
export function computeTax(regime, input, { rules = RULES, extraDeduction = 0 } = {}) {
  const i = { ...EMPTY_INPUT, ...input };
  const old = regime === 'old';
  const L = rules.limits;
  const senior = i.age !== 'below60';
  const children = Math.min(i.children, L.maxChildren);

  // 1. Salary. Employer NPS is part of salary (then deducted under 80CCD(2)); employer PF is not,
  // unless employer PF + NPS cross 7.5 lakh, when the excess is taxed as a perquisite.
  const retirementExcess = pos(i.employerPf + i.employerNps - L.employerRetirementCap);
  const car = carPerquisite(i, rules);
  const grossSalary =
    i.basic + i.hra + i.special + i.otherAllowances + i.bonus + i.lta + i.employerNps + retirementExcess +
    i.gratuityReceived + i.leaveEncashment + i.mealCards + i.gifts + car + i.esopPerquisite +
    i.childEduAllowance + i.hostelAllowance;
  const hraExempt = old ? hraExemption(i) : 0;
  const ltaExempt = old ? Math.min(i.ltaClaimed, i.lta) : 0;
  // these apply in BOTH regimes
  const gratuityExempt = gratuityExemption(i, rules);
  const leaveExempt = leaveExemption(i, rules);
  const mealExempt = Math.min(i.mealCards, L.mealPerMeal * L.mealsPerYear);
  const giftExempt = i.gifts <= L.giftLimit ? i.gifts : 0; // over the limit, the whole value is taxed
  // children's education and hostel allowances: old regime only
  const childExempt = old
    ? Math.min(i.childEduAllowance, L.childEducationPerMonth * 12 * children) +
      Math.min(i.hostelAllowance, L.hostelPerMonth * 12 * children)
    : 0;
  const otherExempt = mealExempt + giftExempt + childExempt;
  const exempt = hraExempt + ltaExempt + gratuityExempt + leaveExempt + otherExempt;
  const standardDeduction = Math.min(rules[regime].standardDeduction, pos(grossSalary - exempt));
  const professionalTax = old ? Math.min(i.professionalTax, L.professionalTaxMax) : 0;
  const salaryIncome = pos(grossSalary - exempt - standardDeduction - professionalTax);

  // 2. House property: let-out = rent - municipal tax - 30% - loan interest; own home = minus interest
  const annualValue = pos(i.rentReceived - i.municipalTax);
  const letOut = annualValue - annualValue * L.letOutStandardDeduction - i.rentalLoanInterest;
  const selfOccupied = old ? -Math.min(i.homeLoanInterest, L.homeLoanSelfOccupied) : 0;
  let houseProperty = letOut + selfOccupied;
  // a loss cuts other income by at most 2 lakh (old); the new regime does not allow it at all
  if (houseProperty < 0) houseProperty = old ? Math.max(houseProperty, -L.housePropertyLossSetOff) : 0;

  // 3. Freelance income under the presumptive scheme: 50% of receipts is taken as profit
  const business = i.freelanceReceipts * rules.presumptive.rate;

  // 4. Other sources (family pension gets its own small deduction) and gains taxed at slab rates
  const familyPensionDeduction = Math.min(i.familyPension / 3, rules[regime].familyPensionDeduction);
  const otherSources = i.savingsInterest + i.fdInterest + i.otherIncome + i.familyPension - familyPensionDeduction;
  const grossTotal = pos(salaryIncome + houseProperty + business + otherSources + i.otherStcg);

  // 5. Deductions (Chapter VI-A). Only 80CCD(2) and 80CCH survive in the new regime.
  const disability = (level) => (level === 'severe' ? L.sec80DDSevere : level === 'disabled' ? L.sec80DD : 0);
  const d = {
    sec80CCD2: Math.min(i.employerNps, rules[regime].employerNpsPct * i.basic),
    sec80CCH: i.agniveer80CCH,
    sec80C: old ? Math.min(i.employeePf + i.inv80C, L.sec80C) : 0,
    sec80CCD1B: old ? Math.min(i.nps80CCD1B, L.sec80CCD1B) : 0,
    sec80D: old
      ? Math.min(i.healthSelf, senior ? L.sec80DSenior : L.sec80DSelf) +
        Math.min(i.healthParents, i.parentsSenior ? L.sec80DSenior : L.sec80DSelf)
      : 0,
    sec80DD: old ? disability(i.disabilityDependant) : 0,
    sec80DDB: old ? Math.min(i.medical80DDB, senior ? L.sec80DDBSenior : L.sec80DDB) : 0,
    sec80U: old ? disability(i.disabilitySelf) : 0,
    sec80E: old ? i.eduLoanInterest : 0,
    sec80G: old ? i.donations80G : 0,
    sec80TTA: old && !senior ? Math.min(i.savingsInterest, L.sec80TTA) : 0,
    sec80TTB: old && senior ? Math.min(i.savingsInterest + i.fdInterest, L.sec80TTB) : 0,
    extra: old ? extraDeduction : 0,
  };
  // 80GG is worked out last, on the income left after every other deduction
  const beforeGG = Object.values(d).reduce((a, b) => a + b, 0);
  d.sec80GG = old ? sec80GG(i, pos(grossTotal - beforeGG), rules) : 0;
  // deductions can bring the income to zero, not below
  const deductions = Math.min(beforeGG + d.sec80GG, grossTotal);
  const normalTaxable = round10(grossTotal - deductions);
  const gains = { stcg: i.stcgEquity, ltcg: i.ltcgEquity, otherLtcg: i.otherLtcg };
  const specialGains = gains.stcg + gains.ltcg + gains.otherLtcg;
  const totalIncome = normalTaxable + specialGains;

  // 6. Tax, then marginal relief on the surcharge: crossing 50 lakh by 10,000 must not cost more
  // than 10,000 in extra tax + surcharge
  const t = taxBeforeCess(regime, i.age, normalTaxable, gains, rules);
  let surchargeRelief = 0;
  if (t.surchargeRate > 0) {
    const threshold = [...rules.surcharge].reverse().find(([limit]) => totalIncome > limit)[0];
    const excess = totalIncome - threshold;
    if (excess <= normalTaxable) {
      const atThreshold = taxBeforeCess(regime, i.age, normalTaxable - excess, gains, rules);
      surchargeRelief = Math.min(t.surcharge, pos(t.beforeCess - (atThreshold.beforeCess + excess)));
    }
  }
  const beforeCess = t.beforeCess - surchargeRelief;
  const cess = beforeCess * rules.cess;
  const total = round10(beforeCess + cess);
  const grossIncome = grossSalary + pos(letOut) + i.freelanceReceipts + otherSources + i.otherStcg + specialGains;

  return {
    regime,
    grossSalary,
    perquisites: car + i.esopPerquisite + retirementExcess,
    retirementExcess,
    hraExempt,
    ltaExempt,
    gratuityExempt,
    leaveExempt,
    otherExempt,
    standardDeduction,
    professionalTax,
    salaryIncome,
    houseProperty,
    business,
    otherSources,
    gainsAtSlab: i.otherStcg,
    grossTotal,
    deductionItems: d,
    deductions,
    normalTaxable,
    stcg: gains.stcg,
    ltcg: gains.ltcg + gains.otherLtcg,
    totalIncome,
    slabRows: t.slab.rows,
    slabTax: t.slab.tax,
    // the rate on the next rupee of salary or interest (the top slab reached)
    marginalRate: [...t.slab.rows].reverse().find((row) => row.amount > 0)?.rate ?? 0,
    stcgTaxable: t.stcgTaxable,
    ltcgTaxable: t.ltcgTaxable,
    capitalGainsTax: t.stcgTax + t.ltcgTax,
    rebate: t.rebate,
    marginalRelief: t.marginalRelief,
    surchargeRate: t.surchargeRate,
    surcharge: t.surcharge - surchargeRelief,
    surchargeRelief,
    cess,
    total,
    effectiveRate: totalIncome > 0 && grossIncome > 0 ? total / grossIncome : 0,
  };
}

// What the employer deducts each month (TDS): tax on the salary and what you declared to them
// (home loan, rent, 80C...), not on side income you report yourself
export const SELF_REPORTED = [
  'savingsInterest',
  'fdInterest',
  'otherIncome',
  'familyPension',
  'freelanceReceipts',
  'rentReceived',
  'municipalTax',
  'rentalLoanInterest',
  'stcgEquity',
  'ltcgEquity',
  'otherStcg',
  'otherLtcg',
];

export function takeHome(regime, input, rules = RULES) {
  const i = { ...EMPTY_INPUT, ...input };
  const salaryOnly = { ...i, ...Object.fromEntries(SELF_REPORTED.map((k) => [k, 0])) };
  const salaryTax = computeTax(regime, salaryOnly, { rules }).total;
  // the monthly figures are on fixed pay only: bonus, gratuity and leave encashment are paid once,
  // and the tax on them is cut in the month they are paid
  const fixedTax = computeTax(regime, { ...salaryOnly, bonus: 0, gratuityReceived: 0, leaveEncashment: 0 }, { rules }).total;
  const pt = Math.min(i.professionalTax, rules.limits.professionalTaxMax); // deducted in both regimes
  // cash that reaches the bank every month (meal cards, gifts, the car and ESOPs are not cash)
  const fixedCash = i.basic + i.hra + i.special + i.otherAllowances + i.lta + i.childEduAllowance + i.hostelAllowance;
  return {
    salaryTax,
    monthlyTds: fixedTax / 12,
    monthlyInHand: (fixedCash - i.employeePf - pt - fixedTax) / 12,
    yearlyInHand: fixedCash + i.bonus + i.gratuityReceived + i.leaveEncashment - i.employeePf - pt - salaryTax,
  };
}

// Both regimes side by side, plus which one wins
export function compareRegimes(input, rules = RULES) {
  const oldR = computeTax('old', input, { rules });
  const newR = computeTax('new', input, { rules });
  return {
    old: { ...oldR, ...takeHome('old', input, rules) },
    new: { ...newR, ...takeHome('new', input, rules) },
    better: oldR.total < newR.total ? 'old' : newR.total < oldR.total ? 'new' : 'same',
    saving: Math.abs(oldR.total - newR.total),
    breakEven: breakEvenDeductions(input, rules, oldR.total, newR.total),
  };
}

// How many more rupees of old-regime deductions would make the old regime as cheap as the new one.
// 0 = old already wins or ties; null = no amount of deductions gets there (e.g. gains tax alone).
export function breakEvenDeductions(input, rules = RULES, oldTotal, newTotal) {
  const oldNow = oldTotal ?? computeTax('old', input, { rules }).total;
  const target = newTotal ?? computeTax('new', input, { rules }).total;
  if (oldNow <= target) return 0;
  let lo = 0;
  let hi = 100000000;
  if (computeTax('old', input, { rules, extraDeduction: hi }).total > target) return null;
  while (hi - lo > 100) {
    const mid = (lo + hi) / 2;
    if (computeTax('old', input, { rules, extraDeduction: mid }).total <= target) hi = mid;
    else lo = mid;
  }
  return Math.ceil(hi / 100) * 100;
}

// What stays the same whichever job you take: age, rent, investments, loans
export const PROFILE_KEYS = [
  'age',
  'professionalTax',
  'rentMonthly',
  'inv80C',
  'nps80CCD1B',
  'healthSelf',
  'healthParents',
  'parentsSenior',
  'homeLoanInterest',
  'eduLoanInterest',
  'donations80G',
  'disabilitySelf',
  'disabilityDependant',
  'medical80DDB',
];

// Two job offers on the same personal situation: each in its better regime.
// expectedPayout = the share of the variable pay you expect to really get (e.g. 0.8).
export function compareOffers(profile, offers, rules = RULES) {
  const same = Object.fromEntries(PROFILE_KEYS.map((k) => [k, profile[k] ?? EMPTY_INPUT[k]]));
  return offers.map((offer) => {
    const salary = splitCtc(offer);
    const variable = Math.round(salary.bonus * (offer.expectedPayout ?? 1));
    const input = {
      ...EMPTY_INPUT,
      ...same,
      ...salary,
      bonus: variable + (offer.joiningBonus ?? 0),
      metro: offer.metro,
    };
    const pick = (r) => (r.better === 'old' ? r.old : r.new);
    const result = compareRegimes(input, rules);
    const best = pick(result);
    // from the second year there is no joining bonus (and the better regime may change)
    const later = pick(compareRegimes({ ...input, bonus: variable }, rules));
    return {
      ...offer,
      salary,
      regime: result.better === 'old' ? 'old' : 'new',
      tax: best.total,
      monthlyInHand: best.monthlyInHand,
      firstYearCash: best.yearlyInHand,
      laterYearCash: later.yearlyInHand,
    };
  });
}
