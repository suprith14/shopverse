// "Deep dive" part of every training module: worked examples with numbers, real templates,
// scenarios and checklists, plus two more quiz questions. Merged into the modules in modules.js.
// Extra block types: h (sub-heading), example ({ title, lines }), checklist ({ items }).

export const DEEP_DIVES = {
  // ------------------------------------------------------------------ business track
  'idea-to-live': {
    minutes: 8,
    blocks: [
      { type: 'h', text: 'A realistic timeline' },
      {
        type: 'table',
        head: ['Stage', 'Typical duration', 'What can go wrong'],
        rows: [
          ['Lead → RFP published', 'Weeks to months', 'The client already favours a vendor; you are there to make up numbers'],
          ['RFP → proposal submitted', '2-6 weeks', 'Rushed estimates, missed assumptions'],
          ['Shortlist → contract signed', '1-3 months', 'Legal stuck on liability and IP clauses; price pushed down'],
          ['Kickoff → requirements signed', '2-8 weeks', 'Stakeholders disagree; nobody can sign off'],
          ['Build', 'Months', 'Scope creep, key people leaving, late client inputs'],
          ['SIT + UAT', '3-8 weeks', 'Client users are busy; test data is missing'],
          ['Hypercare + warranty', '1-3 months', 'Support team not trained; defects argued over'],
        ],
      },
      {
        type: 'example',
        title: 'One deal, end to end (a fictional example)',
        lines: [
          'A retail chain wants an online store. Its procurement team publishes an **RFP** to five vendors.',
          'Your company decides to **bid**: it has retail experience and a free team in 2 months.',
          'Presales proposes a 6-month **fixed-price** build plus 12 months of **managed services** support.',
          'After orals, you are shortlisted with one other vendor; the client asks for a 10% discount. You agree to 6% and remove two optional features from scope.',
          'Legal signs the **MSA**, then the project **SOW**; the client issues a **PO**. Kickoff is in week 1 of month 3.',
          'UAT finds 40 defects; 3 are severity 1 and must be fixed before go-live. Go-live is moved by one week, agreed in a **change request**.',
          'After 4 weeks of **hypercare** the support team takes over, and the client asks for a mobile app: the next deal begins.',
        ],
      },
      { type: 'h', text: 'Where you, as a developer, fit in' },
      {
        type: 'list',
        items: [
          '**Presales**: estimating, a quick technical spike or POC, reviewing the solution for risks.',
          '**Requirements**: asking the questions that expose gaps before they become defects.',
          '**Build and test**: the work itself, plus honest status ("blocked on the client\'s API keys").',
          '**Go-live and hypercare**: being on call for the release, fixing defects fast, writing the runbook.',
          '**Handover**: documenting and explaining the system so others can support it.',
        ],
      },
    ],
    quiz: [
      { q: 'The client asks for a discount during negotiation. A healthy response is...', options: ['Accept any discount', 'Trade: lower price in exchange for less scope or better terms', 'Walk out', 'Secretly lower quality'], answer: 1, why: 'Price, scope and terms move together. A discount with nothing in return just cuts margin.' },
      { q: 'Which stage usually decides whether developers will be under pressure for months?', options: ['Hypercare', 'Estimation and pricing in presales', 'Closure', 'Onboarding'], answer: 1, why: 'An under-estimated bid creates a project that is late from day one.' },
    ],
  },

  'company-types': {
    minutes: 6,
    blocks: [
      { type: 'h', text: 'The numbers each type watches' },
      {
        type: 'table',
        head: ['Metric', 'Formula / meaning', 'Example'],
        rows: [
          ['Utilisation', 'Billable hours ÷ available hours', '136 billable of 160 available = 85%'],
          ['Bench cost', 'Salary of unallocated people', 'Why managers push to allocate people quickly'],
          ['Gross margin', '(Revenue − direct cost) ÷ revenue', '(210 − 115.5) ÷ 210 = 45%'],
          ['ARR (SaaS)', 'Recurring revenue per year', '1,000 customers × ₹12,000/year = ₹1.2 crore ARR'],
          ['Churn (SaaS)', 'Customers (or revenue) lost per period', '20 of 1,000 customers cancel in a month = 2% monthly churn'],
          ['Attrition', 'Employees leaving per year ÷ average headcount', 'A big cost in services: knowledge leaves with people'],
        ],
      },
      {
        type: 'example',
        title: 'Same feature, two companies',
        lines: [
          '**Product company**: "Add UPI payments" is a roadmap item. The PM measures conversion before and after. You may own that code for years.',
          '**Services company**: the same feature is a line in a client\'s SOW, priced at 120 person-days. Success means delivering it on time, within effort, accepted in UAT. Next year you may be on a different account.',
          '**GCC**: like the product company, but the "customer" is the parent company\'s business unit abroad, and priorities come from global teams.',
        ],
      },
      { type: 'h', text: 'Onsite, offshore, nearshore' },
      {
        type: 'list',
        items: [
          '**Onsite**: people working at the client\'s location (often abroad), at higher rates, close to the business.',
          '**Offshore**: the main team in the vendor\'s country (for example Bangalore), at lower rates.',
          '**Nearshore**: a nearby country in a similar time zone to the client.',
          'A common mix is a small onsite team (coordinator, architect) with a larger offshore team; time-zone overlap meetings are part of the day.',
        ],
      },
    ],
    quiz: [
      { q: '1,000 customers, 30 cancel this month. Monthly churn?', options: ['0.3%', '3%', '30%', '97%'], answer: 1, why: '30 ÷ 1,000 = 3%.' },
      { q: 'Why do services companies care so much about attrition?', options: ['It increases ARR', 'Knowledge and client relationships leave with people, and replacing them costs time and money', 'It improves utilisation', 'It does not matter'], answer: 1, why: 'Every exit means hiring, onboarding and knowledge transfer, often mid-project.' },
    ],
  },

  bidding: {
    minutes: 10,
    blocks: [
      { type: 'h', text: 'What an RFP actually looks like (excerpt)' },
      {
        type: 'code',
        lang: 'text',
        code: `RFP No. RET/IT/2026/014  -  E-commerce Platform Implementation

1. Background: 120 retail stores; no online channel today.
2. Scope: customer web store, admin portal, payment gateway integration,
   ERP integration (inventory and orders), 12 months of support.
3. Non-functional: 99.9% availability, page load under 3 s on 4G,
   WCAG 2.1 AA, data hosted in India.
4. Submission: technical and commercial proposals in separate files.
5. Evaluation: 70% technical, 30% commercial (QCBS).
6. Timeline: questions by 10 Nov; answers 17 Nov; proposals due 1 Dec.
7. Mandatory: ISO 27001 certificate, 3 similar projects in 5 years.`,
      },
      { type: 'h', text: 'Bid / no-bid scorecard' },
      {
        type: 'table',
        head: ['Question', 'Score 1-5', 'Notes'],
        rows: [
          ['Do we meet every mandatory criterion?', '5', 'ISO 27001 yes; 4 similar projects'],
          ['Do we have a relationship with the client?', '2', 'New logo, no contacts yet'],
          ['Can we staff it on time?', '4', 'A retail team finishes in January'],
          ['Is the margin attractive?', '3', 'Price-sensitive client'],
          ['Is the risk acceptable?', '3', 'ERP integration is unknown'],
          ['Strategic value?', '5', 'Opens the retail vertical in this region'],
        ],
      },
      { type: 'h', text: 'Pricing a team: a worked example' },
      {
        type: 'table',
        head: ['Role', 'Months of effort', 'Bill rate (USD / month)', 'Revenue'],
        rows: [
          ['Project manager', '6', '6,000', '36,000'],
          ['Architect (half time)', '3', '8,000', '24,000'],
          ['4 developers', '24', '4,500', '108,000'],
          ['2 QA engineers', '12', '3,500', '42,000'],
          ['**Total (T&M view)**', '**45**', '', '**210,000**'],
        ],
      },
      {
        type: 'example',
        title: 'Fixed price vs T&M with the same team',
        lines: [
          'Assume the people cost the company 55% of their bill rates: **115,500** for the planned effort.',
          '**T&M**: the client pays 210,000 for the planned effort. Margin = (210,000 − 115,500) ÷ 210,000 = **45%**. If effort grows, the client pays more and the margin stays 45%.',
          '**Fixed price**: add 15% contingency → price **241,500**. If effort goes as planned, margin = (241,500 − 115,500) ÷ 241,500 = **52.2%**.',
          'But if effort overruns by 20%, cost becomes 138,600 and margin falls to (241,500 − 138,600) ÷ 241,500 = **42.6%**. A 50% overrun would wipe out most of the margin.',
          'That is why fixed-price bids need detailed estimates, contingency and strong assumptions, while T&M suits uncertain scope.',
        ],
      },
      { type: 'h', text: 'A good clarification question' },
      {
        type: 'list',
        items: [
          'Weak: "Please share more details on the ERP." (vague, the answer will be vague)',
          'Strong: "Which ERP and version is used, does it expose REST or SOAP APIs for inventory and orders, and will the client provide a test environment by week 4?" (each answer changes the estimate)',
        ],
      },
    ],
    quiz: [
      { q: 'In the example, why does fixed price include 15% contingency?', options: ['Extra profit only', 'To absorb overruns, since the vendor carries the effort risk', 'Tax', 'Travel'], answer: 1, why: 'Without contingency, any overrun comes straight out of margin.' },
      { q: 'An RFP is scored 70% technical, 30% commercial. Which statement is true?', options: ['The cheapest bid always wins', 'A stronger solution can win even at a higher price', 'Price does not matter', 'Only the technical score counts'], answer: 1, why: 'QCBS combines both; a clearly better technical score can outweigh a higher price.' },
    ],
  },

  contracts: {
    minutes: 10,
    blocks: [
      { type: 'h', text: 'A SOW skeleton' },
      {
        type: 'code',
        lang: 'text',
        code: `STATEMENT OF WORK No. 3 under Master Services Agreement dated 12 Jan 2026

1. Objective     Launch an online store for 120 retail outlets.
2. Scope         Customer web store, admin portal, payment and ERP integration.
3. Out of scope  Mobile apps, data migration of orders older than 2 years,
                 content writing, third-party licence costs.
4. Deliverables  D1 Requirements (FRD)   D2 Design (HLD/LLD)   D3 Release 1
                 D4 UAT-ready Release 2  D5 Go-live           D6 Handover docs
5. Milestones & payments
                 M1 FRD signed ......... 15%    M2 Release 1 accepted .. 25%
                 M3 UAT sign-off ....... 30%    M4 Go-live ............. 20%
                 M5 End of warranty .... 10%
6. Acceptance    Client reviews each deliverable within 10 business days;
                 no response = deemed accepted.
7. Assumptions   ERP REST APIs and a test environment available by week 4;
                 client SMEs available 6 hours/week; max 2 review rounds.
8. Team          1 PM, 0.5 architect, 4 developers, 2 QA (offshore).
9. Change control  Any change via a signed change request (effort, cost, dates).
10. Warranty     60 days after go-live, defects fixed at no charge.
11. Price        USD 241,500 fixed, excluding taxes.`,
      },
      { type: 'h', text: 'Clauses worth understanding' },
      {
        type: 'table',
        head: ['Clause', 'What it means for the project'],
        rows: [
          ['Limitation of liability', 'Caps what the vendor pays if things go wrong; usually excludes data breaches or wilful misconduct, which may have higher caps'],
          ['Indemnity', 'One side covers the other\'s losses from specific events, e.g. IP infringement claims'],
          ['IP and licences', 'Who owns code and documents; whether open-source licences in the code are allowed'],
          ['Confidentiality', 'What you may not share, even after the contract ends'],
          ['Non-solicitation', 'Neither side hires the other\'s staff for a period'],
          ['Termination', 'For convenience (with notice) or for cause (breach); what happens to unpaid work'],
          ['Governing law and disputes', 'Which country\'s law applies; arbitration or courts, and where'],
          ['Service credits', 'Money off the invoice when SLAs are missed, usually capped at a % of monthly fees'],
        ],
      },
      { type: 'h', text: 'A change request, in practice' },
      {
        type: 'example',
        title: 'CR-007: "Add Cash on Delivery"',
        lines: [
          '**Request**: the client wants Cash on Delivery at checkout, which is not in the SOW.',
          '**Impact**: 18 person-days (checkout flow, order status, ERP mapping, tests); +1 week on Release 2; USD 4,050 at the agreed rate; risk: ERP needs a new payment type.',
          '**Options given**: (a) add it to Release 2 with a one-week shift, (b) deliver it after go-live in a minor release, (c) swap it for "product comparison", which has similar effort.',
          '**Decision**: the client picks (b); both sides sign. The plan, RAID log and budget are updated the same day.',
        ],
      },
      {
        type: 'checklist',
        items: [
          'Is the request really outside the signed scope? (Check the SOW and the requirements sign-off.)',
          'Effort, timeline and cost impact estimated by the team, not guessed by the manager',
          'Risks and dependencies listed',
          'Options offered (do it now, later, or swap for something of similar size)',
          'Signed by both sides before work starts',
          'Plan, budget and RAID log updated',
        ],
      },
    ],
    quiz: [
      { q: 'In the SOW above, when does the vendor receive the last 10%?', options: ['At kickoff', 'At go-live', 'At the end of the warranty period', 'Never'], answer: 2, why: 'Holding back a final payment until the warranty ends gives the client leverage to get defects fixed.' },
      { q: 'What does "deemed accepted" protect against?', options: ['Bugs', 'A client never reviewing a deliverable, blocking payment forever', 'Scope creep', 'Taxes'], answer: 1, why: 'Without a review deadline, unreviewed deliverables would stall milestone payments.' },
    ],
  },

  initiation: {
    minutes: 8,
    blocks: [
      { type: 'h', text: 'A business case on one page' },
      {
        type: 'example',
        title: 'Business case: online store for 120 outlets',
        lines: [
          '**Problem**: competitors sell online; our customers under 35 buy elsewhere.',
          '**Options**: (1) do nothing, (2) a marketplace listing only, (3) our own store.',
          '**Cost of option 3**: build USD 241,500 + support USD 60,000/year + marketing.',
          '**Benefit**: projected 3% of revenue moving online in year 2, plus customer data we do not have today.',
          '**Payback**: estimated 18 months; **key risk**: ERP integration and store staff adoption.',
          '**Ask**: approve the budget and appoint the Head of Digital as sponsor.',
        ],
      },
      { type: 'h', text: 'PERT in more depth' },
      {
        type: 'list',
        items: [
          'Estimate = (O + 4M + P) ÷ 6; uncertainty (standard deviation) ≈ (P − O) ÷ 6.',
          'Task: O = 4, M = 6, P = 14 days → estimate 7 days, deviation (14 − 4) ÷ 6 ≈ 1.7 days.',
          'Roughly: a 7-day plan is about a coin flip; 7 + 1.7 ≈ 9 days gives around 84% confidence. Commit to the number that matches the risk you can accept.',
          'Big gaps between O and P are a signal: split the task or run a spike to learn more before committing.',
        ],
      },
      { type: 'h', text: 'Stakeholder map (power / interest)' },
      {
        type: 'table',
        head: ['', 'Low interest', 'High interest'],
        rows: [
          ['**High power**', 'Keep satisfied (e.g. the CFO)', 'Manage closely (sponsor, Head of Digital)'],
          ['**Low power**', 'Monitor (other departments)', 'Keep informed (store managers, support team)'],
        ],
      },
      { type: 'h', text: 'Your first week on a new project' },
      {
        type: 'checklist',
        items: [
          'Read the SOW, the charter and the latest status report',
          'Get access: repositories, tickets, environments, VPN, documentation',
          'Find out who decides what (RACI) and how to escalate',
          'Run the project locally and deploy to a test environment',
          'Read the RAID log: which risks will affect your work?',
          'Ask your lead: "What does a great first month look like for me?"',
        ],
      },
    ],
    quiz: [
      { q: 'O = 2, M = 5, P = 20 days. What does the wide range suggest?', options: ['The estimate is precise', 'High uncertainty: split the task or run a spike', 'The task is easy', 'Use the optimistic number'], answer: 1, why: 'A large P − O means you know little; reduce uncertainty before committing.' },
      { q: 'A stakeholder with high power but low interest should be...', options: ['Ignored', 'Kept satisfied', 'Managed closely every day', 'Removed'], answer: 1, why: 'They can block the project, so keep them satisfied without overloading them with detail.' },
    ],
  },

  delivery: {
    minutes: 10,
    blocks: [
      { type: 'h', text: 'A weekly status report' },
      {
        type: 'code',
        lang: 'text',
        code: `Project: Retail Online Store    Week 14 of 26     Overall: AMBER

Schedule  AMBER  Release 2 at risk by 1 week (ERP test env delivered late)
Budget    GREEN  52% spent, 54% of work done
Scope     GREEN  1 CR approved (CR-007, after go-live)
Quality   GREEN  Defect leakage 3% (target < 5%)

Done this week   Checkout v2, order sync (ERP), 46 test cases automated
Next week        Payment refunds, SIT round 1 starts Thursday
Top risks        R4 ERP performance unknown under load (owner: Arjun, due 22 Nov)
Decisions needed Client to confirm refund rules by 18 Nov (blocking)`,
      },
      { type: 'h', text: 'Earned value: are we really on track?' },
      {
        type: 'table',
        head: ['Term', 'Meaning', 'Example'],
        rows: [
          ['PV (planned value)', 'Value of work planned by today', '100'],
          ['EV (earned value)', 'Value of work actually done', '80'],
          ['AC (actual cost)', 'Money spent so far', '90'],
          ['SPI = EV ÷ PV', 'Below 1 = behind schedule', '80 ÷ 100 = 0.80'],
          ['CPI = EV ÷ AC', 'Below 1 = over budget', '80 ÷ 90 ≈ 0.89'],
        ],
      },
      { type: 'p', text: 'In the example the project has done 80% of the planned work and spent more than that work was worth: behind schedule **and** over budget, even if the status report says "on track".' },
      { type: 'h', text: 'A requirements traceability matrix (RTM)' },
      {
        type: 'table',
        head: ['Req. id', 'Requirement', 'Design', 'Code / PR', 'Test cases', 'Status'],
        rows: [
          ['FR-12', 'Customer can pay with UPI', 'LLD §4.2', 'PR #231', 'TC-88, TC-89', 'Passed'],
          ['FR-13', 'Refund within 7 days', 'LLD §4.5', 'PR #240', 'TC-95', 'In progress'],
          ['NFR-3', 'Page load < 3 s on 4G', 'HLD §6', 'PR #198', 'PT-02', 'Failed (3.6 s)'],
        ],
      },
      { type: 'h', text: 'How a good escalation reads' },
      {
        type: 'example',
        title: 'Escalation email to the delivery manager',
        lines: [
          '**Subject**: ESCALATION: ERP test environment 9 days late, Release 2 at risk',
          '**Situation**: the client promised the ERP test environment by 5 Nov (SOW assumption 7.1). It is still unavailable on 14 Nov.',
          '**Impact**: integration work is blocked; Release 2 slips 1 week for every further week of delay.',
          '**Done so far**: 3 reminders to the client IT lead; we built mocks to continue other work.',
          '**Ask**: please raise it with the client sponsor in Thursday\'s steering committee; we need a date or a documented decision to move Release 2.',
        ],
      },
    ],
    quiz: [
      { q: 'PV 200, EV 150, AC 150. What is true?', options: ['On schedule and on budget', 'Behind schedule (SPI 0.75), on budget (CPI 1.0)', 'Ahead of schedule', 'Over budget'], answer: 1, why: 'SPI = 150 ÷ 200 = 0.75; CPI = 150 ÷ 150 = 1.0.' },
      { q: 'What makes an escalation effective?', options: ['Blaming people', 'Facts, impact, what was tried, and a clear ask', 'Using capital letters', 'Copying everyone in the company'], answer: 1, why: 'Escalation is a request for a decision; make it easy to decide.' },
    ],
  },

  'go-live': {
    minutes: 8,
    blocks: [
      { type: 'h', text: 'A cutover plan (excerpt)' },
      {
        type: 'table',
        head: ['Time (Sat)', 'Step', 'Owner', 'Rollback point?'],
        rows: [
          ['20:00', 'Freeze: no more orders in the old system; banner shown', 'Client ops', ''],
          ['20:15', 'Final data export from the old system', 'DBA', ''],
          ['20:45', 'Database backup taken and verified', 'DBA', '✓'],
          ['21:00', 'Run migrations, load data, reconcile counts (products, customers)', 'Dev lead', ''],
          ['22:30', 'Deploy release 1.0.0 to production', 'DevOps', '✓'],
          ['23:00', 'Smoke tests: login, search, checkout with a test card, admin order view', 'QA', ''],
          ['23:30', 'Go / no-go #2: open to the public, or roll back', 'All leads + client', '✓'],
          ['00:00', 'DNS switched; monitoring dashboards watched for 2 hours', 'DevOps', ''],
        ],
      },
      {
        type: 'checklist',
        items: [
          'UAT signed off; no open severity-1 or 2 defects',
          'Performance and security tests passed',
          'Backups taken and a restore tested',
          'Rollback steps written and rehearsed',
          'Monitoring and alerts on the new system',
          'Support team trained, with a runbook and an escalation list',
          'Client communication (users, stores, support desk) sent',
          'Change approved (CAB) for this time window',
        ],
      },
      { type: 'h', text: 'Severity, response and resolution' },
      {
        type: 'table',
        head: ['Priority', 'Example', 'Response', 'Resolution (target)'],
        rows: [
          ['P1 Critical', 'Checkout down for everyone', '15 min', '4 hours'],
          ['P2 High', 'Refunds failing; workaround exists', '1 hour', '1 business day'],
          ['P3 Medium', 'Report shows wrong totals', '4 hours', '5 business days'],
          ['P4 Low', 'Typo on a help page', '1 business day', 'Next release'],
        ],
      },
      { type: 'p', text: 'Response = someone is working on it; resolution = service restored (a workaround counts). Root-cause fixes then go through **problem management**.' },
      { type: 'h', text: 'Knowledge transfer that actually works' },
      {
        type: 'list',
        items: [
          '**Documents**: architecture overview, runbook (start, stop, deploy, roll back), known issues, FAQs.',
          '**Sessions**: recorded walkthroughs of the code, data model and integrations.',
          '**Shadowing**: the support team watches the project team handle tickets.',
          '**Reverse shadowing**: the support team handles tickets while the project team watches and helps.',
          '**Sign-off**: the support team confirms it can run the system before the project team leaves.',
        ],
      },
    ],
    quiz: [
      { q: 'Smoke tests fail at 23:00 in the cutover plan. What happens?', options: ['Open to the public anyway', 'Use the rollback point and decide at go/no-go', 'Wait until Monday', 'Delete the backup'], answer: 1, why: 'Rollback points exist so a failed cutover can return to a known good state.' },
      { q: 'Under the SLA above, a P2 issue gets a workaround in 3 hours. Is the resolution target met?', options: ['No, the code is not fixed', 'Yes, service restored with a workaround counts as resolution', 'Only if the client agrees in writing', 'SLAs do not apply to P2'], answer: 1, why: 'SLA resolution usually means restoring service; the permanent fix follows through problem management.' },
    ],
  },

  'company-life': {
    minutes: 8,
    blocks: [
      { type: 'h', text: 'A week in the life (services developer)' },
      {
        type: 'table',
        head: ['Day', 'Typical moments'],
        rows: [
          ['Monday', 'Sprint planning with the client over video; timesheet for last week due'],
          ['Tuesday', 'Standup, coding; a late-evening overlap call with the onsite coordinator'],
          ['Wednesday', 'Code reviews; a mandatory security training module before the deadline'],
          ['Thursday', 'Demo of the new feature; a client question about scope (send it to the PM, do not promise)'],
          ['Friday', 'Bug fixes; update the ticket status; plan the next sprint\'s capacity with your leave'],
        ],
      },
      { type: 'h', text: 'Writing goals that help your appraisal' },
      {
        type: 'example',
        title: 'Weak vs strong goals',
        lines: [
          'Weak: "Learn React." (not measurable, no link to the business)',
          'Strong: "By September, own the checkout module: deliver 3 features with no severity-1 defects in UAT, and reduce its page load from 4 s to under 2.5 s."',
          'Weak: "Help the team."',
          'Strong: "Run 4 knowledge-sharing sessions and mentor one new joiner through onboarding by December."',
          'Keep a **brag document**: every month, write down what you shipped, problems solved and feedback received. Appraisal time becomes easy.',
        ],
      },
      { type: 'h', text: 'How ratings, promotions and PIPs really work' },
      {
        type: 'list',
        items: [
          '**Calibration**: managers meet to compare ratings across teams, so "exceeds expectations" means the same everywhere. Your manager argues for you there with **evidence**: your brag document helps them.',
          'Many companies use a **distribution** (for example a limited share of top ratings), so a good year can still get a middle rating if the bar was high.',
          '**Promotion** usually needs proof that you already work at the next level (scope, impact, leading others) for some time, not just tenure.',
          'A **PIP** (performance improvement plan) sets specific goals and a deadline (often 30-90 days) when performance is below expectations. Take it seriously: agree measurable goals in writing, ask for weekly check-ins, and keep notes.',
          'Feedback goes both ways: ask for it regularly ("What is one thing I should do differently?"), not only at appraisal time.',
        ],
      },
      { type: 'h', text: 'Changing jobs professionally' },
      {
        type: 'list',
        items: [
          'Read your contract for the notice period, non-solicitation and any training bond before resigning.',
          'Resign in writing, then tell your manager in person or on a call, not by surprise in a meeting.',
          'Plan knowledge transfer: document your work, hand over tickets, introduce your replacement to contacts.',
          'Get your relieving and experience letters: the next employer\'s background verification will ask for them.',
          'Never take code, documents or client data with you, even "for reference".',
        ],
      },
    ],
    quiz: [
      { q: 'A client asks you directly to add a feature "quickly". Best response?', options: ['Add it tonight', 'Note it and route it to the PM for a change request', 'Ignore it', 'Promise a date'], answer: 1, why: 'Scope decisions go through the project manager and change control, even when asked kindly.' },
      { q: 'Which goal is strongest for an appraisal?', options: ['"Work hard"', '"Learn new things"', '"Reduce checkout load time to under 2.5 s by September"', '"Be a team player"'], answer: 2, why: 'Specific, measurable and tied to business value.' },
    ],
  },

  'compliance-finance': {
    minutes: 8,
    blocks: [
      { type: 'h', text: 'Revenue recognition: a fixed-price example' },
      {
        type: 'example',
        title: 'Recognising revenue by progress',
        lines: [
          'Contract price: **240,000**. Estimated total cost: **120,000**.',
          'After 3 months the team has spent **60,000** of the 120,000 estimated cost → **50%** complete (cost-to-cost method).',
          'Revenue recognised so far: 50% × 240,000 = **120,000**, even if the client has only paid the first milestone.',
          'If the estimate to complete rises to 150,000, progress becomes 60,000 ÷ 150,000 = 40% → revenue to date is revised down to 96,000. This is why delivery managers re-estimate honestly every month.',
        ],
      },
      { type: 'h', text: 'A GST invoice (domestic client)' },
      {
        type: 'table',
        head: ['Line', 'Amount (₹)'],
        rows: [
          ['Software development services, Milestone M2 (PO 4500012345)', '1,00,000'],
          ['CGST 9% (same state)', '9,000'],
          ['SGST 9% (same state)', '9,000'],
          ['**Total**', '**1,18,000**'],
          ['If the client is in another state: IGST 18% instead of CGST + SGST', '18,000'],
        ],
      },
      { type: 'p', text: 'GST invoices also need the supplier\'s and customer\'s GSTIN, the service code (SAC), a date, and a **unique consecutive serial number** for the financial year: exactly the gapless numbering ShopVerse\'s invoice counter guarantees.' },
      { type: 'h', text: 'What an ISO 27001 auditor asks a developer' },
      {
        type: 'list',
        items: [
          '"Show me how a code change reaches production." (tickets, PR review, CI, approvals)',
          '"Who has production database access, and when was it last reviewed?"',
          '"Where are secrets stored? How are they rotated?"',
          '"Show the last security training you completed."',
          '"What happens when someone leaves the team?" (access removed the same day)',
        ],
      },
      { type: 'callout', kind: 'rule', title: 'Evidence comes from habits', text: 'If every change has a ticket, a reviewed PR and a green pipeline, the audit evidence already exists. The audit only gets painful for teams that skip the process.' },
    ],
    quiz: [
      { q: 'Contract 240,000; cost so far 30,000 of 120,000 estimated. Revenue recognised (cost-to-cost)?', options: ['30,000', '60,000', '120,000', '240,000'], answer: 1, why: '30,000 ÷ 120,000 = 25% complete; 25% × 240,000 = 60,000.' },
      { q: 'A ₹1,00,000 service billed to a client in another state. GST?', options: ['CGST 9% + SGST 9%', 'IGST 18%', 'No GST', 'IGST 9%'], answer: 1, why: 'Inter-state supplies carry IGST; intra-state supplies split into CGST and SGST.' },
    ],
  },

  // ------------------------------------------------------------------ engineering track
  roles: {
    minutes: 6,
    blocks: [
      { type: 'h', text: 'A RACI example: "Add UPI payments"' },
      {
        type: 'table',
        head: ['Activity', 'PM', 'Designer', 'Tech lead', 'Developer', 'QA', 'Security'],
        rows: [
          ['Decide to build it', 'A', 'C', 'C', 'I', 'I', 'I'],
          ['Design the screens', 'C', 'A/R', 'C', 'C', 'I', 'I'],
          ['Choose the payment provider integration', 'C', 'I', 'A', 'R', 'I', 'C'],
          ['Build and unit test', 'I', 'C', 'A', 'R', 'C', 'I'],
          ['Test plan and sign-off', 'I', 'I', 'C', 'C', 'A/R', 'C'],
          ['Security review', 'I', 'I', 'C', 'C', 'I', 'A/R'],
        ],
      },
      { type: 'p', text: '**R** does it, **A** signs it off (exactly one per row), **C** is asked before, **I** is told after.' },
      { type: 'h', text: 'Junior, senior, staff: what changes' },
      {
        type: 'table',
        head: ['Level', 'Scope', 'You are trusted to...'],
        rows: [
          ['Junior', 'A task', 'Deliver well-defined tickets with guidance'],
          ['Mid', 'A feature', 'Deliver features end to end, ask good questions'],
          ['Senior', 'A system or team area', 'Design, review, unblock others, push back with data'],
          ['Staff / principal', 'Several teams', 'Set technical direction, solve cross-team problems'],
        ],
      },
      {
        type: 'example',
        title: 'Pushing back the right way',
        lines: [
          '**PM**: "Can we add order tracking to this sprint? It\'s a small change."',
          '**Weak**: "No, we are too busy." (opinion, no options)',
          '**Strong**: "Tracking needs the courier API, about 5 days. If it goes in, the refund fix moves to next sprint. Which matters more for this release?" (cost, trade-off, the decision stays with the PM)',
        ],
      },
    ],
    quiz: [
      { q: 'In a RACI, how many people are "A" for one activity?', options: ['None', 'Exactly one', 'Everyone', 'At least three'], answer: 1, why: 'One accountable person avoids "everyone thought someone else would decide".' },
      { q: 'What distinguishes a senior engineer?', options: ['Writing the most code', 'Owning a system area, designing, reviewing and unblocking others', 'Working longer hours', 'Avoiding meetings'], answer: 1, why: 'Seniority is about scope and impact on others, not output volume.' },
    ],
  },

  lifecycle: {
    minutes: 8,
    blocks: [
      { type: 'h', text: 'A one-page PRD template' },
      {
        type: 'code',
        lang: 'markdown',
        code: `# PRD: Bulk product import

## Problem
Admins add products one by one; launching a 300-product catalog takes days.

## Users
Store admins (2-5 per store), comfortable with Excel.

## Goals / success metrics
- Import 300+ products in under 10 minutes, end to end
- Zero partial imports (all rows or none)
- 80% of new catalogs added via import within 3 months

## Non-goals
- Importing images from local files (URLs only in v1)
- Deleting products through the import

## Requirements
1. Downloadable template with the current categories
2. Preview listing every problem by sheet, row and column
3. Re-importing updates existing products instead of duplicating

## Open questions
- Should stock in the file overwrite live stock? (Decision: no, see RFC)`,
      },
      { type: 'h', text: 'An RFC / tech design template' },
      {
        type: 'code',
        lang: 'markdown',
        code: `# RFC: Product import

Context      Why we are doing this (link to the PRD)
Proposal     Parse .xlsx on the server; dry run, then apply in one transaction
Alternatives CSV (no dropdowns, encoding issues); parsing in the browser
             (rules duplicated); importing row by row (partial imports)
Data model   No migration; matched by handle (slug) and SKU
API          GET /admin/products/import/template
             POST /admin/products/import?dryRun=true|false
Risks        Large files (5 MB limit); transaction time (batch inserts)
Rollout      Admin-only; test with the full sample catalog first
Open points  Image hosting for imported products`,
      },
      { type: 'callout', kind: 'shopverse', text: 'These two templates describe the import you built. In a company, they would have been written and reviewed **before** the code, and the review would likely have caught the "stock overwrite" question early, the same way your decision did.' },
      { type: 'h', text: 'Measuring after launch' },
      {
        type: 'list',
        items: [
          '**Adoption**: how many admins used the feature in its first month?',
          '**Outcome**: did the success metric move (catalog setup time)?',
          '**Quality**: errors, support tickets, rollbacks since launch.',
          'An **A/B test** compares two versions on random user groups when the effect is uncertain (common for checkout and pricing changes).',
        ],
      },
    ],
    quiz: [
      { q: 'Which belongs in a PRD rather than an RFC?', options: ['The database indexes', 'Success metrics and non-goals', 'The transaction timeout', 'Library choices'], answer: 1, why: 'The PRD defines the problem and success; the RFC defines the technical approach.' },
      { q: 'Why list alternatives in an RFC?', options: ['To make it longer', 'To show the choice was considered, and to let reviewers challenge it', 'It is legally required', 'Alternatives are never needed'], answer: 1, why: 'Reviewers can only judge a decision if they see what it was chosen over.' },
    ],
  },

  agile: {
    minutes: 8,
    blocks: [
      { type: 'h', text: 'Planning a sprint with real capacity' },
      {
        type: 'example',
        title: 'Capacity for a two-week sprint',
        lines: [
          '5 developers × 10 working days × 6 focused hours = **300 hours**.',
          'One developer is on leave for 2 days: −12 hours → **288 hours**.',
          'Ceremonies, reviews and interruptions take about 10% → 288 × 0.9 ≈ **259 hours** of real build time.',
          'In points: the last three sprints delivered 32, 28 and 30 → average **30 points**. Commit to about 30, not to the best sprint ever.',
        ],
      },
      { type: 'h', text: 'Running a useful retrospective' },
      {
        type: 'list',
        items: [
          'Format: what went well / what did not / what we will try. Or "start, stop, continue".',
          'Talk about the **process**, not people. Make it safe to say "I was confused".',
          'Leave with 1-3 action items, each with an owner and a date.',
          'Start the next retro by checking those actions; otherwise retros turn into complaint sessions.',
        ],
      },
      { type: 'h', text: 'Kanban metrics' },
      {
        type: 'table',
        head: ['Metric', 'Meaning', 'Why it matters'],
        rows: [
          ['Lead time', 'From request to done', 'What the customer experiences'],
          ['Cycle time', 'From "in progress" to done', 'How fast the team finishes started work'],
          ['Throughput', 'Items finished per week', 'Forecasting without estimates'],
          ['WIP', 'Items in progress at once', 'Too high = everything slow (Little\'s law: cycle time = WIP ÷ throughput)'],
        ],
      },
    ],
    quiz: [
      { q: 'WIP is 12 items and throughput is 6 items per week. Average cycle time (Little\'s law)?', options: ['0.5 weeks', '2 weeks', '6 weeks', '72 weeks'], answer: 1, why: 'Cycle time = WIP ÷ throughput = 12 ÷ 6 = 2 weeks.' },
      { q: 'Velocities were 32, 28, 30. A sensible commitment?', options: ['40', 'About 30', '15', 'As many as the PM wants'], answer: 1, why: 'Plan from the recent average, not the best case.' },
    ],
  },

  tickets: {
    minutes: 6,
    blocks: [
      { type: 'h', text: 'Splitting a big story' },
      {
        type: 'example',
        title: '"Customers can return products" is too big for one sprint',
        lines: [
          'Split by **workflow step**: request a return → approve or reject → refund.',
          'Split by **rule**: returns within 7 days first; damaged-item rules later.',
          'Split by **user**: customer screens first; admin review screens next.',
          'Each slice must still be usable and testable on its own: "build the database table" alone is a task, not a story.',
        ],
      },
      { type: 'h', text: 'INVEST: a good story is...' },
      {
        type: 'table',
        head: ['Letter', 'Means'],
        rows: [
          ['I', 'Independent of other stories where possible'],
          ['N', 'Negotiable: details are discussed, not fixed upfront'],
          ['V', 'Valuable to a user or the business'],
          ['E', 'Estimable: clear enough to size'],
          ['S', 'Small: fits in a sprint'],
          ['T', 'Testable: acceptance criteria can be checked'],
        ],
      },
      {
        type: 'checklist',
        items: [
          'Code merged after review',
          'Unit and API tests added and passing',
          'Acceptance criteria demonstrated',
          'Works on mobile and in dark mode (where relevant)',
          'Accessible: keyboard and screen reader checked',
          'Docs and changelog updated',
          'Deployed, and monitoring shows no new errors',
        ],
      },
    ],
    quiz: [
      { q: 'Which is a story rather than a task?', options: ['"Create the returns table"', '"Customer can request a return within 7 days"', '"Upgrade Express"', '"Refactor utils"'], answer: 1, why: 'Stories deliver something a user can do; tables and upgrades are tasks.' },
      { q: 'In INVEST, "T" means...', options: ['Technical', 'Testable', 'Timed', 'Tiny'], answer: 1, why: 'If a story cannot be tested, nobody can say when it is done.' },
    ],
  },

  git: {
    minutes: 8,
    blocks: [
      { type: 'h', text: 'A PR description that reviewers love' },
      {
        type: 'code',
        lang: 'markdown',
        code: `## What
Bulk product import from Excel: template download, dry-run preview,
all-or-nothing import.

## Why
Adding 300 products by hand takes days (PRD-14).

## How
- Server-side parsing (exceljs); one column definition for template + parser
- Dry run → plan → apply in one transaction; batch inserts
- Stock only set for new variants (avoids overwriting live stock)

## Testing
- 8 API tests (dry run vs apply, re-import, errors by row, SKU conflicts)
- Full sample catalog: 323 products imported in ~5 s on the test database

## Screenshots
(preview with errors, import complete)

## Risks / follow-ups
- Images are placeholders; real photos to be uploaded in admin`,
      },
      { type: 'h', text: 'Review comments: weak vs strong' },
      {
        type: 'table',
        head: ['Weak comment', 'Strong comment'],
        rows: [
          ['"This is wrong."', '"If `items` is empty, `Math.min(...[])` returns Infinity, so basePrice becomes Infinity. Can we guard for zero variants?"'],
          ['"Why did you do this?"', '"I would have expected a transaction here; is there a reason the two writes are separate?"'],
          ['"Rename this."', '"nit: `data` → `importPlan` would make the next function easier to follow."'],
        ],
      },
      { type: 'h', text: 'Everyday Git situations' },
      {
        type: 'table',
        head: ['Situation', 'Command', 'Note'],
        rows: [
          ['Update your branch with main', '`git fetch origin` then `git rebase origin/main`', 'Resolve conflicts, then `git push --force-with-lease` (your own branch only)'],
          ['Undo a commit already on main', '`git revert <sha>`', 'Creates a new commit that undoes it; history stays honest'],
          ['Unstage a file', '`git restore --staged <file>`', 'The change stays in your working folder'],
          ['Save work quickly', '`git stash` / `git stash pop`', 'Better: commit on a branch'],
          ['Find which commit broke something', '`git bisect`', 'Binary search through history'],
        ],
      },
      { type: 'callout', kind: 'mistake', text: '`git push --force` on a shared branch overwrites colleagues\' commits. Use `--force-with-lease`, which refuses if someone else pushed in the meantime, and only on your own branches.' },
    ],
    quiz: [
      { q: 'A bad commit is already on main and others pulled it. How do you undo it?', options: ['git reset --hard and force-push', 'git revert <sha>', 'Delete the repository', 'Edit the commit message'], answer: 1, why: 'Revert adds a new commit; rewriting shared history breaks everyone else\'s copy.' },
      { q: 'Why "--force-with-lease" instead of "--force"?', options: ['It is faster', 'It refuses to overwrite commits you have not seen', 'It skips CI', 'No difference'], answer: 1, why: 'It protects against silently deleting someone else\'s pushed work.' },
    ],
  },

  quality: {
    minutes: 8,
    blocks: [
      { type: 'h', text: 'Writing test cases (QA style)' },
      {
        type: 'table',
        head: ['Id', 'Scenario', 'Steps', 'Expected'],
        rows: [
          ['TC-01', 'Valid import', 'Upload the sample catalog → Check file', '0 problems; 323 new products listed'],
          ['TC-02', 'Wrong price', 'Price "free" on row 2 → Check file', '"Products row 2, Price (USD)" error; nothing saved'],
          ['TC-03', 'Duplicate SKU', 'Same SKU on rows 2 and 3', 'Error on row 3 naming row 2'],
          ['TC-04', 'Re-import', 'Import, then check the same file again', 'All products "No change"'],
          ['TC-05', 'Not Excel', 'Upload a .csv renamed to .xlsx', '"Upload an Excel .xlsx file"'],
        ],
      },
      { type: 'h', text: 'Techniques for choosing test inputs' },
      {
        type: 'list',
        items: [
          '**Equivalence partitioning**: one value per group that behaves the same (a valid price, a negative price, text).',
          '**Boundary values**: test at and around the limits (price 0.00, 0.01, 100000, 100000.01; 8 and 9 images).',
          '**State transitions**: an order goes pending → paid → shipped; test the illegal jumps too (shipped → pending).',
          '**Exploratory testing**: time-boxed, curious use of the app looking for surprises; the bugs scripts miss.',
        ],
      },
      { type: 'h', text: 'Non-functional testing' },
      {
        type: 'table',
        head: ['Type', 'Question', 'Tools'],
        rows: [
          ['Performance / load', 'How does it behave with 500 users at once?', 'k6, JMeter, Gatling'],
          ['Security', 'Can it be broken into?', 'OWASP ZAP, dependency scans, pen tests'],
          ['Accessibility', 'Can everyone use it?', 'axe, Lighthouse, a real screen reader'],
          ['Compatibility', 'Does it work across browsers and devices?', 'Playwright on several browsers, real phones'],
        ],
      },
    ],
    quiz: [
      { q: 'Images must be between 1 and 8. Which values test the boundaries?', options: ['3 and 5', '0, 1, 8 and 9', 'Only 4', '100'], answer: 1, why: 'Bugs cluster at the edges: just inside and just outside each limit.' },
      { q: 'Which finds problems scripted tests often miss?', options: ['Unit tests', 'Exploratory testing', 'Linting', 'Type checks'], answer: 1, why: 'A curious human tries paths nobody thought to script.' },
    ],
  },

  release: {
    minutes: 8,
    blocks: [
      { type: 'h', text: 'A CI pipeline for a repo like ShopVerse' },
      {
        type: 'code',
        lang: 'yaml',
        code: `# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  store:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: frontend } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm, cache-dependency-path: frontend/package-lock.json }
      - run: npm ci
      - run: npm run build

  api:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: backend } }
    env:
      TEST_DATABASE_URL: \${{ secrets.TEST_DATABASE_URL }}   # a separate test database
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm, cache-dependency-path: backend/package-lock.json }
      - run: npm ci
      - run: npm audit --omit=dev --audit-level=critical
      - run: npm test`,
      },
      { type: 'p', text: 'Each app is its own job, so they run in parallel and a failure points straight at the broken part. Secrets come from the repository settings, never from the file.' },
      { type: 'h', text: 'Semantic versioning' },
      {
        type: 'table',
        head: ['Change', 'Version bump', 'Example'],
        rows: [
          ['Breaking change to an API', 'MAJOR', '1.4.2 → 2.0.0'],
          ['New backwards-compatible feature', 'MINOR', '1.4.2 → 1.5.0'],
          ['Bug fix', 'PATCH', '1.4.2 → 1.4.3'],
        ],
      },
      { type: 'h', text: 'Feature flags in practice' },
      {
        type: 'code',
        lang: 'js',
        code: `// Ship the code dark, turn it on gradually
if (flags.isEnabled('new-checkout', { userId })) {
  return renderNewCheckout();
}
return renderOldCheckout();
// Rollout: staff → 5% → 25% → 100%, watching error rate and conversion.
// Then delete the flag and the old path: old flags are technical debt.`,
      },
    ],
    quiz: [
      { q: 'You add an optional field to an API response. Version bump?', options: ['MAJOR', 'MINOR', 'PATCH', 'None ever'], answer: 1, why: 'A backwards-compatible addition is a minor release.' },
      { q: 'Why remove a feature flag after full rollout?', options: ['Flags are illegal', 'Old flags and dead code paths become confusing technical debt', 'It speeds up Git', 'No reason'], answer: 1, why: 'Every leftover flag doubles the paths to understand and test.' },
    ],
  },

  operations: {
    minutes: 8,
    blocks: [
      { type: 'h', text: 'An incident, minute by minute' },
      {
        type: 'table',
        head: ['Time', 'Event'],
        rows: [
          ['19:02', 'Alert: checkout error rate 18% (normal < 1%)'],
          ['19:05', 'On-call engineer acknowledges; declares SEV-2; opens an incident channel'],
          ['19:09', 'Status page: "Some customers cannot complete checkout. Investigating."'],
          ['19:14', 'Errors started at 18:58, right after release 2.3.0 → decision: roll back'],
          ['19:21', 'Rollback complete; error rate back to 0.4%'],
          ['19:30', 'Status page: resolved. Monitoring for 30 minutes'],
          ['Next day', 'Blameless postmortem'],
        ],
      },
      { type: 'h', text: 'Postmortem template' },
      {
        type: 'code',
        lang: 'markdown',
        code: `# Postmortem: Checkout errors after release 2.3.0 (SEV-2)

Impact      19 minutes; ~140 failed checkouts; no data loss
Timeline    (as above)
Root cause  A new required field in the payment request was not sent by
            mobile Safari because of an untested autofill path
Five whys   Why did checkout fail? -> field missing
            Why missing? -> autofill skipped the input
            Why not caught? -> no Safari test in CI
            Why? -> browser matrix only covers Chromium
            Why? -> never prioritised
What went well   Fast detection (4 min), rollback in 7 min
Action items
  1. Add Safari (WebKit) to E2E tests         owner: Priya   due: 30 Nov
  2. Make the field optional server-side      owner: Arjun   due: 25 Nov
  3. Canary releases at 5% for checkout       owner: Ravi    due: 15 Dec`,
      },
      { type: 'h', text: 'The four golden signals' },
      {
        type: 'table',
        head: ['Signal', 'Watch', 'ShopVerse example'],
        rows: [
          ['Latency', 'p95 / p99 response time', 'Product page API under 300 ms'],
          ['Traffic', 'Requests per second', 'Spikes during a sale'],
          ['Errors', 'Rate of failed requests', '5xx answers (they already open the error popup)'],
          ['Saturation', 'How full resources are', 'Database connections, memory on Render'],
        ],
      },
    ],
    quiz: [
      { q: 'In the incident above, why roll back before finding the root cause?', options: ['Rollbacks are fun', 'Restoring service for customers comes first; investigation can happen safely afterwards', 'Root causes are unimportant', 'The postmortem required it'], answer: 1, why: 'Mitigation stops the damage; the root cause is analysed once users are safe.' },
      { q: 'Which is NOT one of the four golden signals?', options: ['Latency', 'Errors', 'Lines of code', 'Saturation'], answer: 2, why: 'The four are latency, traffic, errors and saturation.' },
    ],
  },

  security: {
    minutes: 10,
    blocks: [
      { type: 'h', text: 'Threat modelling with STRIDE' },
      {
        type: 'table',
        head: ['Threat', 'Question', 'Example defence (ShopVerse)'],
        rows: [
          ['**S**poofing', 'Can someone pretend to be another user?', 'Signed JWTs, refresh-token rotation with reuse detection'],
          ['**T**ampering', 'Can data be changed in transit or at rest?', 'HTTPS; Stripe webhook signature check on the raw body'],
          ['**R**epudiation', 'Can someone deny doing something?', 'Activity records, invoices with a verification QR'],
          ['**I**nformation disclosure', 'Can data leak?', '"Me" URLs, no personal data in logs, private uploads signed by the server'],
          ['**D**enial of service', 'Can the service be overwhelmed?', 'Rate limits, upload size limits (5 MB import)'],
          ['**E**levation of privilege', 'Can a user gain admin powers?', '`requireRole(\'ADMIN\')` on every admin route'],
        ],
      },
      { type: 'h', text: 'A vulnerable endpoint and its fix' },
      {
        type: 'code',
        lang: 'js',
        code: `// VULNERABLE: any logged-in user can read any order by changing the id (IDOR)
router.get('/orders/:id', requireAuth, async (req, res) => {
  res.json(await prisma.order.findUnique({ where: { id: req.params.id } }));
});

// FIXED: the query is scoped to the logged-in user
router.get('/orders/:id', requireAuth, async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: res.locals.user.id },
  });
  if (!order) throw notFound('Order not found'); // 404, not 403: don't confirm it exists
  res.json(order);
});`,
      },
      { type: 'h', text: 'When a secret leaks' },
      {
        type: 'steps',
        items: [
          { title: 'Rotate', text: 'Revoke the leaked key and issue a new one immediately.' },
          { title: 'Assess', text: 'Check the provider\'s logs: was the key used by anyone else?' },
          { title: 'Clean up', text: 'Remove it from the code and history, and fix how it leaked (a missing .gitignore, a log line).' },
          { title: 'Report', text: 'Tell the security team; personal data involved may trigger breach notification rules.' },
        ],
      },
      {
        type: 'checklist',
        items: [
          'Every route checks authentication and authorisation on the server',
          'Queries are scoped to the user or tenant',
          'Inputs validated (types, lengths, formats) before business logic',
          'No secrets in code, logs or error messages',
          'Uploads limited by size and type, checked on the server',
          'Dependencies scanned; no known critical vulnerabilities',
        ],
      },
    ],
    quiz: [
      { q: 'Changing /orders/41 to /orders/42 shows someone else\'s order. This is...', options: ['XSS', 'IDOR (broken access control)', 'CSRF', 'A feature'], answer: 1, why: 'Insecure Direct Object Reference: the server trusts the id without checking ownership.' },
      { q: 'Why answer 404 instead of 403 for someone else\'s order?', options: ['404 is faster', 'It does not confirm that the order exists', '403 is deprecated', 'No reason'], answer: 1, why: 'A 403 tells an attacker the id is real; 404 reveals nothing.' },
    ],
  },

  'case-study': {
    minutes: 10,
    blocks: [
      { type: 'h', text: 'Scaling the design: what breaks first' },
      {
        type: 'table',
        head: ['Load', 'What breaks', 'Next step'],
        rows: [
          ['1,000 users', 'Usually nothing; one API server and one database', 'Indexes, good queries, monitoring'],
          ['50,000 users', 'Database CPU; dashboards recalculating everything', 'Read replicas, caching analytics for minutes (Redis)'],
          ['WebSockets on several servers', 'Events only reach clients on the same server', 'Redis adapter (pub/sub) to broadcast across servers'],
          ['Huge workspaces', 'Board queries and payload size', 'Pagination, virtualised lists, partial loading'],
          ['Many tenants', 'Noisy neighbours slowing others', 'Per-tenant rate limits; isolate the biggest tenants'],
        ],
      },
      { type: 'h', text: 'Conflict handling: last write wins vs versions' },
      {
        type: 'code',
        lang: 'js',
        code: `// Optimistic concurrency: the client sends the version it edited
const result = await prisma.task.updateMany({
  where: { id: taskId, version: clientVersion },   // only if unchanged since read
  data: { title, version: { increment: 1 } },
});
if (result.count === 0) {
  throw conflict('Someone else changed this task. Reload to see their version.');
}`,
      },
      { type: 'p', text: '"Last write wins" (the PDFs\' choice) silently drops one user\'s edit. Versioning turns that into a clear conflict the user can resolve: more work, but no lost data.' },
      { type: 'h', text: 'How to present a design in an interview' },
      {
        type: 'steps',
        items: [
          { title: 'Clarify', text: 'Users, scale, must-have features, non-functional needs (latency, availability).' },
          { title: 'High level', text: 'Clients, API, database, cache, real-time channel, storage; draw the flow of one request.' },
          { title: 'Data model', text: 'Main tables and relationships; which queries must be fast (indexes).' },
          { title: 'Deep dive', text: 'Pick the hardest part (ordering, real-time, permissions) and go deep.' },
          { title: 'Trade-offs and scale', text: 'What breaks at 100x, and what you would change.' },
        ],
      },
    ],
    quiz: [
      { q: 'Two users edit the same task title at once with "last write wins". What happens?', options: ['Both titles are kept', 'One user\'s change is silently lost', 'The server crashes', 'The task is deleted'], answer: 1, why: 'The later save overwrites the earlier one without telling anyone.' },
      { q: 'Real-time events reach only users on the same server. The fix?', options: ['One giant server', 'A pub/sub adapter such as Redis to broadcast across servers', 'Polling every second', 'Disable WebSockets'], answer: 1, why: 'The adapter shares events between all server instances.' },
    ],
  },

  interview: {
    minutes: 8,
    blocks: [
      { type: 'h', text: 'Behavioural questions and what to show' },
      {
        type: 'table',
        head: ['Question', 'Show', 'ShopVerse story to use'],
        rows: [
          ['"Tell me about a mistake you made."', 'Ownership, learning, prevention', 'The shadow-database setting that wiped the dev database, and the rule you now follow'],
          ['"A time you disagreed with a decision."', 'Data over opinion; commit once decided', 'Choosing placeholders over risky photo sources'],
          ['"How do you handle unclear requirements?"', 'Questions, assumptions written down, small iterations', 'Dry run before import; asking which file failed before guessing'],
          ['"Something you are proud of."', 'Depth and impact', 'All-or-nothing import with a regression test for the jsonb bug'],
          ['"How do you keep learning?"', 'A habit, not a claim', 'One training module and one feature a day'],
        ],
      },
      { type: 'h', text: 'Questions to ask the interviewer' },
      {
        type: 'list',
        items: [
          '"What does a typical week look like for this role?"',
          '"How do code reviews and releases work here?"',
          '"What would you expect me to achieve in the first 90 days?"',
          '"What is the biggest challenge the team is facing right now?"',
          'For services roles: "Which client and domain would I work on, and what is the onsite / offshore setup?"',
        ],
      },
      { type: 'h', text: 'Salary and offer basics (India)' },
      {
        type: 'list',
        items: [
          '**CTC** (cost to company) includes items you do not receive monthly: employer PF, gratuity, insurance, variable pay. Ask for the **in-hand** monthly figure.',
          '**Variable pay** depends on company and personal performance; ask what was actually paid out last year.',
          'Check **notice period**, **joining bonus clawback** and any **bond** before accepting.',
          'Get the offer in writing; resign from your current job only after it is signed.',
        ],
      },
    ],
    quiz: [
      { q: 'The offer says CTC ₹18 lakh. What should you check?', options: ['Nothing, that is the salary', 'The in-hand monthly pay and what is variable or non-cash', 'Only the job title', 'The office address'], answer: 1, why: 'CTC includes PF, gratuity, insurance and variable pay; in-hand pay can be much lower.' },
      { q: '"Tell me about a mistake." Best approach?', options: ['Say you never make mistakes', 'Own it, explain the impact, what you learned and what you changed', 'Blame a colleague', 'Pick something trivial'], answer: 1, why: 'Interviewers look for ownership and a changed process, not perfection.' },
    ],
  },
};
