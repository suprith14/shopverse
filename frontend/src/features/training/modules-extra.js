// Training modules added after the gap check: communication, account management, risk and
// continuity, IP and licences (business track) and technical debt (engineering track).
// Same block format as modules.js.

export const EXTRA_BUSINESS = [
  {
    slug: 'communication',
    track: 'business',
    title: 'Communication at work: meetings, MoM, email and chat',
    minutes: 14,
    summary: 'The everyday skill that decides how people see you: clear meetings, written follow-ups, emails that get answered.',
    blocks: [
      {
        type: 'table',
        head: ['Meeting', 'Purpose', 'Your job in it'],
        rows: [
          ['Standup', 'Sync and blockers', 'Yesterday, today, blockers: under a minute'],
          ['Status call (client)', 'Progress, risks, decisions', 'Have your numbers ready; never surprise the client with bad news here first'],
          ['Requirement workshop', 'Understand needs', 'Ask "why", write down assumptions, confirm by email afterwards'],
          ['Design review', 'Challenge a technical approach', 'Send the document a day before; collect decisions'],
          ['Demo / sprint review', 'Show working software', 'Rehearse, use realistic data, have a backup recording'],
          ['1:1 with your manager', 'Growth, feedback, problems', 'Bring your own agenda: it is your meeting'],
        ],
      },
      {
        type: 'list',
        items: [
          'Every meeting needs an **agenda** and a clear goal ("decide X", not "discuss X"). No agenda? Ask for one, or decline politely.',
          'Start on time; summarise decisions at the end; whoever runs the meeting sends the **MoM** the same day.',
          'If the call is with a client, prepare: who attends, what they care about, what you must not commit to.',
        ],
      },
      { type: 'h', text: 'Minutes of Meeting (MoM)' },
      {
        type: 'code',
        lang: 'text',
        code: `Subject: MoM - Checkout requirements workshop - 14 Nov

Attendees  Client: Meera (Product), Rahul (Finance)  |  Us: Arjun (PM), you
Decisions
  1. Refunds go back to the original payment method only.
  2. Cash on Delivery is out of scope for Release 1 (CR-007 to be raised).
Action items
  #  Action                                   Owner   Due
  1  Share refund rules for partial returns   Rahul   18 Nov
  2  Raise CR-007 with impact analysis        Arjun   16 Nov
  3  Update FRD section 4 with decision 1     You     15 Nov
Open questions
  - Which bank handles refunds above ₹50,000?
Please reply by 15 Nov if anything above is incorrect.`,
      },
      { type: 'callout', kind: 'rule', title: 'If it is not written, it did not happen', text: 'A MoM turns a conversation into an agreement. The "reply if incorrect" line matters: silence then counts as confirmation, which protects everyone later.' },
      { type: 'h', text: 'Emails that get answered' },
      {
        type: 'example',
        title: 'Weak vs strong email',
        lines: [
          '**Weak**: Subject "Query". Body: "Hi, we have some doubts regarding the payment module, please let us know when you are free to discuss."',
          '**Strong**: Subject "Decision needed by 18 Nov: refund method for partial returns".',
          'Body: "Hi Rahul, **BLUF**: we need your decision on partial refunds to finish checkout on time. Option A: refund to the original card (2 days of work). Option B: store credit (4 days). We recommend A. If we don\'t hear back by 18 Nov, Release 2 moves by one week."',
          'The strong version has the action and the deadline in the subject, the request first, options with their cost, a recommendation and the consequence of no answer.',
        ],
      },
      { type: 'h', text: 'Chat etiquette' },
      {
        type: 'list',
        items: [
          'Don\'t send only "Hi" and wait: write the whole question in one message, so the other person can answer when they see it.',
          'Use threads; keep one topic per thread; put decisions back in the ticket or document, because chat gets lost.',
          'Status in chat is short: "PR #231 ready, PTAL. Blocked on test env, ETA tomorrow EOD."',
          'Be careful with client data and confidential numbers in chat; use the approved channels only.',
          'Common shorthand: EOD, ETA, FYI, OOO, PTAL, LGTM, WIP, TL;DR, SPOC. Tap any of them for the meaning.',
        ],
      },
      { type: 'h', text: 'Working across time zones' },
      {
        type: 'list',
        items: [
          'Agree on **overlap hours** (for example 6-9 p.m. India with a US East Coast client) and protect them for meetings and questions.',
          'End your day with a written **handoff**: what is done, what is blocked, what you need from them. Then nobody waits a full day for an answer.',
          'Write dates with the time zone ("Tue 18 Nov, 10:00 IST / 23:30 EST Mon") to avoid off-by-one-day mistakes.',
        ],
      },
      { type: 'h', text: 'Saying no without saying "no"' },
      {
        type: 'example',
        title: 'Managing expectations',
        lines: [
          'Client: "Can you also add order tracking by Friday?"',
          'Instead of "No": "Tracking needs the courier\'s API, about 5 days. We can deliver it next sprint, or this sprint if we move the invoice export. I\'ll confirm with Arjun and send options by today EOD."',
          'You stay helpful, give facts, and route the decision through the PM without promising anything yourself.',
        ],
      },
    ],
    quiz: [
      { q: 'The workshop ended with three decisions. What should happen next?', options: ['Nothing, everyone heard them', 'A MoM with decisions, owners and dates, sent the same day', 'A new meeting to repeat them', 'A chat message to one person'], answer: 1, why: 'Written minutes turn spoken agreements into something everyone can check later.' },
      { q: 'Which email subject is best?', options: ['"Query"', '"Urgent!!!"', '"Decision needed by 18 Nov: refund method for partial returns"', '"Hi"'], answer: 2, why: 'The action and deadline are visible before the email is even opened.' },
      { q: 'In chat, what is wrong with sending only "Hi Rahul" and waiting?', options: ['Nothing', 'It forces a round trip before the real question can be answered', 'It is rude to say hi', 'Chat does not allow greetings'], answer: 1, why: 'Ask the full question in the first message so it can be answered whenever the person sees it.' },
      { q: 'Your client is 10.5 hours behind. What reduces waiting the most?', options: ['Working at night every day', 'A written end-of-day handoff plus agreed overlap hours', 'More meetings', 'Emailing without subjects'], answer: 1, why: 'Clear handoffs let work continue across time zones without waiting a full day.' },
      { q: 'A client asks you directly for a new feature by Friday. Best reply?', options: ['"Sure, done by Friday"', '"No"', 'Give the effort and options, and route the decision via the PM', 'Ignore the message'], answer: 2, why: 'Stay helpful with facts, but scope and dates are decided through the PM and change control.' },
    ],
  },

  {
    slug: 'account-management',
    track: 'business',
    title: 'After the sale: accounts, satisfaction and vendor onboarding',
    minutes: 13,
    summary: 'Winning a client is expensive; keeping and growing one is where most revenue comes from.',
    blocks: [
      {
        type: 'list',
        items: [
          '**Account manager / client partner**: owns the relationship, revenue targets, renewals and new opportunities.',
          '**Account plan**: who is who at the client, their goals this year, our current projects, risks, and growth opportunities.',
          '**Governance rhythm**: weekly project status, monthly steering committee, a **QBR** with the client\'s leadership every quarter (results, value delivered, issues, next quarter\'s plan).',
        ],
      },
      {
        type: 'table',
        head: ['Measure', 'How', 'Example'],
        rows: [
          ['CSAT', 'A short survey after a milestone or quarter ("How satisfied are you?", 1-5)', 'Average 4.3 / 5'],
          ['NPS', '"How likely are you to recommend us?" (0-10). % promoters (9-10) minus % detractors (0-6)', '50 promoters, 30 passives, 20 detractors out of 100 → NPS = 50 − 20 = **30**'],
          ['Renewal rate', 'Contracts renewed ÷ contracts due', '9 of 10 renewed = 90%'],
          ['Revenue per account', 'Growth year on year', 'Shows whether the relationship is expanding'],
        ],
      },
      {
        type: 'list',
        items: [
          '**Upsell**: more of the same (a bigger team, a larger support scope).',
          '**Cross-sell**: a different service (adding testing or cloud services to a development account).',
          'The best source of new work is a delivered project the client is proud of. Good delivery **is** sales.',
        ],
      },
      { type: 'h', text: 'When the client is unhappy' },
      {
        type: 'steps',
        items: [
          { title: 'Listen and acknowledge', text: 'Understand the actual problem; do not argue in the first call.' },
          { title: 'Own the facts', text: 'Gather data internally: what happened, since when, what the contract says.' },
          { title: 'Recovery plan', text: 'Concrete actions with owners and dates (extra people, more testing, daily updates).' },
          { title: 'Communicate often', text: 'Over-communicate until trust is back; report progress against the plan.' },
          { title: 'Fix the root cause', text: 'Change the process so it does not happen again, and say so in the QBR.' },
        ],
      },
      { type: 'h', text: 'Vendor onboarding: before the first invoice' },
      {
        type: 'list',
        items: [
          '**Supplier registration** in the client\'s procurement system: company documents (registration, PAN, GSTIN), bank details, tax forms.',
          '**Security questionnaire / vendor risk assessment**: hundreds of questions on access control, encryption, backups, incident response; certificates such as ISO 27001 or SOC 2 shorten it.',
          '**Per-person requirements**: background checks, NDAs, client training, laptops or VDI (virtual desktop) access.',
          '**Insurance**: some clients require professional indemnity or cyber insurance up to a stated amount.',
        ],
      },
      { type: 'h', text: 'When your company is the client: subcontracting' },
      {
        type: 'list',
        items: [
          'Companies sometimes bring in a smaller vendor for a specialist skill.',
          '**Back-to-back terms**: obligations you have to the client (confidentiality, IP, SLAs) are passed down ("flowed down") to the subcontractor.',
          'Many clients require approval before you subcontract any of their work. Check the MSA.',
        ],
      },
      { type: 'callout', kind: 'shopverse', text: 'ShopVerse\'s footer, error popup and placeholder images are small examples of account thinking: honest messages and no broken promises build trust, which in a services company is what brings the next contract.' },
    ],
    quiz: [
      { q: '100 responses: 60 promoters, 25 passives, 15 detractors. NPS?', options: ['25', '45', '60', '85'], answer: 1, why: '60% − 15% = 45. Passives count in the total but not in the score.' },
      { q: 'Adding a testing service to an existing development account is...', options: ['Upsell', 'Cross-sell', 'Churn', 'A change request'], answer: 1, why: 'Cross-sell is a different service; upsell is more of the same.' },
      { q: 'What is a QBR?', options: ['A code review', 'A quarterly review meeting with the client\'s leadership', 'A type of bug', 'A tax form'], answer: 1, why: 'Quarterly Business Reviews show the value delivered and agree on what comes next.' },
      { q: 'An angry client calls about repeated defects. First step?', options: ['Argue with the facts', 'Listen and acknowledge, then gather the facts internally', 'Offer a discount immediately', 'Blame the testers'], answer: 1, why: 'Understanding the real problem comes before any recovery plan.' },
      { q: 'You want to subcontract part of a client project. What should you check first?', options: ['Nothing', 'Whether the MSA allows it, and flow down the same obligations', 'Only the price', 'The subcontractor\'s logo'], answer: 1, why: 'Clients often require approval, and your duties (confidentiality, IP, SLAs) must pass to the subcontractor.' },
    ],
  },

  {
    slug: 'risk-continuity',
    track: 'business',
    title: 'Risk, business continuity and disaster recovery',
    minutes: 13,
    summary: 'Planning for what could go wrong, from a key person leaving to a whole data centre going down.',
    blocks: [
      { type: 'p', text: 'A **risk** is something that might happen; an **issue** is something that has happened. Risks are scored so the team works on the biggest ones first: **score = probability × impact**, each from 1 to 5.' },
      {
        type: 'table',
        head: ['Risk', 'Probability', 'Impact', 'Score', 'Response'],
        rows: [
          ['ERP API slower than expected under load', '4', '4', '**16**', 'Reduce: performance test in week 6, cache stock levels'],
          ['Tech lead resigns mid-project', '2', '5', '**10**', 'Reduce: pair a second developer, document design decisions'],
          ['Payment provider changes its API', '2', '3', '6', 'Accept: monitor their changelog'],
          ['Hosting region outage', '1', '5', '5', 'Transfer / reduce: SLA with provider, backups in another region'],
        ],
      },
      {
        type: 'table',
        head: ['Response', 'Meaning', 'Example'],
        rows: [
          ['Avoid', 'Change the plan so the risk cannot happen', 'Drop a risky integration from Release 1'],
          ['Reduce (mitigate)', 'Make it less likely or less harmful', 'Early performance tests, pairing, documentation'],
          ['Transfer', 'Give the risk to someone else', 'Insurance, a contract clause, a managed service'],
          ['Accept', 'Live with it, but watch it', 'Low-score risks, with a contingency plan'],
        ],
      },
      { type: 'h', text: 'Business continuity vs disaster recovery' },
      {
        type: 'list',
        items: [
          '**BCP** (business continuity plan): how the **business** keeps working: people, offices, suppliers, communication. Example: if the Bangalore office closes, teams work from home with laptops and VPN.',
          '**DR** (disaster recovery): how **systems** are restored after a major failure: backups, a second region, runbooks.',
          '**RPO**: the maximum data you can afford to lose, as time. RPO 15 minutes means backups or replication at least every 15 minutes.',
          '**RTO**: the maximum time a system may be down. RTO 4 hours means you must be able to restore within 4 hours, and prove it in a drill.',
        ],
      },
      {
        type: 'example',
        title: 'Choosing RPO and RTO',
        lines: [
          'For the checkout and orders database: losing even an hour of orders means lost money and angry customers → **RPO 5 minutes, RTO 1 hour**: continuous replication and a tested failover.',
          'For the analytics dashboard: it can be rebuilt from orders → **RPO 24 hours, RTO 1 day**: a nightly backup is enough.',
          'Lower RPO and RTO cost more. They are business decisions, written in the SLA and the DR plan, not engineering guesses.',
        ],
      },
      {
        type: 'list',
        items: [
          '**3-2-1 backups**: 3 copies of data, on 2 different kinds of storage, 1 copy off-site (another region or provider).',
          'A backup that has never been restored is a hope, not a backup. Schedule **restore tests**.',
          '**DR drills** (once or twice a year): fail over for real, time it, and compare with the RTO.',
          'Key-person risk counts too: no system should depend on one person\'s memory.',
        ],
      },
      { type: 'callout', kind: 'shopverse', text: 'Your Neon database supports point-in-time restore within its history retention window, and Neon branches can be created from a past moment. The next professional steps would be writing down ShopVerse\'s RPO and RTO and actually restoring a copy once, timed, to prove they hold.' },
    ],
    quiz: [
      { q: 'Probability 3, impact 5. Risk score?', options: ['8', '15', '35', '2'], answer: 1, why: 'Score = probability × impact = 3 × 5 = 15.' },
      { q: 'Buying cyber insurance is which risk response?', options: ['Avoid', 'Reduce', 'Transfer', 'Accept'], answer: 2, why: 'The financial impact is transferred to the insurer.' },
      { q: 'RPO 15 minutes means...', options: ['The system restarts in 15 minutes', 'At most 15 minutes of data may be lost', 'Backups every day', 'Meetings every 15 minutes'], answer: 1, why: 'RPO is about data loss; RTO is about downtime.' },
      { q: 'What does the "1" in 3-2-1 backups mean?', options: ['One backup is enough', 'One copy kept off-site', 'One restore per year', 'One administrator'], answer: 1, why: 'An off-site copy survives a disaster that destroys the main site.' },
      { q: 'Why run DR drills?', options: ['Auditors like noise', 'To prove the RTO and RPO are achievable before a real disaster', 'To test the network cables', 'They are not needed'], answer: 1, why: 'Untested recovery plans usually fail when they are needed most.' },
    ],
  },

  {
    slug: 'ip-licences',
    track: 'business',
    title: 'Intellectual property, open source and licences',
    minutes: 12,
    summary: 'Who owns the code you write, and the licence rules behind every library you install.',
    blocks: [
      {
        type: 'list',
        items: [
          '**Your employment contract** usually says that work you create in your job belongs to the employer. Read the clause on side projects and inventions before building something on the side.',
          '**Client projects**: the MSA decides IP. Commonly the client owns the deliverables once paid; the vendor keeps its own tools and know-how.',
          '**Side projects**: build them in your own time, on your own machine, without employer or client code or data. That is what makes them safely yours, and safe to show in interviews.',
        ],
      },
      {
        type: 'table',
        head: ['Licence', 'Type', 'Main obligation', 'Typical company stance'],
        rows: [
          ['MIT, BSD', 'Permissive', 'Keep the copyright and licence notice', 'Generally allowed'],
          ['Apache 2.0', 'Permissive', 'Keep notices; state changes; includes a patent grant', 'Generally allowed'],
          ['LGPL', 'Weak copyleft', 'Changes to the library itself must be shared; linking from other code is allowed', 'Allowed with care'],
          ['GPL', 'Strong copyleft', 'If you distribute software that includes GPL code, the whole work must be released under the GPL', 'Often needs legal approval'],
          ['AGPL', 'Network copyleft', 'Like GPL, but offering the software to users over a network also triggers it', 'Often banned for SaaS'],
          ['No licence', '-', 'All rights reserved: you may not reuse it', 'Do not use'],
        ],
      },
      {
        type: 'list',
        items: [
          'Most companies have an **open-source policy**: an allow-list of licences, an approval process for others, and a list of what is banned.',
          'Licence scanners and an **SBOM** (software bill of materials) list every dependency, its version and its licence, often checked in CI.',
          'Copying code from a blog or Stack Overflow is also covered by a licence (Stack Overflow content is licensed under Creative Commons, with attribution). Know before you paste.',
          'Images, fonts and icons have licences too: stock photos, Google Fonts, icon sets each have their own terms.',
          'Contributing to open source from work usually needs your employer\'s approval, because the code you write belongs to them.',
        ],
      },
      { type: 'callout', kind: 'mistake', text: 'Adding an AGPL library to a SaaS product without checking. Depending on how it is used, it can oblige the company to publish its own source code. Check every new dependency\'s licence before installing it, not after launch.' },
      { type: 'callout', kind: 'shopverse', text: 'ShopVerse already deals with this: the sample catalog\'s **Image credits** sheet records where the book covers come from, and you rejected keyword photos partly because their licences and content could not be trusted. Running `npx license-checker --summary` in each app would list the licences of all your dependencies.' },
    ],
    quiz: [
      { q: 'Which licence is usually safest to use in a commercial product?', options: ['AGPL', 'GPL', 'MIT', 'No licence'], answer: 2, why: 'MIT is permissive: keep the notice and you can use it freely.' },
      { q: 'You build a side project at night on your work laptop using company code. Who may own it?', options: ['You, always', 'Possibly your employer', 'Nobody', 'The laptop maker'], answer: 1, why: 'Using company equipment, time or code can give the employer a claim. Keep side projects fully separate.' },
      { q: 'What does an SBOM list?', options: ['Employees', 'Every dependency in the software, with versions and licences', 'Bugs', 'Meeting notes'], answer: 1, why: 'A software bill of materials makes licence and security checks possible.' },
      { q: 'Why is AGPL often banned for SaaS companies?', options: ['It is slow', 'Offering the software over a network can oblige you to release your source', 'It costs money', 'It only runs on Linux'], answer: 1, why: 'The AGPL closes the "we only run it on our servers" gap in the GPL.' },
      { q: 'Code on GitHub with no licence file. Can you copy it into work code?', options: ['Yes, it is public', 'No: without a licence, all rights are reserved', 'Yes, if you change the names', 'Only on weekends'], answer: 1, why: 'Public is not the same as open source; without a licence, you have no permission to reuse it.' },
    ],
  },
];

export const EXTRA_ENGINEERING = [
  {
    slug: 'tech-debt',
    track: 'engineering',
    title: 'Technical debt, architecture decisions and standards',
    minutes: 13,
    summary: 'How teams keep a codebase healthy for years, and record why it looks the way it does.',
    blocks: [
      { type: 'p', text: '**Technical debt** is the future cost of shortcuts taken now. Like money debt it has **interest**: every change in a messy area takes longer, and the bill grows until someone pays it back.' },
      {
        type: 'table',
        head: ['Kind', 'Example', 'Healthy?'],
        rows: [
          ['Deliberate, prudent', '"We hard-code the tax rate to hit the launch, ticket TD-12 to fix it next sprint"', 'Yes, if tracked and repaid'],
          ['Deliberate, reckless', '"No time for tests, ever"', 'No'],
          ['Accidental', 'A design that made sense, but the product grew past it', 'Normal: learn and refactor'],
          ['Outdated dependencies', 'A framework three major versions behind', 'Becomes a security risk'],
        ],
      },
      {
        type: 'list',
        items: [
          'Make debt **visible**: tickets labelled tech-debt, with the cost of leaving it ("every checkout change takes 2 extra days").',
          'Reserve capacity: many teams spend roughly **10-20%** of each sprint on debt and upgrades.',
          'Refactor **with tests first**: tests lock in today\'s behaviour, so the refactor can\'t change it silently.',
          'For big legacy systems use the **strangler fig** pattern: build new pieces around the old system and move traffic over gradually, instead of a risky big rewrite.',
          'Keep dependencies current with tools like Dependabot or Renovate: small, frequent upgrades beat a painful yearly one.',
        ],
      },
      { type: 'h', text: 'Architecture Decision Records (ADR)' },
      {
        type: 'code',
        lang: 'markdown',
        code: `# ADR-007: Placeholder images for imported products

Status      Accepted (2026-10-20)
Context     The sample catalog needs images for 301 non-book products.
            Keyword search on Wikimedia Commons returned unrelated and, in
            one case, explicit images: not safe for a store.
Decision    Use generated placeholders (brand + name on the category
            colour) until real photos are uploaded in admin.
            Book covers keep their exact Open Library images.
Consequences
  + Zero risk of wrong or unsafe images; works without any account
  - Plainer look; admins must upload real photos later
  Revisit when a vetted stock-photo source with an API key is available.`,
      },
      { type: 'p', text: 'An ADR is one short file per decision, kept in the repository (for example `docs/adr/`). New team members read them to understand **why** the code is the way it is, and nobody repeats an old debate without new facts.' },
      {
        type: 'table',
        head: ['Governance tool', 'What it is'],
        rows: [
          ['Architecture review board', 'Senior engineers review big designs (new services, data stores) against standards'],
          ['Tech radar', 'A company list of technologies in four rings: adopt, trial, assess, hold'],
          ['Coding standards', 'Shared rules, enforced by linters and formatters (ESLint, Prettier) in CI'],
          ['Golden paths', 'Recommended templates for new services: logging, CI and security already set up'],
          ['Deprecation policy', 'How old APIs and features are announced, given a timeline, and removed'],
        ],
      },
      { type: 'callout', kind: 'shopverse', text: 'ShopVerse paid down debt deliberately: the keyword-note comments were moved to a `learning` branch so `main` keeps only "why" comments. Decisions like server-side Excel parsing and placeholder images are perfect first ADRs for a `docs/adr/` folder.' },
    ],
    quiz: [
      { q: 'What is the "interest" on technical debt?', options: ['Bank charges', 'The extra time every future change costs in that area', 'Developer salaries', 'Nothing'], answer: 1, why: 'Messy code slows every change until the debt is repaid.' },
      { q: 'Best first step before refactoring risky code?', options: ['Delete it', 'Add tests that capture its current behaviour', 'Rewrite it from scratch', 'Ask for a holiday'], answer: 1, why: 'Tests make sure the refactor does not quietly change behaviour.' },
      { q: 'The strangler fig pattern means...', options: ['Rewriting everything at once', 'Replacing a legacy system gradually, piece by piece', 'Removing all tests', 'A database index'], answer: 1, why: 'New parts grow around the old system until it can be switched off.' },
      { q: 'What does an ADR record?', options: ['Bugs', 'One technical decision: context, decision, consequences', 'Meeting attendance', 'Salaries'], answer: 1, why: 'ADRs keep the "why" behind decisions for future readers.' },
      { q: 'On a tech radar, "hold" means...', options: ['Use it everywhere', 'Try it in a pilot', 'Do not start new work with it', 'It is the newest technology'], answer: 2, why: 'Hold signals: avoid for new projects; existing use may continue.' },
    ],
  },
];
