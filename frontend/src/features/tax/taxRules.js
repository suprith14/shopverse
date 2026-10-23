// Indian income tax rules for a resident individual, FY 2026-27 (called "tax year 2026-27" under the
// Income-tax Act 2025, in force from 1 April 2026). Budget 2026 kept the slabs of FY 2025-26; the
// Income-tax Rules 2026 (notified 20 March 2026) changed several salary limits: HRA in 8 cities,
// meal cards, gifts, children's allowances and the company car. All rates and limits live here as
// data: next year's budget = edit this file only, the engine (taxEngine.js) and the tests stay.

const INF = Infinity;

export const RULES = {
  year: 'FY 2026-27',

  // New regime (the default since FY 2023-24): low rates, almost no deductions
  new: {
    slabs: [
      [400000, 0],
      [800000, 0.05],
      [1200000, 0.1],
      [1600000, 0.15],
      [2000000, 0.2],
      [2400000, 0.25],
      [INF, 0.3],
    ],
    exemption: 400000, // same for every age
    standardDeduction: 75000,
    familyPensionDeduction: 25000,
    rebate: { incomeLimit: 1200000, max: 60000, marginalRelief: true },
    surchargeCap: 0.25,
    employerNpsPct: 0.14, // 80CCD(2): employer NPS deductible up to 14% of basic + DA
  },

  // Old regime: higher rates, but HRA, LTA, 80C, 80D, home loan interest and more are allowed
  old: {
    exemption: { below60: 250000, senior: 300000, superSenior: 500000 },
    bands: [
      [500000, 0.05],
      [1000000, 0.2],
      [INF, 0.3],
    ],
    standardDeduction: 50000,
    familyPensionDeduction: 15000,
    rebate: { incomeLimit: 500000, max: 12500, marginalRelief: false },
    surchargeCap: 0.37,
    employerNpsPct: 0.1,
  },

  // Surcharge: an extra % of the tax once total income crosses each threshold
  surcharge: [
    [5000000, 0.1],
    [10000000, 0.15],
    [20000000, 0.25],
    [50000000, 0.37],
  ],
  cess: 0.04, // health and education cess, on tax + surcharge

  limits: {
    sec80C: 150000, // PF, VPF, PPF, ELSS, life insurance, tuition fees, home loan principal
    sec80CCD1B: 50000, // own NPS, over and above 80C
    sec80DSelf: 25000, // health insurance for self, spouse, children
    sec80DSenior: 50000, // the same when that person is 60+
    sec80TTA: 10000, // savings account interest, below 60
    sec80TTB: 50000, // all bank / post office interest, 60+
    sec80GGMonthly: 5000, // rent paid with no HRA in the salary
    sec80DD: 75000, // a dependant with a disability (severe: 1,25,000)
    sec80DDSevere: 125000,
    sec80DDB: 40000, // treatment of specified diseases (for someone 60+: 1,00,000)
    sec80DDBSenior: 100000,
    homeLoanSelfOccupied: 200000, // section 24(b) interest on your own home
    housePropertyLossSetOff: 200000, // most a house property loss can reduce other income by
    professionalTaxMax: 2500, // the Constitution caps it at 2,500 a year
    employerRetirementCap: 750000, // employer PF + NPS + superannuation above this is taxable
    letOutStandardDeduction: 0.3, // 30% of the rent's annual value, for repairs, whatever the actual cost
    gratuityExemptMax: 2000000, // lifetime, both regimes
    leaveEncashmentExemptMax: 2500000, // on leaving a job, lifetime, both regimes
    // Income-tax Rules 2026
    mealPerMeal: 200, // employer meal cards, both regimes
    mealsPerYear: 528, // assumed: 2 meals a working day, 22 days a month
    giftLimit: 15000, // employer gifts and vouchers a year, both regimes; above it the whole value is taxed
    childEducationPerMonth: 3000, // per child, at most 2 children, old regime
    hostelPerMonth: 9000,
    maxChildren: 2,
  },

  // Company car used for work and personal trips, running costs paid by the employer (both regimes)
  car: { small: 5000, large: 7000, driver: 3000 }, // per month; small = engine up to 1.6 litres

  // Freelance / professional side income under the presumptive scheme (section 44ADA)
  presumptive: { rate: 0.5, receiptsLimit: 7500000 }, // limit assumes at most 5% of receipts in cash

  capitalGains: {
    stcgRate: 0.2, // listed shares and equity funds, held up to 12 months
    ltcgRate: 0.125, // the same held over 12 months
    ltcgExemption: 125000,
    otherLtcgRate: 0.125, // property, gold, unlisted shares held over 24 months (no indexation)
    surchargeCap: 0.15,
  },

  // HRA: 50% of basic in these eight cities (four added by the Income-tax Rules 2026), 40% elsewhere
  metroCities: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Ahmedabad'],
};
