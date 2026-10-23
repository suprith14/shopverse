# 24. Income tax calculator

**Where:** `/tax-calculator`. It opens in a new tab from **My account → Income tax calculator** and from a tile in the training portal. It is a public page with no login, and nothing is sent to the server.

**What it does:** works out Indian income tax for a salaried resident for FY 2026-27, in the **old and new regimes side by side**. It shows which regime is cheaper, by how much, and the monthly in-hand pay. It also compares two job offers and points out the hidden traps in your numbers.

**Rules used:**
- the slabs set in Budget 2025, which Budget 2026 kept unchanged
- the **Income-tax Rules 2026** (notified 20 March 2026, in force from 1 April 2026), which changed HRA, meal cards, gifts, children's allowances and the company car
- the **Income-tax Act 2025**, which renumbered the sections (80C → 123, 87A → 156). The page keeps the familiar old names and says so.

## Scenarios covered

| Area | Rules applied |
|---|---|
| Age | below 60 / 60-79 / 80+. The old-regime tax-free limit is ₹2.5 L / ₹3 L / ₹5 L. |
| Salary | basic, HRA, special, other allowances, bonus, LTA, employer PF, employer NPS, employee PF, professional tax |
| CTC → salary | a typical split: basic 40 or 50 %, HRA 50 % (8 cities) or 40 % of basic, PF capped or on full basic, gratuity 4.81 % of basic, variable pay %. Special allowance is the balance. |
| HRA (old) | the smallest of 3 amounts. **8 cities at 50 %** from FY 2026-27: Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad, Pune, Ahmedabad. No HRA in the salary → **80GG** (the smallest of ₹60k, 25 % of income, rent − 10 % of income). |
| Perks (Rules 2026) | meal cards ₹200 a meal (both regimes); gifts ₹15,000 (whole value taxed above it); company car ₹5,000 / ₹7,000 a month + ₹3,000 for a driver; ESOP gain on exercise; children's education ₹3,000 and hostel ₹9,000 per child per month (old regime, 2 children) |
| Standard deduction | ₹75,000 (new) / ₹50,000 (old). Professional tax is deductible in the old regime only. |
| Deductions (old) | 80C (employee PF included, ₹1.5 L cap), 80CCD(1B) ₹50k, 80D self and parents (₹25k / ₹50k), 24(b) home loan ₹2 L, 80E, 80G, 80TTA / 80TTB, 80DD / 80U (₹75k / ₹1.25 L), 80DDB (₹40k / ₹1 L) |
| Both regimes | 80CCD(2) employer NPS (14 % / 10 % of basic), 80CCH Agniveer; employer PF + NPS above ₹7.5 L is taxed |
| House property | let-out: rent − municipal tax − 30 % − interest. A loss is set off up to ₹2 L in the old regime and not at all in the new one. |
| Freelance | presumptive 44ADA: 50 % of receipts is income (₹75 L limit flagged) |
| Other income | savings, FD and other interest; family pension (minus a third, up to ₹15k old / ₹25k new) |
| Capital gains | listed equity: STCG 20 %, LTCG 12.5 % above ₹1.25 L. Property, gold and unlisted shares: 12.5 % long-term. Debt funds and short-term non-equity gains: slab rate. Unused basic exemption is used against gains; surcharge on gains is capped at 15 %. |
| Rebate 87A | new: up to ₹12 L taxable, with marginal relief, not against special-rate gains. Old: up to ₹5 L. |
| Surcharge | 10 / 15 / 25 / 37 % (new regime capped at 25 %), with marginal relief at each threshold |
| Cess and rounding | 4 % cess; income and tax rounded to the nearest ₹10 |
| Leaving a job | gratuity (15/26 × monthly basic × years, ₹20 L cap) and leave encashment (10 months' basic, ₹25 L cap, simplified), exempt in both regimes; "changed jobs this year" switch |
| Output | taxable income, slab-by-slab table, step-by-step working, monthly TDS and in-hand pay (fixed pay only), yearly in-hand, effective rate, and the **break-even** extra deductions needed for the old regime to win |

## Page features

- **8 ready-made scenarios:** fresher, ₹12.75 L zero tax, marginal relief, Bengaluru renter, home loan, ₹60 L with surcharge, senior, investor.
- **Less common sections fold away** until they hold a value.
- **Copy share link:** the inputs go in the URL `#s=` part, which is never sent to a server, and are checked field by field when the link is opened. The opener's own saved figures stay untouched until they edit.
- **Compare two job offers** (`OfferCompare.jsx`):
  - both offers use your profile (age, rent, deductions)
  - each offer is worked out in its better regime
  - monthly in-hand, cash in year 1 (with the joining bonus) and from year 2, and the CTC difference
- Reset, Print, Copy summary, a result bar on phones, and inputs remembered in localStorage.

## Hidden traps

- **Watch-out alerts** (`insights.js`): about 40 rules, each checked against the numbers entered, shown as Watch out / Save tax / Good to know. Examples:
  - the ₹12 L marginal-relief zone, where a raise goes fully to tax
  - other income breaking the rebate
  - advance tax, with the 234B/234C interest estimate
  - FD TDS lower than your slab
  - 80C filled by PF
  - the HRA traps
  - the meal-card and employer-NPS savings, worked out
  - gifts over ₹15,000
  - ESOP tax before you sell
  - property indexation choice
  - freelance limits, GST and moonlighting
  - Form 12B on a job switch
  - the belated-return lock-in
- **41 traps for everyone** (`traps.js`), in 6 groups: reading an offer letter, choosing the regime, rent and HRA, deductions, changing or leaving a job, filing the return.

The alerts return ids and values only; all words are in i18n (`tax.alert.*`, `tax.trap.*`) in **English and Kannada**. A test checks that every alert and trap has both.

**Not covered** (stated on the page): business income beyond the presumptive scheme, agricultural income, NRIs, section 89 relief, company-provided housing.

## Files

| File | Job |
|---|---|
| `frontend/src/features/tax/taxRules.js` | Every rate and limit, as data. Next budget = edit this file only. |
| `frontend/src/features/tax/taxEngine.js` | Pure functions: `computeTax`, `compareRegimes`, `takeHome`, `compareOffers`, `splitCtc`, `hraExemption`, `sec80GG`, `breakEvenDeductions` |
| `frontend/src/features/tax/insights.js`, `traps.js` | Alerts from your numbers, and the trap list (structure only; words in i18n) |
| `frontend/src/features/tax/share.js` | Share-link encode / decode, with validation |
| `frontend/src/features/tax/scenarios.js`, `format.js` | Scenario presets, ₹ formatting |
| `frontend/src/features/tax/TaxCalculatorPage.jsx`, `OfferCompare.jsx` | The page and the offer comparison |
| `frontend/src/features/tax/*.test.js` | 43 tests with hand-worked numbers (`npm test` in `frontend/`, also run in CI) |

## Why it is built this way

| Choice | Why | Alternatives |
|---|---|---|
| Runs in the browser | No personal salary data reaches the server; instant results while typing | An API endpoint (only needed to save results to an account) |
| Rules as data, engine as pure functions | Unit-testable without React; a new budget means a data change, not a code change | Rates written inside the component (hard to test, easy to break) |
| Alerts return ids + values, not sentences | The same rule works in every language; tests check the logic, not the wording | Sentences built in code (can't be translated) |
| Share code in the URL hash | Shareable with no backend, and never sent in requests | Saved scenarios on the server (needs storage, privacy rules) |
| `node --test` | Built into Node 24, no extra packages for pure modules | Vitest (worth adding when React components need tests) |
| Break-even by binary search | Handles slabs, caps, rebate and surcharge exactly, without special-case maths | A closed-form formula (breaks at every slab boundary) |

**Sources for the rates:** the Finance Act 2025 slabs, kept unchanged by Budget 2026, and the Income-tax Rules 2026. Re-check them against incometax.gov.in each February.
