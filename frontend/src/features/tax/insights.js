// "Watch out" alerts: hidden effects of the rules that the totals alone don't show, worked out from
// the numbers entered (e.g. "you are 20,000 over the 12 lakh line: a raise here goes fully to tax").
// Pure function like the engine, so every rule is unit tested. It returns ids and values only; the
// words live in i18n (tax.alert.<id>.title / .text / extra parts), so they can be translated.
//
// level: 'warn' = costs you money or a notice; 'save' = a legal way to pay less; 'info' = good to know
// parts: which text keys to show, in order (most alerts: just 'text')

import { RULES } from './taxRules.js';
import { EMPTY_INPUT, compareRegimes, computeTax } from './taxEngine.js';
import { inr, pct } from './format.js';

const pos = (n) => Math.max(0, n);

export function findInsights(input, result, rules = RULES) {
  const i = { ...EMPTY_INPUT, ...input };
  const L = rules.limits;
  const n = result.new;
  const o = result.old;
  const chosen = result.better === 'old' ? o : n; // the regime you would pick
  const salary = i.basic + i.hra + i.special + i.otherAllowances + i.bonus + i.lta;
  const rent = i.rentMonthly * 12;
  const out = [];
  const add = (id, level, vars = {}, parts = ['text']) => out.push({ id, level, vars, parts });
  if (!salary && !n.totalIncome) return out;

  // ---- The 12 lakh line (new regime)
  const limit = rules.new.rebate.incomeLimit;
  if (n.marginalRelief > 0) {
    const over = n.totalIncome - limit;
    const npsRoom = pos(rules.new.employerNpsPct * i.basic - i.employerNps);
    add('marginalZone', 'warn', { income: inr(n.totalIncome), over: inr(over) }, npsRoom >= over ? ['text', 'nps'] : ['text']);
  }
  if (n.totalIncome <= limit && n.capitalGainsTax > 0) {
    add('rebateNotOnGains', 'warn', { tax: inr(n.capitalGainsTax) });
  } else if (n.salaryTax === 0 && n.total > 0) {
    const extra = n.otherSources + pos(n.houseProperty) + n.business + n.gainsAtSlab + n.stcg + n.ltcg;
    add('otherIncomePushesOver', 'warn', { extra: inr(extra), income: inr(n.totalIncome), tax: inr(n.total) });
  }

  // ---- Tax your employer does not deduct
  const selfTax = chosen.total - chosen.salaryTax;
  if (selfTax > 10000) {
    const noAdvanceTax = i.age !== 'below60' && !i.freelanceReceipts; // 60+ without business income
    // paying nothing until July: 234C about 5.05% (instalment shortfalls) + 234B 4% (April to July)
    const parts = noAdvanceTax ? ['senior'] : i.freelanceReceipts ? ['text', 'presumptive'] : ['text'];
    add('advanceTax', 'warn', { amount: inr(selfTax), interest: inr(selfTax * 0.0905) }, parts);
  }
  if (i.fdInterest > 0 && chosen.marginalRate > 0.1) {
    add('fdTds', 'warn', {
      rate: pct(chosen.marginalRate),
      gap: inr(i.fdInterest * (chosen.marginalRate - 0.1) * (1 + rules.cess)),
    });
  }

  // ---- 80C
  const used80C = i.employeePf + i.inv80C;
  if (result.better === 'new' && i.inv80C > 0) {
    add('investNoBenefit', 'info', { amount: inr(i.inv80C) });
  } else if (used80C > L.sec80C && i.inv80C > 0) {
    add('over80C', 'warn', { amount: inr(Math.min(i.inv80C, used80C - L.sec80C)), pf: inr(i.employeePf) });
  } else if (i.employeePf >= L.sec80C) {
    add('pfFills80C', 'info', { pf: inr(i.employeePf) });
  } else if (i.employeePf > 0 && result.better !== 'new') {
    add('pfIn80C', 'info', { pf: inr(i.employeePf), left: inr(L.sec80C - used80C) });
  }

  // ---- HRA and rent
  if (rent > 0 && i.hra === 0) {
    add('rentNoHra', 'info', { gg: inr(o.deductionItems.sec80GG) });
  } else if (rent > 0 && i.hra > 0 && o.hraExempt === 0) {
    add('rentTooLow', 'warn');
  } else if (i.hra > 0 && rent === 0) {
    add('hraTaxable', 'info', { amount: inr(i.hra) });
  }
  if (rent > 100000) add('landlordPan', 'info', { rent: inr(rent) });
  if (rent > 0 && !i.metro) add('nonMetro', 'info');

  // ---- Home loan
  if (i.homeLoanInterest > L.homeLoanSelfOccupied) {
    add('homeLoanCap', 'warn', { amount: inr(i.homeLoanInterest - L.homeLoanSelfOccupied) });
  } else if (i.homeLoanInterest > 0 && result.better === 'new') {
    add('homeLoanNew', 'info');
  }

  // ---- High incomes
  for (const [threshold] of rules.surcharge) {
    const over = chosen.totalIncome - threshold;
    if (over > 0 && over <= threshold * 0.1) add('surchargeEdge', 'warn', { over: inr(over), line: inr(threshold) });
  }
  if (n.retirementExcess > 0) add('retirementCap', 'warn', { amount: inr(n.retirementExcess) });

  // ---- Perquisites
  const best = (r) => Math.min(r.old.total, r.new.total);
  const mealRoom = L.mealPerMeal * L.mealsPerYear;
  if (i.mealCards === 0 && i.special > 0 && chosen.total > 0) {
    const moved = Math.min(mealRoom, i.special);
    const saving = best(result) - best(compareRegimes({ ...i, special: i.special - moved, mealCards: moved }, rules));
    if (saving >= 1000) add('mealCards', 'save', { saving: inr(saving), amount: inr(moved) });
  }
  if (i.mealCards > mealRoom) add('mealOver', 'info', { amount: inr(i.mealCards - mealRoom) });
  if (i.gifts > L.giftLimit) add('giftsOver', 'warn', { amount: inr(i.gifts) });
  if (i.companyCar !== 'none') add('carPerq', 'info', { amount: inr(n.perquisites - i.esopPerquisite - n.retirementExcess) });
  if (i.esopPerquisite > 0) add('esop', 'warn', { amount: inr(i.esopPerquisite) });
  if ((i.childEduAllowance > 0 || i.hostelAllowance > 0) && result.better !== 'old') add('childAllowance', 'info');

  // ---- Ways to pay less
  const npsRoom = pos(rules.new.employerNpsPct * i.basic - i.employerNps);
  const movable = Math.min(npsRoom, i.special);
  if (result.better !== 'old' && n.total > 0 && movable > 0) {
    const after = computeTax('new', { ...i, employerNps: i.employerNps + movable, special: i.special - movable }, { rules }).total;
    if (n.total - after >= 1000) add('employerNps', 'save', { saving: inr(n.total - after), amount: inr(movable) });
  }
  if (i.ltcgEquity > 0 && i.ltcgEquity <= rules.capitalGains.ltcgExemption) add('ltcgFree', 'save');
  else if (i.ltcgEquity > rules.capitalGains.ltcgExemption) add('ltcgHarvest', 'save');
  if (i.stcgEquity > 0) add('stcgHold', 'info');
  if (i.otherStcg > 0) add('debtSlab', 'info');
  if (i.otherLtcg > 0) add('propertyIndexation', 'info');

  // ---- Freelance side income
  if (i.freelanceReceipts > rules.presumptive.receiptsLimit) add('freelanceOverLimit', 'warn');
  if (i.freelanceReceipts > 2000000) add('freelanceGst', 'warn');
  if (i.freelanceReceipts > 0 && salary > 0) add('freelanceSideJob', 'info');

  // ---- Payroll surprises
  if (i.bonus > 0) add('bonusMonth', 'info');
  if (i.switchedJob) add('switchedJob', 'warn');
  if (i.gratuityReceived > 0 && i.yearsOfService < 5) add('gratuityYears', 'warn');
  if (i.gratuityReceived > n.gratuityExempt && n.gratuityExempt > 0) {
    add('gratuityTaxed', 'info', { amount: inr(i.gratuityReceived - n.gratuityExempt) });
  }
  if (salary > 300000 && i.professionalTax === 0) add('noPt', 'info');

  // ---- Choosing the regime
  if (result.better === 'old') add('declareOld', 'warn');
  // (skipped in the rebate / relief zone, where the next rupee is taxed at 0% or 100%, not the slab rate)
  if (chosen.total > 0 && !chosen.rebate && !chosen.marginalRelief) {
    add('marginalVsAverage', 'info', { top: pct(chosen.marginalRate), average: pct(chosen.effectiveRate) });
  }
  return out;
}
