// Training track "Business & delivery": how IT companies win, sign, run and close projects.
// Same block format as modules.js. Figures marked "often" or "typical" vary by company and contract.

export const BUSINESS_MODULES = [
  {
    slug: 'idea-to-live',
    track: 'business',
    title: 'Idea to live: the whole journey',
    minutes: 10,
    summary: 'Every stage a real project passes through, from the first conversation to years of support, and who is involved at each step.',
    blocks: [
      { type: 'p', text: 'A project starts in one of two ways. In a **product company**, an idea comes from inside (users, data, strategy) and is funded by the company itself. In a **services company**, a **client** has a need, and the work must be **won** and **contracted** before anyone writes code. The services path has more stages, so it is shown here; product companies skip the sales and contract steps.' },
      {
        type: 'steps',
        items: [
          { title: 'Lead and opportunity', text: 'A client need is spotted (an existing account, a referral, an RFP). Sales qualifies it: budget, authority, need, timeline (**BANT**).' },
          { title: 'Bid / no-bid', text: 'Leadership decides if it is worth chasing: fit, chance of winning, margin, available people, risk.' },
          { title: 'Presales and proposal', text: 'Solution architects design the approach and estimate the effort; the bid team writes the proposal and pricing. Often 2-6 weeks.' },
          { title: 'Orals, demo or POC', text: 'Shortlisted vendors present, show a demo, or build a small proof of concept.' },
          { title: 'Negotiation and contract', text: 'Price, scope, terms and legal clauses are agreed: an **MSA** (the relationship) and a **SOW** (this project). A purchase order (**PO**) follows.' },
          { title: 'Initiation and kickoff', text: 'Project charter, team allocation, access and tools, kickoff meetings with the client.' },
          { title: 'Requirements and design', text: 'Workshops, requirement documents, architecture (HLD) and detailed design (LLD), all signed off.' },
          { title: 'Build', text: 'Sprints or phases; regular demos and status reports to the client.' },
          { title: 'Testing: SIT then UAT', text: 'The vendor tests the integrated system (SIT); then the client tests it against their needs (UAT) and signs off.' },
          { title: 'Go-live', text: 'A planned cutover, often over a weekend, after a go/no-go meeting.' },
          { title: 'Hypercare and warranty', text: 'Intensive support for the first weeks; defects in the warranty period are fixed at no extra cost.' },
          { title: 'Support and maintenance', text: 'A support team takes over (often under an annual maintenance or managed services contract).' },
          { title: 'Closure, renewal, upsell', text: 'Lessons learned, final invoice, people released; a happy client brings the next project.' },
        ],
      },
      {
        type: 'table',
        head: ['Stage', 'Main people', 'Key document'],
        rows: [
          ['Lead → contract', 'Sales / account manager, presales, solution architect, legal, finance', 'Proposal, MSA, SOW, PO'],
          ['Initiation', 'Delivery manager, project manager, client sponsor', 'Project charter, kickoff deck'],
          ['Requirements → build', 'Business analyst, architect, developers, testers', 'BRD/FRD, HLD/LLD, sprint reports'],
          ['Testing → go-live', 'QA, client users, release / ops team', 'Test reports, UAT sign-off, cutover plan'],
          ['After go-live', 'Support team (L1/L2/L3), service delivery manager', 'SLA reports, closure report'],
        ],
      },
      { type: 'callout', kind: 'rule', title: 'Nothing starts without a signature', text: 'In services work, starting before the SOW and PO are signed means working for free if the deal falls through. Teams sometimes begin "at risk" with a written approval from leadership, but it is the exception.' },
      { type: 'callout', kind: 'shopverse', text: 'ShopVerse followed the **product** path: you were the sponsor, the idea needed no bid or contract, and "go-live" was a push to `main`. The TaskFlow Feature Spec you shared is close to what a **SOW scope section** looks like: a list of features with priorities.' },
    ],
    quiz: [
      { q: 'What is the usual order?', options: ['Build, contract, bid', 'Bid, contract, kickoff, build', 'Kickoff, bid, build', 'UAT, SIT, build'], answer: 1, why: 'Work is won, then contracted, then started.' },
      { q: 'Who tests in UAT?', options: ['The vendor\'s developers', 'The client\'s users', 'The sales team', 'Nobody, it is automatic'], answer: 1, why: 'User Acceptance Testing is the client confirming the system meets their needs; their sign-off allows go-live.' },
      { q: 'What does a product company usually skip?', options: ['Testing', 'Bidding and client contracts', 'Design', 'Go-live'], answer: 1, why: 'Product work is funded internally, so there is no bid or SOW, though there is still a business case and budget.' },
    ],
  },

  {
    slug: 'company-types',
    track: 'business',
    title: 'How IT companies are organised and make money',
    minutes: 10,
    summary: 'Product, services, consulting and GCCs work very differently. Knowing the model explains most of what happens around you.',
    blocks: [
      {
        type: 'table',
        head: ['Type', 'Earns money from', 'Examples', 'What engineers notice'],
        rows: [
          ['Product (SaaS)', 'Subscriptions or licences for its own software', 'Freshworks, Zoho, Razorpay', 'Own roadmap, metrics like ARR and churn, long-term ownership of code'],
          ['IT services', 'Billing clients for people and projects', 'TCS, Infosys, Wipro, HCLTech', 'Client projects, timesheets, utilisation, moving between accounts'],
          ['Consulting', 'Advice and transformation programmes', 'Accenture, Deloitte, the Big Four', 'Shorter engagements, more documents and client meetings'],
          ['GCC (Global Capability Centre)', 'Nothing directly: an in-house centre of a global company', 'Many banks, retailers and tech firms in Bangalore', 'Works like a product team for the parent company'],
          ['Startup', 'Investor funding until revenue grows', '-', 'Speed, many hats, less process'],
        ],
      },
      { type: 'p', text: 'Large services companies are organised in a **matrix**: **verticals** by industry (BFSI = banking, financial services and insurance; retail; healthcare; manufacturing) and **horizontals** by skill (cloud, data, testing, cybersecurity). Your project sits in one account inside a vertical, and you belong to a practice (horizontal) for skills and careers.' },
      {
        type: 'table',
        head: ['Delivery role', 'Responsible for'],
        rows: [
          ['Account / client partner', 'The whole client relationship and its revenue'],
          ['Delivery manager / head', 'Several projects in an account: margins, staffing, escalations'],
          ['Project manager', 'One project: plan, budget, risks, status, client communication'],
          ['Tech lead / architect', 'Technical approach and quality'],
          ['Team members', 'Building and testing'],
          ['PMO', 'Standard processes, reporting and audits across projects'],
        ],
      },
      {
        type: 'list',
        items: [
          '**Utilisation** = billable hours / available hours. Services companies often target around 75-85%.',
          '**Bench** = people not allocated to a billable project, waiting for the next one (training in the meantime).',
          '**Gross margin** of a project = revenue minus the cost of the people and tools on it.',
          '**ARR** (annual recurring revenue) and **churn** (customers lost) are the key numbers in SaaS.',
        ],
      },
      { type: 'callout', kind: 'interview', text: 'Know the model of the company you are interviewing with. A services interviewer values client communication and adaptability; a product interviewer values ownership and product thinking. Your answers should show you understand which one they are.' },
    ],
    quiz: [
      { q: 'What is "utilisation" in a services company?', options: ['CPU usage', 'Billable hours divided by available hours', 'Number of projects', 'Lines of code'], answer: 1, why: 'Utilisation drives revenue in services: unbilled hours cost money.' },
      { q: 'What does BFSI stand for?', options: ['Backend, Frontend, Security, Infrastructure', 'Banking, Financial Services and Insurance', 'Build, Fix, Ship, Iterate', 'A testing framework'], answer: 1, why: 'BFSI is usually the largest vertical in Indian IT services.' },
      { q: 'A GCC is...', options: ['A government contract', 'An in-house technology centre of a global company', 'A type of database', 'A consulting firm'], answer: 1, why: 'Global Capability Centres build and run technology for their parent company, much like a product team.' },
    ],
  },

  {
    slug: 'bidding',
    track: 'business',
    title: 'Presales and bidding: how companies win work',
    minutes: 12,
    summary: 'RFIs, RFPs, proposals and negotiations: the process that decides whether a project exists at all.',
    blocks: [
      {
        type: 'table',
        head: ['Document', 'Client asks', 'Vendor answers with'],
        rows: [
          ['RFI (Request for Information)', '"Tell us who you are and what you can do"', 'Capabilities, experience, case studies. Used to shortlist.'],
          ['RFP (Request for Proposal)', '"Here is our problem: propose a solution and a price"', 'A full proposal: solution, approach, team, timeline, price'],
          ['RFQ (Request for Quotation)', '"The scope is fixed: what does it cost?"', 'Mostly a price, for a clearly defined scope'],
        ],
      },
      {
        type: 'list',
        items: [
          '**Bid / no-bid** is decided first: do we fit, can we win, is the margin acceptable, do we have the people, what are the risks? Saying no to the wrong deals is a skill.',
          '**The presales team**: bid manager (runs the process and deadline), solution architect (designs the solution), domain experts, pricing/finance, legal.',
          '**Clarifications**: vendors send written questions; the client answers all vendors at once, for fairness.',
        ],
      },
      {
        type: 'steps',
        items: [
          { title: 'Understanding of requirements', text: 'Shows the client you understood their problem, in their words.' },
          { title: 'Proposed solution and architecture', text: 'What will be built and how.' },
          { title: 'Delivery approach', text: 'Methodology, phases, governance, communication.' },
          { title: 'Team and timeline', text: 'Roles, locations (onsite / offshore), plan with milestones.' },
          { title: 'Commercials', text: 'Price, contract model, payment schedule, rate card.' },
          { title: 'Assumptions and exclusions', text: 'What the price relies on and what is **not** included. The most important protection in the whole proposal.' },
          { title: 'Risks, case studies, certifications', text: 'Why the client can trust you.' },
        ],
      },
      { type: 'p', text: 'Shortlisted vendors then do **orals** (a presentation and Q&A), a **demo** or a small paid or unpaid **POC** (proof of concept). The client scores proposals, often as a weighted mix of technical and commercial scores, then negotiates with the winner.' },
      {
        type: 'table',
        head: ['Government tenders in India', 'Meaning'],
        rows: [
          ['GeM', 'Government e-Marketplace: the online portal for public procurement'],
          ['EMD', 'Earnest Money Deposit: a deposit with the bid, returned to those who don\'t win'],
          ['PBG', 'Performance Bank Guarantee: security the winner provides for delivering the contract'],
          ['L1', 'The lowest-priced technically qualified bidder, often the winner'],
          ['QCBS', 'Quality and Cost Based Selection: technical and price scores combined with weights'],
        ],
      },
      { type: 'callout', kind: 'mistake', text: 'Underestimating to win. A bid won at a loss-making price becomes a project everyone suffers on: overtime, cut corners, an unhappy client. Good companies walk away instead.' },
      { type: 'callout', kind: 'rule', title: 'Engineers are part of bids', text: 'Senior developers are asked to **estimate** for proposals. Estimate the work, list your assumptions, and never let a salesperson quietly halve your number: if the price must drop, the scope must drop too.' },
    ],
    quiz: [
      { q: 'The client knows exactly what they want and only needs prices. They send...', options: ['An RFI', 'An RFP', 'An RFQ', 'An NDA'], answer: 2, why: 'An RFQ asks for a quotation on a defined scope.' },
      { q: 'Which proposal section protects the vendor most?', options: ['Case studies', 'Assumptions and exclusions', 'The cover page', 'Team photos'], answer: 1, why: 'The price is only valid under the stated assumptions; exclusions prevent scope from growing for free.' },
      { q: 'What is an EMD in Indian government tenders?', options: ['An email format', 'A deposit submitted with the bid', 'A delivery milestone', 'A design document'], answer: 1, why: 'The Earnest Money Deposit shows the bidder is serious; it is refunded to unsuccessful bidders.' },
    ],
  },

  {
    slug: 'contracts',
    track: 'business',
    title: 'Contracts: models and documents',
    minutes: 14,
    summary: 'How work is priced, who carries the risk, and the documents that define what must be delivered.',
    blocks: [
      {
        type: 'table',
        head: ['Contract model', 'How it works', 'Who carries the risk', 'Best when'],
        rows: [
          ['Fixed price (FP)', 'One price for an agreed scope', 'Vendor: overruns are its cost', 'Scope is clear and stable'],
          ['Time & Materials (T&M)', 'Client pays for hours or days worked at agreed rates', 'Client: more work costs more', 'Scope is evolving, Agile work'],
          ['Capped T&M (not-to-exceed)', 'T&M with a maximum budget', 'Shared', 'Flexibility with a budget limit'],
          ['Milestone-based', 'Payments when milestones are accepted', 'Vendor until each milestone', 'Clear phases with sign-offs'],
          ['Dedicated team / ODC / staff augmentation', 'Client rents a team (often per person per month) and directs the work', 'Client', 'Long-term work, client manages priorities'],
          ['Managed services', 'Vendor runs a service (support, operations) to agreed SLAs', 'Vendor, for meeting SLAs', 'Ongoing operations and support'],
          ['Outcome / value-based', 'Payment tied to business results', 'Mostly vendor', 'Results can be measured fairly'],
          ['Retainer', 'A monthly fee for a reserved amount of capacity or availability', 'Shared', 'Ongoing small changes, advisory work'],
        ],
      },
      {
        type: 'table',
        head: ['Document', 'Purpose', 'Typical contents'],
        rows: [
          ['NDA', 'Confidentiality before details are shared', 'What is confidential, for how long, exceptions'],
          ['MSA (Master Services Agreement)', 'The legal relationship, signed once', 'Liability cap, indemnity, IP ownership, confidentiality, data protection, payment terms, termination, governing law, dispute resolution'],
          ['SOW (Statement of Work)', 'One project under the MSA', 'Scope, deliverables, milestones, acceptance criteria, assumptions, out of scope, team, timeline, price'],
          ['SLA (Service Level Agreement)', 'Service quality promises', 'Response and resolution times per priority, uptime, reporting, **service credits** (penalties)'],
          ['DPA (Data Processing Agreement)', 'Rules for handling personal data', 'What data, purposes, security, sub-processors, breach notification'],
          ['PO (Purchase Order)', 'The client\'s authorisation to spend', 'Amount, reference to the SOW; invoices must quote it'],
          ['Change Request (CR)', 'Any change to the agreed scope', 'What changes, impact on effort, time and price; signed by both'],
        ],
      },
      {
        type: 'list',
        items: [
          '**Intellectual property**: usually the client owns the deliverables once paid; the vendor keeps its pre-existing tools and know-how ("background IP").',
          '**Liability cap**: the maximum the vendor can be asked to pay for damages, often linked to the fees paid over a period.',
          '**Payment terms**: e.g. "Net 30" means the invoice is due 30 days after it is issued; 45 and 60 days are common with large clients.',
          '**Acceptance**: how and when deliverables count as accepted, often "deemed accepted" if the client does not respond within N days.',
        ],
      },
      {
        type: 'steps',
        items: [
          { title: 'Request', text: 'The client (or the team) asks for something outside the SOW.' },
          { title: 'Impact analysis', text: 'The vendor estimates effort, timeline and price impact, and the risks.' },
          { title: 'Approval', text: 'Both sides sign the change request; the plan and budget are updated.' },
          { title: 'Delivery', text: 'Only then is the change built.' },
        ],
      },
      { type: 'callout', kind: 'mistake', text: '"Just a small change" done without a change request. Ten small changes are a month of free work in a fixed-price project, and nobody can prove later that they were extra. This is called **scope creep**.' },
      { type: 'callout', kind: 'shopverse', text: 'Your product import has a contract-like rule: a **dry run** first (impact analysis), then **apply** with everything or nothing. Change control in projects works the same way: understand the impact, agree, then change.' },
    ],
    quiz: [
      { q: 'In a fixed-price contract, the project takes 30% more effort than planned. Who pays?', options: ['The client', 'The vendor', 'Nobody', 'The government'], answer: 1, why: 'Fixed price puts the overrun risk on the vendor, which is why fixed-price bids include contingency.' },
      { q: 'Where are the liability cap and IP ownership normally defined?', options: ['In the SOW', 'In the MSA', 'In a Jira ticket', 'In the README'], answer: 1, why: 'The MSA holds the legal terms for the whole relationship; each SOW covers one project\'s scope.' },
      { q: 'The client asks for a new feature mid-project. Correct process?', options: ['Build it quietly', 'Refuse', 'Raise a change request with the effort and price impact', 'Remove another feature without telling them'], answer: 2, why: 'Change requests keep scope, price and timeline in agreement.' },
    ],
  },

  {
    slug: 'initiation',
    track: 'business',
    title: 'Project initiation: business case to kickoff',
    minutes: 12,
    summary: 'How a project gets approved, funded, estimated and started properly.',
    blocks: [
      {
        type: 'list',
        items: [
          '**Business case**: the problem, the options considered (including "do nothing"), costs, expected benefits, payback period or ROI, risks.',
          '**Budget approval**: capital expenditure (**capex**, building an asset) or operating expenditure (**opex**, ongoing costs such as subscriptions and support) approved by finance and a sponsor.',
          '**Sponsor**: the senior person who owns the outcome, funds it and resolves big blockers.',
        ],
      },
      {
        type: 'table',
        head: ['Project charter section', 'Answers'],
        rows: [
          ['Objectives and success criteria', 'What must be true at the end, measurably'],
          ['Scope and out of scope', 'What is included, and what is explicitly not'],
          ['Stakeholders', 'Everyone affected or involved, and their interest'],
          ['Milestones and high-level timeline', 'The key dates'],
          ['Budget', 'Approved spend and contingency'],
          ['Risks, assumptions, constraints', 'What could go wrong; what we rely on'],
          ['Governance', 'Who decides what, and how often they meet'],
        ],
      },
      {
        type: 'table',
        head: ['Estimation technique', 'How', 'Used for'],
        rows: [
          ['WBS (Work Breakdown Structure)', 'Split the work into small pieces and estimate each', 'Detailed plans and fixed-price bids'],
          ['Three-point / PERT', '(Optimistic + 4 × Most likely + Pessimistic) / 6', 'Including uncertainty in each estimate'],
          ['Analogy', 'Compare with similar past projects', 'Early, rough estimates'],
          ['T-shirt sizes / story points', 'Relative sizes (S, M, L, XL)', 'Agile backlogs'],
          ['Function points', 'Count inputs, outputs, files, interfaces', 'Some large contracts and government work'],
        ],
      },
      { type: 'p', text: 'Every estimate gets a **contingency** buffer for the unknown, larger when requirements are vague. Estimates come with written **assumptions**, so everyone knows what would change the number.' },
      {
        type: 'steps',
        items: [
          { title: 'Internal kickoff', text: 'The delivery team aligns on scope, contract, risks, roles and the plan before meeting the client.' },
          { title: 'Client kickoff', text: 'Introductions, objectives, scope, timeline, governance, communication plan, next steps.' },
          { title: 'Onboarding', text: 'Access to systems, accounts, repositories, VPN; security and client-specific training; NDAs for each person if required.' },
          { title: 'Governance cadence', text: 'Daily standups (team), weekly status meetings (project), monthly steering committee (sponsors).' },
        ],
      },
      { type: 'callout', kind: 'rule', title: 'Out of scope is written down on day one', text: 'The single cheapest way to avoid conflict later is a clear "not included" list in the charter and SOW.' },
    ],
    quiz: [
      { q: 'Optimistic 4 days, most likely 6, pessimistic 14. PERT estimate?', options: ['6', '7', '8', '14'], answer: 1, why: '(4 + 4×6 + 14) / 6 = 42 / 6 = 7 days.' },
      { q: 'Who usually funds the project and resolves major blockers?', options: ['The newest developer', 'The sponsor', 'The tester', 'The client\'s IT helpdesk'], answer: 1, why: 'The sponsor owns the outcome and has the authority to remove obstacles.' },
      { q: 'Why include "do nothing" in a business case?', options: ['It is required by law', 'It shows what happens if we don\'t invest, as a baseline', 'To fill space', 'It is never included'], answer: 1, why: 'Every option is compared against the cost and risk of doing nothing.' },
    ],
  },

  {
    slug: 'delivery',
    track: 'business',
    title: 'Running delivery: methods, documents and reporting',
    minutes: 12,
    summary: 'How projects are run and reported day to day, and the documents clients expect.',
    blocks: [
      {
        type: 'table',
        head: ['Method', 'Shape', 'Common in'],
        rows: [
          ['Waterfall', 'Phases one after another: requirements → design → build → test → deploy', 'Fixed-price, regulated and government projects'],
          ['Agile (Scrum / Kanban)', 'Short iterations with working software each time', 'Product companies, T&M work'],
          ['Hybrid', 'Fixed phases and sign-offs, Agile sprints inside the build phase', 'Many services projects'],
          ['SAFe (Scaled Agile)', 'Agile across many teams with planning increments', 'Large enterprises and banks'],
        ],
      },
      {
        type: 'table',
        head: ['Document', 'What it holds'],
        rows: [
          ['BRD (Business Requirements Document)', 'What the business needs and why'],
          ['FRD / SRS (Functional / Software Requirements)', 'What the system must do, in detail'],
          ['HLD (High-Level Design)', 'Architecture: components, integrations, infrastructure'],
          ['LLD (Low-Level Design)', 'Modules, classes, APIs, database tables'],
          ['RTM (Requirements Traceability Matrix)', 'Each requirement linked to its design, code and test cases'],
          ['Test plan and test cases', 'How and what will be tested, with expected results'],
          ['Release notes and runbook', 'What changed; how to deploy, operate and roll back'],
          ['User manual and training material', 'How users work with the system'],
        ],
      },
      {
        type: 'list',
        items: [
          '**SIT** (System Integration Testing): the vendor tests the whole system with its integrations.',
          '**UAT** (User Acceptance Testing): the client tests with real scenarios and signs off.',
          '**RAID log**: Risks, Assumptions, Issues, Dependencies, each with an owner and a date. Reviewed every week.',
          '**RAG status** in reports: Green (on track), Amber (at risk, being handled), Red (off track, needs decisions).',
          '**Metrics**: schedule variance, effort variance, defect leakage (bugs found after release), velocity, SLA compliance.',
          '**Escalation matrix**: who to contact at each level (project manager → delivery manager → account head) and when.',
        ],
      },
      { type: 'callout', kind: 'mistake', text: '"Watermelon reporting": status green on the outside, red inside. Hiding problems until it is too late destroys trust; reporting Amber early, with a plan, builds it.' },
      { type: 'callout', kind: 'shopverse', text: 'Your `docs/features/*.md` are a mix of an LLD and release notes, and your API tests act as part of an RTM: each test name states a requirement ("a SKU that belongs to another product is refused").' },
    ],
    quiz: [
      { q: 'What does a RAID log track?', options: ['Disk arrays', 'Risks, Assumptions, Issues and Dependencies', 'Release dates only', 'Attendance'], answer: 1, why: 'It is the project\'s running list of what could go wrong and what is already wrong.' },
      { q: 'Which test does the client perform?', options: ['Unit tests', 'SIT', 'UAT', 'Load tests'], answer: 2, why: 'UAT is the client\'s acceptance; SIT is the vendor\'s own integration testing.' },
      { q: 'A project is slipping but the report says Green. What is this called?', options: ['Agile', 'Watermelon reporting', 'A burndown', 'Scope creep'], answer: 1, why: 'Green outside, red inside: a classic failure of honest reporting.' },
    ],
  },

  {
    slug: 'go-live',
    track: 'business',
    title: 'Go-live, support and closure',
    minutes: 10,
    summary: 'Launching safely, supporting the system afterwards, and closing the project properly.',
    blocks: [
      {
        type: 'steps',
        items: [
          { title: 'Cutover plan', text: 'A minute-by-minute plan for the switch: data migration, deployment, checks, who does what, and the rollback point.' },
          { title: 'Change approval (CAB)', text: 'In ITIL-style organisations a Change Advisory Board approves production changes and their timing.' },
          { title: 'Go / no-go meeting', text: 'Everyone confirms readiness: tests passed, UAT signed, support ready, rollback tested. Any "no" stops the launch.' },
          { title: 'Go-live', text: 'Often in a low-traffic window (night or weekend), followed by smoke tests and monitoring.' },
          { title: 'Hypercare', text: 'Typically 2-6 weeks of intensive support by the project team, with fast fixes and daily check-ins.' },
          { title: 'Warranty', text: 'A period (often 30-90 days) in which defects are fixed at no extra cost, as defined in the contract.' },
          { title: 'Knowledge transfer (KT) and handover', text: 'Documents, sessions and shadowing so the support team can run the system.' },
          { title: 'Project closure', text: 'Closure report, lessons learned, final invoice, archived documents, people released to new projects.' },
        ],
      },
      {
        type: 'table',
        head: ['Support level', 'Does'],
        rows: [
          ['L1 (service desk)', 'Takes tickets, answers known questions, follows scripts'],
          ['L2 (application support)', 'Investigates, fixes data and configuration, applies known workarounds'],
          ['L3 (engineering)', 'Fixes code defects and complex problems'],
          ['L4 (vendor / product owner)', 'Issues in third-party products, handled by their makers'],
        ],
      },
      {
        type: 'list',
        items: [
          '**ITIL** processes: **incident** (restore service fast), **problem** (find and remove the root cause), **change** (control production changes), **service request** (standard asks like access).',
          '**AMC** (Annual Maintenance Contract) or **managed services**: ongoing support and small enhancements for a yearly or monthly fee, measured against SLAs.',
          '**SLA example**: P1 response 15 minutes, resolution 4 hours; P3 response 1 day, resolution 5 days. Missed SLAs can cost service credits.',
        ],
      },
      { type: 'callout', kind: 'shopverse', text: 'ShopVerse\'s Render deploy runs `prisma migrate deploy` on start: a tiny automated cutover. The professional additions would be a written rollback plan and a short "hypercare" check of logs and errors after each release.' },
    ],
    quiz: [
      { q: 'What is hypercare?', options: ['A health benefit', 'Intensive support right after go-live', 'A type of test', 'A contract model'], answer: 1, why: 'The project team stays close for the first weeks to fix issues fast.' },
      { q: 'A user cannot log in and the cause is a code defect. Which level fixes the code?', options: ['L1', 'L2', 'L3', 'Nobody'], answer: 2, why: 'L3 is engineering: code fixes for defects.' },
      { q: 'ITIL "problem management" is about...', options: ['Restoring service quickly', 'Finding and removing root causes', 'Approving changes', 'Hiring'], answer: 1, why: 'Incidents restore service; problem management makes sure they don\'t repeat.' },
    ],
  },

  {
    slug: 'company-life',
    track: 'business',
    title: 'Life inside the company: careers, time and policies',
    minutes: 10,
    summary: 'The internal processes every employee meets, from joining to appraisals.',
    blocks: [
      {
        type: 'table',
        head: ['Typical ladder', 'Services company', 'Product company'],
        rows: [
          ['Entry', 'Associate / Software Engineer', 'SDE 1 / Software Engineer'],
          ['Experienced', 'Senior Engineer', 'SDE 2 / Senior Engineer'],
          ['Lead', 'Technical Lead / Team Lead', 'SDE 3 / Senior II'],
          ['Senior individual contributor', 'Architect / Principal Architect', 'Staff → Principal Engineer'],
          ['Management', 'Project Manager → Delivery Manager → Delivery Head', 'Engineering Manager → Director → VP'],
        ],
      },
      {
        type: 'list',
        items: [
          '**Joining**: offer letter, background verification (**BGV**: education, past employers, sometimes address and criminal records), induction, laptop and access requests.',
          '**Timesheets**: hours booked against project codes every week. In services they decide what is billed to clients, so accuracy matters.',
          '**Allocation**: resource managers assign people to projects; between projects you are "on bench", usually training or helping presales.',
          '**Goals and appraisals**: goals set at the start of the year (KPIs or OKRs), a mid-year check-in, an annual review with a rating that drives increments and promotions.',
          '**Notice period**: often 30-90 days in India, defined in your contract; knowledge transfer is expected before you leave.',
          '**Internal tools**: HRMS (leave, payslips), ITSM tickets for hardware and access, the wiki, internal job postings (IJP) for moving between teams.',
        ],
      },
      {
        type: 'table',
        head: ['Policy', 'Why it exists'],
        rows: [
          ['Code of conduct', 'Expected behaviour, conflicts of interest, gifts'],
          ['Information security and acceptable use', 'Protecting client and company data: no personal email for work files, no unapproved tools'],
          ['POSH (Prevention of Sexual Harassment) Act, 2013', 'Indian law requiring an Internal Committee to handle complaints in workplaces with 10+ employees'],
          ['Data privacy', 'DPDP Act and client rules on personal data'],
          ['Moonlighting / outside work', 'Rules on second jobs and side projects; read yours before freelancing'],
        ],
      },
      { type: 'callout', kind: 'rule', title: 'Client data never leaves approved systems', text: 'Pasting client code or data into personal accounts, public AI tools or GitHub repos can break the contract and end careers. When unsure, ask your manager or the security team first.' },
      { type: 'callout', kind: 'interview', text: 'For a side project like ShopVerse, keep it clearly separate from employer and client work: your own time, your own machine, no client code. That is also what makes it safe to show in interviews.' },
    ],
    quiz: [
      { q: 'Why do timesheets matter so much in services companies?', options: ['They don\'t', 'They decide what is billed to clients', 'They track breaks', 'They are only for HR'], answer: 1, why: 'Hours booked to project codes become invoices; wrong timesheets mean wrong bills.' },
      { q: 'You are between projects. You are...', options: ['Fired', 'On bench', 'On notice', 'On hypercare'], answer: 1, why: 'The bench is the pool of people waiting for allocation, usually training meanwhile.' },
      { q: 'Can you paste client code into a public AI tool to debug it?', options: ['Yes, always', 'Only if it is short', 'Only with explicit approval and an approved tool', 'Yes, if you delete it after'], answer: 2, why: 'Client code is confidential under the contract; only approved tools and channels may be used.' },
    ],
  },

  {
    slug: 'compliance-finance',
    track: 'business',
    title: 'Compliance, audits and project finance',
    minutes: 12,
    summary: 'The certifications clients ask for, and how money flows through a project.',
    blocks: [
      {
        type: 'table',
        head: ['Standard', 'About', 'Asked for by'],
        rows: [
          ['ISO 27001', 'An information security management system (ISMS); certified, with yearly surveillance audits', 'Almost every enterprise client'],
          ['SOC 2', 'US-style report on security controls. Type I: designed correctly at one point in time. Type II: working over a period (often 6-12 months)', 'US clients, SaaS buyers'],
          ['ISO 9001', 'Quality management', 'Manufacturing and government clients'],
          ['CMMI (levels 1-5)', 'Process maturity; many large Indian services companies are assessed at level 5', 'Large and government contracts'],
          ['PCI DSS', 'Security for handling card payment data', 'Anyone touching card data'],
          ['HIPAA / GDPR / DPDP', 'Health data (US) / personal data (EU / India)', 'Clients in those markets'],
        ],
      },
      { type: 'p', text: 'Audits need **evidence**: access reviews, change approvals, training records, incident reports, backups tested. Everyday habits (tickets for changes, PR reviews, least-privilege access) produce that evidence automatically.' },
      {
        type: 'list',
        items: [
          '**Rate card**: the price per role per hour, day or month, set from the cost of the person plus overheads and margin.',
          '**Project P&L**: revenue minus direct costs (people, tools, travel) = gross margin. Delivery managers are measured on it.',
          '**Revenue recognition** (Ind AS 115 in India, aligned with IFRS 15): T&M revenue is usually recognised as hours are delivered; fixed-price revenue as performance obligations are met (by milestone or progress).',
          '**Invoicing**: invoices quote the PO number and follow the payment schedule; unpaid invoices become receivables that finance chases.',
          '**GST**: IT services in India are generally charged GST at 18%; exports of services can be zero-rated under conditions. GST invoices need a **consecutive serial number** per financial year.',
        ],
      },
      { type: 'callout', kind: 'shopverse', text: 'Two real links. Stripe **Checkout** keeps card data on Stripe\'s pages, which keeps ShopVerse\'s PCI DSS scope minimal (typically the simplest self-assessment, SAQ A). And the invoice numbers come from a locked counter row (`backend/src/modules/orders/invoice.js`), giving the **gapless, consecutive** numbering that GST invoices require.' },
      { type: 'callout', kind: 'mistake', text: 'Treating compliance as paperwork done before the audit. Auditors check evidence over months (SOC 2 Type II); it only exists if the process is followed every day.' },
    ],
    quiz: [
      { q: 'SOC 2 Type II shows that controls...', options: ['Exist on paper', 'Worked over a period of time', 'Were designed by the client', 'Are optional'], answer: 1, why: 'Type I is a point in time; Type II tests operating effectiveness over months.' },
      { q: 'Why does using Stripe Checkout help with PCI DSS?', options: ['It is free', 'Card data is entered on Stripe\'s page, not your servers', 'It removes the need for HTTPS', 'It encrypts the database'], answer: 1, why: 'If card data never touches your systems, your compliance scope shrinks dramatically.' },
      { q: 'Project revenue is 100, people cost 60, tools 10. Gross margin?', options: ['10%', '30%', '40%', '60%'], answer: 1, why: '100 − 60 − 10 = 30, i.e. 30% of revenue.' },
    ],
  },
];
