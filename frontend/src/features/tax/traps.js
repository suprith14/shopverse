// "Hidden traps": rules that quietly cost salaried people money or bring a tax notice, grouped by
// when you meet them. Only the structure lives here; the words are in i18n (tax.trapGroup.<group>,
// tax.trap.<item>.title / .text), so they can be translated. FY 2026-27 rules.

export const TRAPS = [
  { id: 'offer', items: ['ctc', 'variable', 'joiningBonus', 'gratuity5', 'pfCap', 'perksInCtc', 'carLease', 'noticeBuyout', 'esopTwice'] },
  { id: 'regime', items: ['defaultNew', 'switchFiling', 'lateLock', 'businessOnce', 'compareYearly', 'newAct'] },
  { id: 'hra', items: ['metro8', 'parents', 'landlordPan', 'hraHomeLoan', 'noHra80GG'] },
  { id: 'deductions', items: ['c80', 'health', 'construction', 'jointLoan', 'employerNps', 'reimbursements', 'gifts15k', 'childAllowances'] },
  { id: 'leaving', items: ['twoEmployers', 'stdOnce', 'pfTransfer', 'leaveEnc', 'gratuityLimits'] },
  { id: 'filing', items: ['ais', 'deadlines', 'interest', 'dividends', 'losses', 'giftsRelatives', 'crypto', 'debtFunds'] },
];
