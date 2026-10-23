// Training modules covering the last gaps: HR policies and legal/tax basics (business track), and a
// "Leading teams" track. Indian rules are described as typical and as concepts, not advice: laws,
// tax rules and company policies change, and the employer's policy and a professional decide.

export const HR_LEGAL_MODULES = [
  {
    slug: 'hr-policies',
    track: 'business',
    title: 'HR policies explained: leave, pay, benefits and exit',
    minutes: 14,
    summary: 'What the HR policy and your payslip usually contain in an Indian IT company, so you can read your own with confidence.',
    blocks: [
      { type: 'callout', kind: 'rule', title: 'Your company\'s policy decides', text: 'This is what is **typical**. Exact leave days, allowances and rules differ by employer and state; your offer letter, employment contract and HR portal are the source of truth.' },
      {
        type: 'table',
        head: ['Leave type', 'Typical meaning'],
        rows: [
          ['Earned / privileged leave (EL/PL)', 'Accrues over the year; often carried forward or encashed up to a limit'],
          ['Casual leave (CL)', 'Short, unplanned needs; usually not carried forward'],
          ['Sick leave (SL)', 'Illness; a medical certificate may be needed for longer absences'],
          ['Maternity leave', '26 weeks for the first two children under the Maternity Benefit Act (as amended in 2017), for eligible employees'],
          ['Paternity / parental leave', 'Set by company policy; varies a lot'],
          ['Public / restricted holidays', 'Fixed national and festival holidays, plus a few you choose'],
          ['Comp off', 'A day off in return for working on a holiday or weekend, if the policy allows'],
        ],
      },
      { type: 'h', text: 'Reading your payslip' },
      {
        type: 'table',
        head: ['Component', 'What it is'],
        rows: [
          ['Basic', 'The core salary; PF and gratuity are calculated on it (with allowances, under the labour codes\' definition of wages)'],
          ['HRA', 'House Rent Allowance; can reduce tax under the old tax regime if you pay rent'],
          ['Special / flexible allowances', 'The rest of the fixed pay; some parts can be structured as tax-efficient benefits'],
          ['PF (Provident Fund)', 'Retirement savings: typically 12% of basic wages from you, matched by the employer'],
          ['Professional tax', 'A small state tax (capped at ₹2,500 a year), deducted in states that levy it'],
          ['TDS', 'Income tax deducted at source by the employer each month'],
          ['Variable pay / bonus', 'Paid based on company and personal performance, often yearly or quarterly'],
        ],
      },
      {
        type: 'list',
        items: [
          '**Gratuity**: paid when you leave after (generally) 5 years of continuous service: roughly 15 days of wages per year of service (15/26 × last monthly wages × years), with a statutory ceiling.',
          '**Form 16**: the yearly certificate of salary and tax deducted, used to file your income tax return.',
          '**Group health insurance**: usually covers you (and often family members) up to a sum insured; know what is covered before you need it.',
          '**ESOPs / RSUs**: shares or share options, mostly in product companies and startups; they "vest" over years (often with a 1-year "cliff").',
          '**Reimbursements**: internet, travel, learning budgets: submit claims with receipts before the deadline.',
        ],
      },
      { type: 'p', text: 'India\'s four **labour codes** (on wages, social security, industrial relations, and occupational safety) consolidate many older labour laws. They affect how wages, PF and gratuity are calculated, so check how your employer applies them.' },
      { type: 'h', text: 'Leaving the company' },
      {
        type: 'steps',
        items: [
          { title: 'Resignation', text: 'In writing through the HR system; the notice period starts (buy-out or early release only if the policy allows).' },
          { title: 'Handover', text: 'Knowledge transfer, documents, tickets and accesses handed over.' },
          { title: 'Exit formalities', text: 'Return the laptop and ID card; clearances from IT, finance and admin; exit interview.' },
          { title: 'Full and final settlement (F&F)', text: 'Last salary, leave encashment, deductions and (if eligible) gratuity, usually within the time the policy or law sets.' },
          { title: 'Letters', text: 'Relieving letter and experience letter: needed for your next background verification.' },
        ],
      },
      {
        type: 'list',
        items: [
          '**Grievance redressal**: the official route for complaints (your manager, HR, a grievance committee).',
          '**POSH Internal Committee**: for sexual harassment complaints, confidential by law.',
          '**Whistle-blower / ethics hotline**: for fraud, bribery or serious misconduct, often anonymous and protected against retaliation.',
        ],
      },
    ],
    quiz: [
      { q: 'Where is the final answer on how many leave days you get?', options: ['A blog', 'Your contract and the company\'s HR policy', 'Your friend\'s company', 'This training'], answer: 1, why: 'Policies differ by employer; the contract and HR portal are the source of truth.' },
      { q: 'PF is typically calculated as...', options: ['12% of total CTC', '12% of basic wages, from you and matched by the employer', 'A fixed ₹500', 'Optional for everyone'], answer: 1, why: 'Provident Fund contributions are a percentage of wages as defined in the rules, not of CTC.' },
      { q: 'What is Form 16?', options: ['A leave form', 'The yearly certificate of salary and tax deducted', 'An offer letter', 'A visa form'], answer: 1, why: 'You use it to file your income tax return.' },
      { q: 'What does F&F mean when you leave?', options: ['Friends and family', 'Full and final settlement of dues', 'Fast forward', 'Final feedback'], answer: 1, why: 'It settles last salary, leave encashment, deductions and gratuity if eligible.' },
      { q: 'Where would you report suspected fraud anonymously?', options: ['On social media', 'The whistle-blower / ethics hotline', 'In a team chat', 'Nowhere'], answer: 1, why: 'Ethics channels exist for this and protect reporters from retaliation.' },
    ],
  },

  {
    slug: 'legal-tax',
    track: 'business',
    title: 'Legal and tax basics for IT professionals',
    minutes: 14,
    summary: 'The laws and tax rules you will meet at work and with your own income, explained as concepts.',
    blocks: [
      { type: 'callout', kind: 'mistake', text: 'Treating this as legal or tax advice. It explains concepts so you can ask good questions. Laws and tax rules change (tax rules often every Budget); for decisions, check the official sources or a lawyer or chartered accountant.' },
      { type: 'h', text: 'Contracts in one minute' },
      {
        type: 'list',
        items: [
          'A contract needs an **offer**, an **acceptance**, something of value exchanged (**consideration**), and parties able to agree. In India this is governed by the **Indian Contract Act, 1872**.',
          'Email can form a binding agreement: "Yes, we agree to the revised price" from someone with authority may count. Be careful what you confirm in writing.',
          'Only authorised signatories can sign for the company; a developer saying "sure" on a call does not change a contract, but it can create expectations and disputes.',
        ],
      },
      {
        type: 'table',
        head: ['Employment clause', 'In practice (India)'],
        rows: [
          ['Confidentiality', 'Applies during and after employment; enforceable'],
          ['IP assignment', 'Work done for the employer belongs to it; read the scope for side projects'],
          ['Non-solicitation', 'Not poaching colleagues or clients for a period; often upheld if reasonable'],
          ['Non-compete after leaving', 'Restraints on working after you leave are generally not enforceable under Section 27 of the Contract Act, though restrictions during employment are'],
          ['Training bond', 'Repaying training costs if you leave early; courts look at whether the amount is a genuine cost, not a penalty'],
          ['Notice period', 'Binding; leaving without serving it can lead to deductions and problems with your relieving letter'],
        ],
      },
      { type: 'h', text: 'Laws you meet in IT work' },
      {
        type: 'table',
        head: ['Law', 'Why developers care'],
        rows: [
          ['Information Technology Act, 2000', 'Legal basis for electronic records and signatures; offences such as hacking and data theft'],
          ['CERT-In directions (2022)', 'Many organisations must report certain cyber incidents to CERT-In within 6 hours and keep logs for a set period'],
          ['DPDP Act, 2023', 'Consent, purpose limits, user rights and breach duties for personal data'],
          ['Consumer Protection (E-Commerce) Rules, 2020', 'Online stores must show seller details, prices and return policies clearly, and name a grievance officer'],
          ['Copyright Act, 1957', 'Software is protected as a literary work; covers code, docs and designs'],
        ],
      },
      { type: 'callout', kind: 'shopverse', text: 'If ShopVerse took real orders in India, the e-commerce rules would apply: seller details, a clear returns and refund policy, and a grievance officer contact in the footer. The new footer and the GST-ready invoice numbering are a start.' },
      { type: 'h', text: 'Your own income tax' },
      {
        type: 'list',
        items: [
          'India has two regimes: the **new regime** (the default since FY 2023-24, lower rates, few deductions) and the **old regime** (higher rates, but deductions such as Section 80C investments up to ₹1.5 lakh, HRA and home-loan interest). You can compare and choose under the rules for salaried employees.',
          'Tell your employer your choice and investments early in the year (investment declaration), and submit proofs when asked, so the monthly TDS is right.',
          'File your income tax return by the due date using Form 16, your AIS (annual information statement) and Form 26AS.',
          'Slabs and limits change in most Budgets: use the official income tax portal\'s calculator for the current year.',
          'From 1 April 2026 the **Income-tax Act 2025** replaced the 1961 Act and renumbered the sections (80C is now section 123), and the **Income-tax Rules 2026** raised several salary limits: HRA at 50% of basic in 8 cities (Bengaluru, Hyderabad, Pune and Ahmedabad added), meal cards ₹200 a meal in both regimes, employer gifts ₹15,000.',
        ],
      },
      { type: 'callout', kind: 'shopverse', text: 'Try your own numbers in the **Income tax calculator** (My account, or /tax-calculator): old vs new regime side by side, CTC to in-hand, alerts for the hidden traps in your figures, and a comparison of two job offers.' },
      { type: 'h', text: 'Freelancing and side income' },
      {
        type: 'list',
        items: [
          'Check your employment contract first: many employers require approval for paid outside work ("moonlighting").',
          'Freelance income is taxable (as business or professional income); keep invoices and records.',
          '**GST registration** is generally required once your turnover from services crosses ₹20 lakh in a year (₹10 lakh in some special-category states), or earlier in specific cases.',
          'Services to foreign clients can be **exports of services**, which are zero-rated under GST when conditions are met (for example, filing a Letter of Undertaking, **LUT**).',
        ],
      },
    ],
    quiz: [
      { q: 'Your contract says you cannot work for a competitor for 2 years after leaving. In India, generally...', options: ['Fully enforceable', 'Post-employment non-competes are generally not enforceable under Section 27', 'It doubles your notice period', 'It means you must leave India'], answer: 1, why: 'Restraint of trade after employment is generally void, though confidentiality and non-solicitation can still apply.' },
      { q: 'Under the CERT-In directions, certain cyber incidents must be reported within...', options: ['6 hours', '30 days', '1 year', 'Never'], answer: 0, why: 'The 2022 directions require reporting covered incidents to CERT-In within 6 hours.' },
      { q: 'Which tax regime is the default for salaried people since FY 2023-24?', options: ['The old regime', 'The new regime', 'No tax regime', 'GST'], answer: 1, why: 'The new regime is the default; you can still choose the old one under the rules.' },
      { q: 'A freelancer earns ₹8 lakh a year from Indian clients (normal state). GST registration is generally...', options: ['Required immediately', 'Not yet required by turnover alone', 'Illegal', 'Only for goods'], answer: 1, why: 'The usual services threshold is ₹20 lakh (₹10 lakh in special-category states), with some exceptions.' },
      { q: 'A colleague on a call says "Sure, we\'ll do the extra feature for free." Is the contract changed?', options: ['Yes, automatically', 'Not by itself, but it creates expectations; contract changes need authorised, written agreement', 'Only on Fridays', 'Yes, if recorded'], answer: 1, why: 'Only authorised signatories change contracts, but casual promises cause disputes: route changes through the PM.' },
    ],
  },
];

export const LEADERSHIP_MODULES = [
  {
    slug: 'leading-team',
    track: 'leadership',
    title: 'From engineer to lead: leading a team',
    minutes: 14,
    summary: 'What changes when your job becomes making other people successful.',
    blocks: [
      {
        type: 'table',
        head: ['As an engineer you...', 'As a lead you...'],
        rows: [
          ['Measure success by your output', 'Measure it by the team\'s output and growth'],
          ['Solve problems yourself', 'Help others solve them, and remove what blocks them'],
          ['Get feedback on your code', 'Give feedback on people\'s work and behaviour'],
          ['Focus on the next task', 'Balance delivery, quality, people and the long term'],
        ],
      },
      {
        type: 'list',
        items: [
          '**Delegate outcomes, not steps**: "Make the import safe to run twice" instead of a list of functions to write. Agree how you\'ll check in, then step back.',
          'Keep some technical work, but stay off the critical path: if you are the bottleneck, the team waits for you.',
          '**Team stages** (Tuckman): forming, storming, norming, performing. Conflict in a new team is normal; help it move on.',
          '**Psychological safety**: people can admit mistakes and ask "stupid" questions without fear. It was the strongest factor in Google\'s Project Aristotle study of effective teams.',
        ],
      },
      { type: 'h', text: 'Running a 1:1' },
      {
        type: 'code',
        lang: 'text',
        code: `Weekly or fortnightly, 30 minutes. Their meeting, not a status update.

1. How are you doing? (really)
2. What's on your mind / blocking you?
3. Feedback, both directions
4. Growth: progress on their goals, an opportunity coming up
5. Notes: agreed actions, kept in a shared doc`,
      },
      { type: 'h', text: 'Giving feedback: the SBI model' },
      {
        type: 'example',
        title: 'Situation, Behaviour, Impact',
        lines: [
          '**Situation**: "In yesterday\'s client demo..."',
          '**Behaviour**: "...you answered the refund question with the exact numbers from the test run..."',
          '**Impact**: "...and the client approved the release on the spot. That was excellent preparation."',
          'For something to improve, the same shape works: "In this morning\'s standup (S), you said the API was done but the tests were failing (B); the QA team planned around it and lost half a day (I). Next time, can you share the real status even if it is not good news?"',
          'Specific, about behaviour (not personality), and private for criticism.',
        ],
      },
      { type: 'h', text: 'Managing up' },
      {
        type: 'list',
        items: [
          'Know your manager\'s goals and pressures; make your updates fit them.',
          'Bring problems **with** options and a recommendation.',
          'No surprises: share bad news early, with what you are doing about it.',
        ],
      },
    ],
    quiz: [
      { q: 'What is the best way to delegate?', options: ['Give exact steps and check every hour', 'Give the outcome and constraints, agree check-ins, then step back', 'Do it yourself', 'Assign it without explaining'], answer: 1, why: 'Delegating outcomes builds ownership and frees you for team-level work.' },
      { q: 'In SBI feedback, "B" stands for...', options: ['Blame', 'Behaviour', 'Budget', 'Background'], answer: 1, why: 'Feedback is about observable behaviour, not personality.' },
      { q: 'Who owns the agenda of a 1:1?', options: ['The manager', 'Mostly the team member', 'HR', 'The client'], answer: 1, why: 'A 1:1 is the team member\'s time for their concerns and growth.' },
      { q: 'A new team argues a lot about how to work. This stage is called...', options: ['Performing', 'Storming', 'Closing', 'Hypercare'], answer: 1, why: 'Storming is a normal stage; a lead helps the team agree on norms.' },
      { q: 'What did Google\'s Project Aristotle find mattered most for team effectiveness?', options: ['Office snacks', 'Psychological safety', 'Team size of exactly 5', 'Working hours'], answer: 1, why: 'Teams where people felt safe to take risks and speak up performed best.' },
    ],
  },

  {
    slug: 'hiring',
    track: 'leadership',
    title: 'Hiring: from headcount to a great first 90 days',
    minutes: 14,
    summary: 'How companies decide to hire, run fair interviews, and onboard people well.',
    blocks: [
      {
        type: 'steps',
        items: [
          { title: 'Headcount approval', text: 'A position must be in the budget (a "requisition"); replacements and new roles are approved by leadership and finance.' },
          { title: 'Job description (JD)', text: 'The outcomes of the role, must-have skills, nice-to-haves, level and location. Clear JDs attract the right people.' },
          { title: 'Sourcing', text: 'Referrals, the careers page, job boards, recruitment agencies, campus hiring. Recruiters track candidates in an ATS (applicant tracking system).' },
          { title: 'Interview loop', text: 'Screening call → technical round(s) → system design (for seniors) → behavioural / culture round → sometimes a manager or "bar-raiser" round.' },
          { title: 'Debrief', text: 'Interviewers submit written scores **before** discussing, then decide together against the role\'s bar.' },
          { title: 'Offer', text: 'Level, salary band, joining date; negotiation within the band; background verification.' },
          { title: 'Onboarding', text: 'A 30-60-90 day plan, a buddy, access ready on day one.' },
        ],
      },
      { type: 'h', text: 'Structured interviews and scorecards' },
      {
        type: 'table',
        head: ['Competency', '1 (no)', '3 (meets the bar)', '4 (strong)'],
        rows: [
          ['Problem solving', 'Needed the solution given', 'Solved with small hints; explained trade-offs', 'Solved independently; compared several approaches'],
          ['Code quality', 'Hard to follow; no edge cases', 'Clear, handles the main edge cases', 'Clean, tested, thought about failure'],
          ['Communication', 'Silent or unclear', 'Explained the thinking as they went', 'Adapted the explanation to the listener'],
        ],
      },
      {
        type: 'list',
        items: [
          'Ask every candidate for the same role the **same core questions**, scored against the same rubric. It is fairer and predicts performance better than unstructured chats.',
          'Watch for bias: **halo effect** (one strength colours everything), **affinity bias** ("like me"), first-impression bias. Written scores before the debrief reduce them.',
          'Never ask about religion, marital status, pregnancy plans or similar personal topics: irrelevant to the job and potentially discriminatory.',
          'As an interviewer: prepare, be on time, put the candidate at ease, leave time for their questions, and submit feedback the same day.',
        ],
      },
      { type: 'h', text: 'A 30-60-90 day onboarding plan' },
      {
        type: 'table',
        head: ['By day', 'Goal'],
        rows: [
          ['30', 'Set up, knows the system and people, first small fixes merged'],
          ['60', 'Owns small features end to end; joins on-call shadowing'],
          ['90', 'Delivers a medium feature independently; reviews others\' code'],
        ],
      },
      { type: 'callout', kind: 'interview', text: 'Knowing how hiring works also helps you as a candidate: expect structured questions, prepare examples for each competency, and ask what the interview loop looks like.' },
    ],
    quiz: [
      { q: 'Why do interviewers write their scores before the debrief?', options: ['To save paper', 'So others\' opinions do not influence them (less bias)', 'It is required by law', 'To finish early'], answer: 1, why: 'Independent written feedback prevents the loudest voice from deciding.' },
      { q: 'What is a requisition?', options: ['A complaint', 'An approved, budgeted position to hire for', 'A type of interview', 'A contract clause'], answer: 1, why: 'Hiring starts with an approved headcount in the budget.' },
      { q: 'Which interview question is inappropriate?', options: ['"Tell me about a hard bug you fixed"', '"Do you plan to have children soon?"', '"How would you design this API?"', '"Why this role?"'], answer: 1, why: 'Personal and family questions are irrelevant to the job and can be discriminatory.' },
      { q: 'The halo effect is...', options: ['A lighting problem', 'One strong trait making you rate everything higher', 'A testing technique', 'An onboarding step'], answer: 1, why: 'Rubrics per competency counter it.' },
      { q: 'A good day-30 goal for a new developer?', options: ['Rewrite the architecture', 'Set up, knows the system and people, first small fixes merged', 'Lead the team', 'Nothing yet'], answer: 1, why: 'Early goals focus on learning and small, safe contributions.' },
    ],
  },

  {
    slug: 'managing-performance',
    track: 'leadership',
    title: 'Managing performance, growth and pay',
    minutes: 13,
    summary: 'Goals, feedback, calibration, promotions and difficult conversations, from the manager\'s side.',
    blocks: [
      {
        type: 'list',
        items: [
          '**Goals** at the start of the cycle: a few, measurable, linked to team goals (OKRs or KPIs).',
          '**Continuous feedback**: small and frequent beats one big annual surprise. Nothing in a review should be new to the person.',
          '**Evidence**: keep notes through the year (wins, problems, feedback from others) so ratings are fair and specific.',
          '**Calibration**: managers compare ratings across teams; you present evidence for each person, and ratings may move to keep the bar consistent.',
        ],
      },
      { type: 'h', text: 'Handling underperformance fairly' },
      {
        type: 'steps',
        items: [
          { title: 'Find the cause', text: 'Unclear expectations? Missing skills? Personal issues? Wrong role? The fix depends on the cause.' },
          { title: 'Make expectations explicit', text: 'Specific, written, with examples of what "good" looks like.' },
          { title: 'Support', text: 'Pairing, training, more frequent check-ins.' },
          { title: 'Document', text: 'Dates, examples, agreed actions, progress: fair to the person and the company.' },
          { title: 'Formal plan if needed', text: 'A PIP with measurable goals and a timeline, involving HR. It should be a genuine chance to succeed, not a formality.' },
        ],
      },
      { type: 'h', text: 'Promotions and careers' },
      {
        type: 'list',
        items: [
          'A promotion case shows the person **already** working at the next level: scope, impact, influence, with examples.',
          'Career conversations at least twice a year: where do they want to grow (deeper technical, leadership, a new domain)?',
          'Not everyone wants to manage: senior individual-contributor paths (staff, principal, architect) are equally valuable.',
        ],
      },
      { type: 'h', text: 'Pay basics for managers' },
      {
        type: 'list',
        items: [
          '**Salary bands**: a range per level and location; offers and increments sit within it.',
          '**Compa-ratio** = salary ÷ midpoint of the band (1.0 = exactly mid-band). It helps spot people paid far below peers.',
          'Increments usually depend on the rating and on where someone is in the band.',
          'Pay details are confidential: never discuss one person\'s salary with another.',
        ],
      },
      { type: 'h', text: 'Retention' },
      {
        type: 'list',
        items: [
          'People leave managers and stagnation more often than companies: growth, recognition and a fair workload matter as much as money.',
          'Watch the signals: disengagement, declined opportunities, sudden changes in behaviour. Ask early, in 1:1s.',
          'A "stay interview" ("What would make you leave? What keeps you here?") is cheaper than an exit interview.',
        ],
      },
    ],
    quiz: [
      { q: 'A rating comes as a surprise to the employee at year end. What went wrong?', options: ['Nothing', 'Feedback was not continuous during the year', 'The rating scale', 'The calendar'], answer: 1, why: 'Regular feedback means the review only confirms what was already discussed.' },
      { q: 'Salary ₹18 lakh, band midpoint ₹20 lakh. Compa-ratio?', options: ['0.9', '1.1', '2.0', '18'], answer: 0, why: '18 ÷ 20 = 0.9: below the midpoint of the band.' },
      { q: 'First step when someone underperforms?', options: ['Start a PIP', 'Find the cause', 'Reduce their pay', 'Ignore it'], answer: 1, why: 'Unclear expectations, skills gaps and personal issues need different responses.' },
      { q: 'A strong promotion case shows the person...', options: ['Has worked here the longest', 'Already works at the next level, with examples', 'Asked many times', 'Is friends with the manager'], answer: 1, why: 'Promotions recognise demonstrated scope and impact.' },
      { q: 'What is a "stay interview"?', options: ['An exit survey', 'Asking current team members what keeps them and what might make them leave', 'A hiring round', 'A probation review'], answer: 1, why: 'It surfaces retention risks while there is still time to act.' },
    ],
  },

  {
    slug: 'budgets-planning',
    track: 'leadership',
    title: 'Budgets, planning and prioritisation',
    minutes: 13,
    summary: 'How teams get money and people, decide what to build first, and track spend.',
    blocks: [
      {
        type: 'list',
        items: [
          '**Annual operating plan (AOP)**: each year, departments plan their goals, headcount and budget; finance consolidates and leadership approves.',
          '**Headcount plan**: roles to hire, when, at what level and cost; often the biggest line in an engineering budget.',
          '**Capex vs opex**: building a long-lived system may be capitalised; cloud bills, licences and support are operating costs.',
          '**Forecast vs actuals**: every month or quarter, compare spend with the plan and explain the differences (variance).',
        ],
      },
      { type: 'h', text: 'Cloud costs (FinOps)' },
      {
        type: 'list',
        items: [
          'Tag resources by team and product, so each cost has an owner.',
          'Look for waste: idle servers, oversized databases, forgotten test environments, unused storage.',
          'Commit to discounts (reserved capacity, savings plans) only for steady, predictable usage.',
          'Show cost per unit: "₹0.40 per order processed" is more useful than a monthly total.',
        ],
      },
      { type: 'h', text: 'Prioritising with RICE' },
      {
        type: 'table',
        head: ['Feature', 'Reach (users/qtr)', 'Impact (0.25-3)', 'Confidence', 'Effort (person-months)', 'RICE score'],
        rows: [
          ['UPI payments', '5,000', '2', '80%', '2', '(5000 × 2 × 0.8) ÷ 2 = **4,000**'],
          ['Wishlist sharing', '2,000', '1', '50%', '1', '(2000 × 1 × 0.5) ÷ 1 = **1,000**'],
          ['Dark mode for admin', '50', '0.5', '100%', '0.5', '(50 × 0.5 × 1) ÷ 0.5 = **50**'],
        ],
      },
      { type: 'p', text: '**RICE = (Reach × Impact × Confidence) ÷ Effort.** It does not decide for you, but it makes the reasoning visible and comparable.' },
      {
        type: 'table',
        head: ['MoSCoW', 'Meaning'],
        rows: [
          ['Must have', 'The release fails without it'],
          ['Should have', 'Important, but there is a workaround'],
          ['Could have', 'Nice if time allows'],
          ['Won\'t have (this time)', 'Explicitly out, to manage expectations'],
        ],
      },
      { type: 'callout', kind: 'shopverse', text: 'The TaskFlow Feature Spec uses the same idea: MUST HAVE / GOOD TO HAVE / WOW FACTOR is MoSCoW in other words.' },
      { type: 'h', text: 'Quarterly planning' },
      {
        type: 'list',
        items: [
          'Set a few **OKRs** per quarter; plan capacity honestly (leave, support duty, tech-debt time).',
          'Leave buffer (often 10-20%) for the unexpected: incidents, urgent client requests.',
          'Review mid-quarter; drop or defer work openly when priorities change.',
        ],
      },
    ],
    quiz: [
      { q: 'Reach 1,000, impact 2, confidence 50%, effort 2. RICE score?', options: ['500', '1,000', '2,000', '4,000'], answer: 0, why: '(1000 × 2 × 0.5) ÷ 2 = 500.' },
      { q: 'In MoSCoW, "W" means...', options: ['Wow', 'Won\'t have this time', 'Weekly', 'Waterfall'], answer: 1, why: 'Saying what is out is as important as what is in.' },
      { q: 'What is the AOP?', options: ['An API protocol', 'The annual operating plan: goals, headcount and budget', 'A testing method', 'A leave policy'], answer: 1, why: 'Departments plan and get approval for the year through the AOP.' },
      { q: 'Which is a FinOps practice?', options: ['Tagging cloud resources by team to assign cost owners', 'Deleting backups to save money', 'Ignoring the cloud bill', 'Buying the biggest servers'], answer: 0, why: 'Cost ownership starts with knowing who uses what.' },
      { q: 'Why keep a buffer in quarterly plans?', options: ['To relax', 'Incidents and urgent requests always come', 'Finance requires 50%', 'No reason'], answer: 1, why: 'Plans without buffer fail at the first surprise.' },
    ],
  },

  {
    slug: 'stakeholders-org',
    track: 'leadership',
    title: 'Stakeholders, influence and the wider organisation',
    minutes: 12,
    summary: 'Getting things done across teams you do not manage, and communicating with leadership.',
    blocks: [
      {
        type: 'list',
        items: [
          '**Influence without authority**: most important work needs other teams. Build relationships before you need them; understand what they are measured on.',
          'Frame requests in their terms: "This removes 30 support tickets a week for your team" beats "we need this".',
          'Write things down: a short **decision document** (problem, options, recommendation, who decides, by when) moves faster than long meeting threads.',
        ],
      },
      { type: 'h', text: 'Presenting to executives' },
      {
        type: 'example',
        title: 'Answer first (the pyramid principle)',
        lines: [
          '**Start with the conclusion**: "We recommend delaying go-live by two weeks."',
          '**Then the reasons**: "Payment refunds fail in 3% of test cases; the ERP fix lands next week; a failed launch would cost more than the delay."',
          '**Then the evidence**, only as deep as they ask.',
          'Executives have minutes, not hours: one page, numbers, a clear ask ("approve the new date").',
        ],
      },
      { type: 'h', text: 'Resolving conflict between teams' },
      {
        type: 'steps',
        items: [
          { title: 'Separate people from the problem', text: 'Assume good intent; each team is optimising for its own goals.' },
          { title: 'Find the shared goal', text: 'Both teams want the launch to succeed; start there.' },
          { title: 'Lay out options with trade-offs', text: 'In writing, with data where possible.' },
          { title: 'Escalate together if stuck', text: 'Agree the facts, then go to a shared manager with one document, not two competing stories.' },
        ],
      },
      { type: 'h', text: 'When the organisation changes' },
      {
        type: 'list',
        items: [
          '**Reorganisations** (new structure, merged teams, new managers) happen regularly. Ask what changes for your work, priorities and reporting line.',
          'During uncertainty, keep delivering and communicating; rumours fill silence.',
          'If you lead a team through change: explain the why, be honest about what you do not know yet, and give people a chance to ask questions.',
        ],
      },
    ],
    quiz: [
      { q: 'You need help from a team you do not manage. Best approach?', options: ['Order them to help', 'Explain the benefit in their terms and make the request easy to act on', 'Wait until they offer', 'Escalate immediately'], answer: 1, why: 'Influence works through shared goals and clear, easy requests.' },
      { q: 'How should a presentation to executives start?', options: ['With the project history', 'With the conclusion or recommendation', 'With team photos', 'With all the data'], answer: 1, why: 'Answer first; details follow only as needed.' },
      { q: 'Two teams disagree. Before escalating you should...', options: ['Each write your own version for the boss', 'Agree the facts and options together, then escalate one shared document', 'Avoid each other', 'Post in a public channel'], answer: 1, why: 'A joint escalation gets a faster, fairer decision.' },
      { q: 'What does a decision document contain?', options: ['Only the answer', 'Problem, options, recommendation, decision-maker, deadline', 'Meeting attendance', 'Code'], answer: 1, why: 'It makes a decision easy and records why it was made.' },
      { q: 'During a reorg, what is the most useful behaviour?', options: ['Stop working until it is over', 'Keep delivering, ask what changes for you, and communicate', 'Spread rumours', 'Resign immediately'], answer: 1, why: 'Clarity and steady delivery protect you and your team through change.' },
    ],
  },
];
