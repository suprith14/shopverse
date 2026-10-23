// The training content: how product development works in a company, as data.
// TrainingPage.jsx draws it. Block types:
//   p        a paragraph                      list     bullet points
//   steps    a numbered flow (title + text)   table    head + rows
//   code     a code sample                    callout  kind: rule | mistake | shopverse | interview
// Inline text: **bold** and `code`. This file holds the engineering track; modules-business.js the
// business track. Content is English (the working language of IT teams);
// the page's buttons and labels are translated.

import { BUSINESS_MODULES } from './modules-business';
import { DEEP_DIVES } from './deep-dives';
import { EXTRA_BUSINESS, EXTRA_ENGINEERING } from './modules-extra';
import { HR_LEGAL_MODULES, LEADERSHIP_MODULES } from './modules-leadership';

const ENGINEERING_MODULES = [
  {
    slug: 'roles',
    title: 'Who does what in a product team',
    minutes: 8,
    summary: 'Every feature passes through many hands. Knowing who owns which decision is the first rule of working in a product company.',
    blocks: [
      {
        type: 'table',
        head: ['Role', 'Owns', 'What they need from you'],
        rows: [
          ['Product Manager (PM)', 'The **what** and **why**: problem, priority, scope, success metrics. Writes the PRD.', 'Effort estimates, risks, honest "this is harder than it looks"'],
          ['Designer (UX/UI)', 'User flows, screens, every state (empty, loading, error), accessibility', 'Early feedback on what is hard to build; questions about missing states'],
          ['Engineering Manager (EM)', 'People, delivery, process, hiring', 'Status, blockers, growth goals'],
          ['Tech Lead / Architect', 'The **how**: system design, technical decisions, code standards', 'Design docs, PRs to review, trade-offs written down'],
          ['Developer (you)', 'Building, testing and shipping the feature; estimating; reviewing others', '-'],
          ['QA / SDET', 'Test plans, automation, sign-off before release', 'Clear acceptance criteria, a stable staging build, notes on risky areas'],
          ['DevOps / SRE', 'Pipelines, infrastructure, uptime, on-call tooling', 'Config and migrations that are safe to deploy'],
          ['Support / Customer Success', 'Customer problems, turning them into bug reports', 'Clear release notes and known issues'],
        ],
      },
      { type: 'callout', kind: 'rule', title: 'PM decides what and when; engineers decide how', text: 'If you disagree with a product decision, argue with **data** (cost, risk, user impact), not taste. If a PM dictates the database design, it is fine to push back politely: that decision belongs to engineering.' },
      { type: 'p', text: 'A **RACI** chart is how big teams avoid confusion: for each decision, who is **R**esponsible (does it), **A**ccountable (one person who signs off), **C**onsulted and **I**nformed.' },
      { type: 'callout', kind: 'mistake', text: 'Starting to code before the acceptance criteria are agreed. You build the wrong thing fast, and the rework costs more than the meeting you skipped.' },
      { type: 'callout', kind: 'shopverse', text: 'In ShopVerse you played every role. As **PM** you dropped the AI phase and limited Kannada to the store. As **designer** you chose the error popup. As **developer** and **QA** you built and tested. In a company each hat belongs to a different person, and the hand-offs between them are where most problems happen.' },
    ],
    quiz: [
      { q: 'Who decides whether a feature ships in this sprint?', options: ['The developer who builds it', 'The PM, with the team, based on priority and capacity', 'QA', 'Whoever finishes first'], answer: 1, why: 'Priority and scope are product decisions. The team supplies the capacity and the estimates.' },
      { q: 'The design has no error state for a failed payment. What do you do?', options: ['Invent one quietly', 'Ship without it', 'Raise it in refinement and ask design for it', 'Show the raw server error'], answer: 2, why: 'Missing states are design gaps. Raise them early so the fix is cheap and consistent.' },
      { q: 'Who owns the database schema decision?', options: ['PM', 'Engineering (tech lead and developers)', 'Support', 'The customer'], answer: 1, why: 'The "how" belongs to engineering. Product owns the "what" and "why".' },
    ],
  },

  {
    slug: 'lifecycle',
    title: 'From idea to production: the product lifecycle',
    minutes: 10,
    summary: 'The path every feature takes, and the document each step produces.',
    blocks: [
      {
        type: 'steps',
        items: [
          { title: 'Discovery', text: 'Is this a real problem? Talk to users, look at data and support tickets. Many ideas die here, which is cheap.' },
          { title: 'PRD (Product Requirements Document)', text: 'Problem, target users, goals, **success metrics**, scope and **non-goals**. Written by the PM, reviewed by design and engineering.' },
          { title: 'Design', text: 'Wireframes, then high-fidelity screens in Figma, with every state: empty, loading, error, success, mobile.' },
          { title: 'Tech design / RFC', text: 'How we will build it: data model, API, alternatives considered, risks, rollout plan. Reviewed by senior engineers before coding.' },
          { title: 'Refinement and estimation', text: 'Split into tickets with acceptance criteria; estimate them as a team.' },
          { title: 'Sprint planning', text: 'The team commits to the tickets that fit this sprint.' },
          { title: 'Build', text: 'A branch per ticket, small commits, tests written with the code.' },
          { title: 'Code review', text: 'A pull request, automated checks (CI), at least one approval.' },
          { title: 'QA on staging', text: 'Tested in a production-like environment against the acceptance criteria.' },
          { title: 'Release', text: 'Often behind a **feature flag**: on for staff, then 5% of users, then everyone.' },
          { title: 'Measure and iterate', text: 'Did the success metric move? If not, learn why. Shipping is not the finish line.' },
        ],
      },
      {
        type: 'table',
        head: ['Document', 'Written by', 'Answers'],
        rows: [
          ['PRD', 'PM', 'What problem, for whom, how we know it worked'],
          ['Design spec', 'Designer', 'What every screen and state looks like'],
          ['RFC / tech design', 'Engineer', 'How we build it and why this way'],
          ['Ticket', 'PM or engineer', 'One piece of work and when it is done'],
          ['Pull request', 'Engineer', 'What changed, why, how it was tested'],
          ['Release notes', 'PM or engineer', 'What users and support need to know'],
          ['Postmortem', 'Engineer on call', 'What broke, why, and how we prevent it'],
        ],
      },
      { type: 'callout', kind: 'rule', title: 'Non-goals matter as much as goals', text: 'Writing down what you will **not** do ("no Kannada for product names in v1") prevents scope creep and endless debates later.' },
      { type: 'callout', kind: 'shopverse', text: 'Your `docs/features/*.md` files are tech design docs, and `docs/FEATURE_TRACKER.md` is the release log. The product import works like a company release: a **dry run** (plan) first, then **apply**, all in one transaction.' },
    ],
    quiz: [
      { q: 'Where are success metrics defined?', options: ['In the PR', 'In the PRD', 'In the commit message', 'Nowhere, they are obvious'], answer: 1, why: 'The PRD says how we will know the feature worked, before anyone builds it.' },
      { q: 'Why write a tech design (RFC) before coding a big feature?', options: ['Managers like paperwork', 'To agree on the approach and catch risks while changes are cheap', 'It replaces tests', 'It is required by law'], answer: 1, why: 'Changing a document costs minutes; changing a shipped data model costs weeks.' },
      { q: 'A feature is shipped. Is the work done?', options: ['Yes', 'Only once the success metric is checked', 'Only after the next sprint', 'Only if QA says so'], answer: 1, why: 'Teams measure outcomes, not output. A shipped feature that moves nothing is a lesson, not a success.' },
    ],
  },

  {
    slug: 'agile',
    title: 'Agile, Scrum and Kanban',
    minutes: 10,
    summary: 'How teams plan and track work in short cycles.',
    blocks: [
      { type: 'p', text: 'Most product companies work in **sprints** of one or two weeks (Scrum), or as a continuous flow of tickets (Kanban). Both aim at the same thing: small batches, fast feedback.' },
      {
        type: 'table',
        head: ['Ceremony', 'When', 'Purpose'],
        rows: [
          ['Sprint planning', 'Sprint start, 1-2 h', 'Pick the top tickets that fit the team capacity'],
          ['Daily standup', 'Every day, 15 min', 'Yesterday, today, **blockers**. A sync for the team, not a status report to the manager.'],
          ['Backlog refinement', 'Mid-sprint', 'Clarify and estimate upcoming tickets so planning is fast'],
          ['Sprint review / demo', 'Sprint end', 'Show working software to stakeholders and get feedback'],
          ['Retrospective', 'Sprint end', 'What went well, what did not, and 1-3 action items with owners'],
        ],
      },
      {
        type: 'list',
        items: [
          '**Story points** measure relative effort, complexity and uncertainty (usually Fibonacci: 1, 2, 3, 5, 8, 13), not hours.',
          '**Velocity** is the points a team finishes per sprint. It helps that team plan; it is not a score to compare teams.',
          '**Burndown chart**: remaining work against days left. Actual above the ideal line means the team is behind.',
          '**Scope creep**: work added after the sprint started. A good team says "next sprint" or swaps something out.',
          '**WIP limit** (Kanban): at most N tickets "in progress". Stop starting, start finishing.',
        ],
      },
      { type: 'callout', kind: 'mistake', text: 'Treating story points as a productivity target. Once points become a goal, people inflate them and they stop meaning anything (Goodhart\'s law).' },
      { type: 'callout', kind: 'shopverse', text: 'Your one-feature-a-day routine is a one-day sprint: pick a ticket (planning), build it, open a PR (review), ship it, then write interview notes (a small retrospective).' },
    ],
    quiz: [
      { q: 'What is the daily standup for?', options: ['Reporting hours to the manager', 'Syncing the team and surfacing blockers', 'Solving problems in depth', 'Demoing features'], answer: 1, why: 'Fifteen minutes to sync and unblock. Deep discussions move to a follow-up with only the people involved.' },
      { q: 'Team A has a velocity of 40 and team B of 25. What can you conclude?', options: ['Team A is more productive', 'Team B is lazy', 'Nothing: points are relative to each team', 'Team A should help team B'], answer: 2, why: 'Each team calibrates its own points. Velocity is for planning within a team only.' },
      { q: 'A stakeholder wants a new feature mid-sprint. The usual answer?', options: ['Drop everything', 'Add it on top of the sprint', 'Put it in the backlog, or swap it for work of equal size', 'Refuse forever'], answer: 2, why: 'Protecting the sprint keeps commitments reliable. Urgent work replaces something, it is not added on top.' },
    ],
  },

  {
    slug: 'tickets',
    title: 'Writing work: stories, bugs and "done"',
    minutes: 10,
    summary: 'A clear ticket saves days. A vague one costs a sprint.',
    blocks: [
      {
        type: 'table',
        head: ['Type', 'Meaning', 'Example'],
        rows: [
          ['Epic', 'A big goal spanning many tickets', 'Bulk product import'],
          ['Story', 'A user-facing slice of value', 'Admin can preview an Excel file before importing'],
          ['Task', 'Technical work without direct user value', 'Add exceljs and a uuid override'],
          ['Bug', 'Something does not work as specified', 'Import button hidden below a long preview'],
          ['Spike', 'Time-boxed research to reduce uncertainty', 'Can we get product photos safely? (1 day)'],
        ],
      },
      {
        type: 'code',
        lang: 'text',
        code: `Story: As an admin, I want to preview an Excel file before importing,
       so that I never save bad data by accident.

Acceptance criteria (Given / When / Then):
  Given a file with a wrong price on row 14
  When I press "Check file"
  Then I see "Products row 14, Price (USD): ..." and nothing is saved

  Given a valid file
  When I press "Import"
  Then all products are saved in one transaction, or none are`,
      },
      {
        type: 'list',
        items: [
          '**Definition of Ready** (before a ticket enters a sprint): clear acceptance criteria, design attached, dependencies known, estimated.',
          '**Definition of Done** (before a ticket is closed): reviewed and merged, tests pass, acceptance criteria met, docs updated, released, no new errors in monitoring.',
        ],
      },
      {
        type: 'code',
        lang: 'text',
        code: `Bug: Import button is off-screen after checking a large file

Steps to reproduce:
  1. Admin > Products > Import from Excel
  2. Choose a file with 300+ products, press "Check file"
Expected: an obvious way to import the checked file
Actual:   the Import button is below the 323-row preview; users think it imported
Environment: production admin, Chrome 1280x800
Severity: S3 (workaround: scroll)   Priority: P1 (blocks the catalog launch)
Evidence: screenshot attached`,
      },
      {
        type: 'table',
        head: ['', 'Severity', 'Priority'],
        rows: [
          ['Means', 'How bad the impact is (S1 outage ... S4 cosmetic)', 'How soon we fix it (P0 now ... P3 someday)'],
          ['Set by', 'QA / engineering', 'Product'],
          ['Example', 'A typo on the checkout button: S4', '...but P1 before a big sale launch'],
        ],
      },
      { type: 'callout', kind: 'shopverse', text: 'The bug report above is real: it happened with the ShopVerse import. Writing bugs this way (steps, expected, actual, environment) is what makes them fixable by someone who never saw the problem.' },
    ],
    quiz: [
      { q: 'Which is a good acceptance criterion?', options: ['"Import should work well"', '"Given a valid file, when I press Import, then all rows are saved or none"', '"Make it fast"', '"Like Shopify"'], answer: 1, why: 'Testable, specific, and a QA engineer can say yes or no without asking you.' },
      { q: 'Severity vs priority: which statement is true?', options: ['They are the same thing', 'Severity is impact, priority is the order of work', 'Priority is set by QA', 'Severity is set by the customer'], answer: 1, why: 'A low-severity bug can still be top priority if timing makes it critical.' },
      { q: 'Which of these is NOT part of a usual Definition of Done?', options: ['Code reviewed', 'Tests passing', 'The developer likes the code', 'Acceptance criteria met'], answer: 2, why: 'Done is objective and checkable by anyone on the team.' },
    ],
  },

  {
    slug: 'git',
    title: 'Git, pull requests and code review',
    minutes: 12,
    summary: 'How code gets from your laptop into main, safely.',
    blocks: [
      {
        type: 'table',
        head: ['Strategy', 'How', 'Used by'],
        rows: [
          ['Trunk-based', 'Short-lived branches (hours to a few days) off `main`, merged often; unfinished work hidden behind feature flags', 'Most web product companies'],
          ['GitFlow', '`develop` and `release/*` branches next to `main`', 'Versioned releases: mobile apps, installed software'],
        ],
      },
      {
        type: 'list',
        items: [
          '**Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`. Tools can build changelogs from them.',
          'One logical change per commit; the message says **why**, the diff already shows what.',
          '**Small PRs** (roughly under 400 changed lines) get reviewed faster and better.',
          'A PR description has: what changed, why, how it was tested, screenshots for UI, and the ticket link.',
          'Review your own PR first, keep CI green, and answer every comment (fix it or explain).',
        ],
      },
      {
        type: 'list',
        items: [
          'As a **reviewer**: check correctness, security, tests and readability, in that order.',
          'Comment on the code, never the person. Ask questions ("what happens if the list is empty?").',
          'Mark small things as `nit:` so the author knows they do not block the merge.',
        ],
      },
      { type: 'callout', kind: 'rule', title: 'Two rules nobody breaks', text: 'Never force-push to `main`. Never commit secrets. If a secret leaks, **rotate it immediately**: removing the commit is not enough, because clones, forks and caches already have it.' },
      { type: 'callout', kind: 'shopverse', text: 'You used this flow: `feat/product-import` → PR #1 → merge → Render and Vercel deploy `main`. Your Git is set to `pull.rebase=true`, which keeps history linear, and `push -u` links a branch to its remote copy.' },
    ],
    quiz: [
      { q: 'Your PR is 2,000 lines. What would a senior engineer suggest?', options: ['Merge it quickly', 'Split it into smaller PRs that can be reviewed one by one', 'Ask for no review', 'Squash it into one line'], answer: 1, why: 'Big PRs get skimmed, not reviewed. Small PRs find more bugs.' },
      { q: 'You pushed an API key to GitHub. First step?', options: ['Delete the commit', 'Rotate (revoke and replace) the key', 'Make the repo private', 'Wait and see'], answer: 1, why: 'Assume it is already copied. Rotating makes the leaked key useless; then clean up the history.' },
      { q: 'What does a good commit message explain?', options: ['Which files changed', 'Why the change was made', 'The time of day', 'Nothing, the code explains itself'], answer: 1, why: 'The diff shows what changed. Only the message can tell a future reader why.' },
    ],
  },

  {
    slug: 'quality',
    title: 'Testing and quality',
    minutes: 10,
    summary: 'Confidence to change code without fear.',
    blocks: [
      {
        type: 'table',
        head: ['Level', 'Tests', 'Speed', 'How many'],
        rows: [
          ['Unit', 'One function or component in isolation', 'Milliseconds', 'Many'],
          ['Integration / API', 'Several parts together: route, validation, database', 'Seconds', 'Some'],
          ['End-to-end (E2E)', 'The real app in a browser: log in, check out', 'Minutes', 'A few critical paths'],
        ],
      },
      {
        type: 'list',
        items: [
          'Test **behaviour**, not implementation: "an invalid price is reported on its row", not "function X was called twice".',
          'Cover the edges: empty, maximum, invalid input, two users at once, the network failing.',
          'Every fixed bug gets a **regression test** that fails without the fix.',
          'A **flaky** test (passes and fails with no change) is a bug: find the cause, do not just rerun it.',
          'Environments: local → dev → **staging** (production-like) → production. Each with its own database.',
        ],
      },
      { type: 'callout', kind: 'mistake', text: 'Testing against production data, or letting tests share one database with developers. One test run can wipe real data.' },
      { type: 'callout', kind: 'shopverse', text: 'ShopVerse has API tests on a separate test database that **refuses** to run against the dev one. The import\'s jsonb key-order bug only appeared at full scale (323 products); its regression test was checked to fail without the fix. And the intermittent fast failures you saw are a flaky-test problem still waiting to be fixed.' },
    ],
    quiz: [
      { q: 'Where should most of your tests be?', options: ['E2E', 'Unit and integration', 'Manual testing', 'In production'], answer: 1, why: 'Fast tests at the bottom of the pyramid give quick feedback; a few E2E tests guard the critical paths.' },
      { q: 'You fixed a bug. What else should you add?', options: ['A comment saying "fixed"', 'A test that fails without the fix', 'Nothing', 'A new feature'], answer: 1, why: 'A regression test makes sure the bug never quietly comes back.' },
      { q: 'A test sometimes fails, then passes on rerun. What is it?', options: ['Fine, rerun it', 'A flaky test: a real problem to investigate', 'A server issue, ignore it', 'Proof the code works'], answer: 1, why: 'Flaky tests hide real bugs and teach the team to ignore red builds.' },
    ],
  },

  {
    slug: 'release',
    title: 'CI/CD, releases and database changes',
    minutes: 10,
    summary: 'Shipping safely, many times a day.',
    blocks: [
      {
        type: 'steps',
        items: [
          { title: 'Continuous Integration (on every PR)', text: 'Install, lint, type-check, test, build, scan dependencies (`npm audit`). Any red step blocks the merge.' },
          { title: 'Merge to main', text: 'Branch protection: PR required, checks green, at least one approval.' },
          { title: 'Continuous Delivery', text: 'Deploy to staging automatically, run smoke tests, then promote to production.' },
          { title: 'Progressive rollout', text: 'Feature flag on for staff → 5% → 50% → 100%, watching error rates at each step.' },
          { title: 'Rollback plan', text: 'Know how to undo before you ship: redeploy the previous build, or turn the flag off.' },
        ],
      },
      { type: 'p', text: '**Database migrations** are the riskiest part of a release, because old and new code run side by side during a deploy. The safe pattern is **expand and contract**:' },
      {
        type: 'steps',
        items: [
          { title: 'Expand', text: 'Add the new column as nullable. Old code keeps working.' },
          { title: 'Dual write', text: 'Deploy code that writes both the old and the new column.' },
          { title: 'Backfill', text: 'Fill the new column for existing rows, in batches.' },
          { title: 'Switch reads', text: 'Deploy code that reads the new column.' },
          { title: 'Contract', text: 'Later, remove the old column once nothing uses it.' },
        ],
      },
      { type: 'callout', kind: 'mistake', text: 'Renaming or dropping a column in one step. For a few minutes during the deploy, the old code still asks for the old column and every request fails.' },
      { type: 'callout', kind: 'shopverse', text: 'Render runs `prisma migrate deploy` when the API starts, and Vercel deploys `main` on every push. Your hardest lesson: a shadow-database setting once wiped the dev database. Always check which database a command points at before running it, and never run `migrate dev` or `reset` against a real one.' },
    ],
    quiz: [
      { q: 'You need to rename `users.name` to `users.fullName`. Safe approach?', options: ['Rename it in one migration', 'Add `fullName`, write both, backfill, switch reads, then drop `name`', 'Drop the table and recreate it', 'Do it on Friday evening'], answer: 1, why: 'Expand and contract keeps old and new code working throughout the deploy.' },
      { q: 'What should block a merge to main?', options: ['A failing test or lint check', 'A missing emoji', 'A long PR title', 'Nothing'], answer: 0, why: 'CI is the gate that keeps main always deployable.' },
      { q: 'Why ship behind a feature flag?', options: ['To hide bugs forever', 'To release gradually and turn a feature off without a redeploy', 'Flags make code faster', 'Because QA asks for it'], answer: 1, why: 'Flags separate deploying code from releasing a feature, which makes rollback instant.' },
    ],
  },

  {
    slug: 'operations',
    title: 'Running in production: monitoring and incidents',
    minutes: 10,
    summary: 'What happens after the deploy, and when things break at 2 a.m.',
    blocks: [
      {
        type: 'list',
        items: [
          '**Logs**: structured (JSON), with a request id on every line, so one request can be followed through all services. Never log passwords, tokens or personal data.',
          '**Metrics**: request rate, error rate, latency (p95 and p99, not the average), saturation (CPU, memory, DB connections).',
          '**Traces**: one request\'s path through services, with timings.',
          '**Alerts** on symptoms users feel (error rate up, checkout slow), not on every single error.',
        ],
      },
      {
        type: 'table',
        head: ['Term', 'Meaning', 'Example'],
        rows: [
          ['SLI', 'What you measure', 'Share of requests answered in under 500 ms'],
          ['SLO', 'Your internal target', '99.9% of requests, per month'],
          ['SLA', 'A contract with customers, with penalties', '99.5%, or the customer gets credits'],
          ['Error budget', 'The failure your SLO allows', '99.9% ≈ 43 minutes of downtime a month'],
        ],
      },
      {
        type: 'steps',
        items: [
          { title: 'Detect', text: 'An alert fires, or a customer reports it.' },
          { title: 'Declare', text: 'Set a severity and name an incident commander, who coordinates (and does not debug).' },
          { title: 'Communicate', text: 'Status page and stakeholders: what is affected, when the next update comes.' },
          { title: 'Mitigate first', text: 'Stop the bleeding: roll back, turn off the flag, scale up. Find the root cause afterwards.' },
          { title: 'Resolve', text: 'Confirm the metrics are back to normal.' },
          { title: 'Blameless postmortem', text: 'Timeline, root cause (5 whys), what went well, and action items with owners and dates. It asks "how did the system allow this?", never "who did it?".' },
        ],
      },
      { type: 'callout', kind: 'shopverse', text: 'ShopVerse has a `GET /api/health` endpoint, the "waking up the server" banner, the error popup for 5xx answers, and a retry when the CMS database wakes up (`cms/src/lib/prisma.js`). The next professional steps are structured logs with request ids, error tracking (Sentry) and an uptime monitor calling `/api/health`.' },
    ],
    quiz: [
      { q: 'Production is down after a deploy. First action?', options: ['Find the root cause', 'Roll back to the last good version', 'Write the postmortem', 'Blame the deploy'], answer: 1, why: 'Mitigate first. Root cause analysis happens after users are safe.' },
      { q: 'Why look at p95 latency instead of the average?', options: ['It is a smaller number', 'Averages hide the slow requests that real users feel', 'It is required by law', 'There is no difference'], answer: 1, why: 'If 5% of requests take 10 s, the average can still look fine.' },
      { q: 'What makes a postmortem "blameless"?', options: ['Nobody writes it', 'It fixes the system that allowed the mistake, not the person', 'It is kept secret', 'Only managers attend'], answer: 1, why: 'People hide mistakes when they are blamed. Blameless reviews find the real causes.' },
    ],
  },

  {
    slug: 'security',
    title: 'Security, privacy and compliance rules',
    minutes: 12,
    summary: 'The rules every developer follows, whatever their title.',
    blocks: [
      {
        type: 'table',
        head: ['Risk (OWASP Top 10)', 'Rule', 'In ShopVerse'],
        rows: [
          ['Broken access control', 'Check permissions on the **server** for every request; deny by default', '`requireRole` in `backend/src/middleware/auth.js`; "me" URLs so users can\'t ask for other ids'],
          ['Injection', 'Parameterised queries; validate every input', 'Prisma; Zod in `backend/src/middleware/validate.js`'],
          ['Authentication failures', 'Rate limits, short-lived tokens, rotation', '`backend/src/lib/rate-limiter.js`; refresh-token reuse detection in `auth.service.js`'],
          ['XSS', 'Never insert user HTML unsanitised', 'React escapes text; the CMS link field only allows store paths'],
          ['Security misconfiguration', 'Secure headers, strict CORS, no debug output in production', 'helmet, CORS limited to the store'],
          ['Vulnerable dependencies', 'Scan and update', '`npm audit`; the `uuid` override for exceljs'],
        ],
      },
      {
        type: 'list',
        items: [
          '**Secrets** live in environment variables, never in code, chat, screenshots or logs. Each service gets its own key with the least access it needs.',
          '**Least privilege**: people and services get only the access their job needs.',
          '**Audit logs** for sensitive actions: who changed what, and when.',
        ],
      },
      { type: 'p', text: '**Privacy law.** In India, the **Digital Personal Data Protection (DPDP) Act, 2023** applies to personal data of people in India; GDPR applies to people in the EU. The core rules are similar:' },
      {
        type: 'list',
        items: [
          'Collect personal data only for a stated purpose, with consent, and only what you need (data minimisation).',
          'Users can access, correct and erase their data.',
          'Protect it, and report breaches to the authority and the affected users.',
          'Never put personal data (emails, phone numbers, addresses) in logs or analytics events.',
        ],
      },
      { type: 'callout', kind: 'shopverse', text: 'Deleting a customer who has orders **anonymises** them instead (`customers.service.js`): the personal data goes, the order history needed for accounting stays. That is exactly how companies balance "right to erasure" with legal record-keeping.' },
      { type: 'callout', kind: 'mistake', text: 'Hiding a button on the frontend and calling it access control. Anyone can call the API directly with curl. The frontend check is UX; the server check is security.' },
    ],
    quiz: [
      { q: 'A Viewer can\'t see the Delete button. Is the delete endpoint safe?', options: ['Yes, the button is hidden', 'Only if the server also checks the role', 'Yes, if the URL is secret', 'Yes, React protects it'], answer: 1, why: 'Hidden buttons are UX. Only the server decides what is allowed.' },
      { q: 'Which is fine to write to logs?', options: ['The user\'s password', 'The access token', 'A request id and the status code', 'The user\'s phone number'], answer: 2, why: 'Logs are read by many people and kept for a long time. Keep secrets and personal data out.' },
      { q: 'A customer asks you to delete their account, but they have paid orders. Usual approach?', options: ['Refuse', 'Delete everything, including invoices', 'Anonymise personal data and keep the records the law requires', 'Ignore the request'], answer: 2, why: 'Erasure rights and record-keeping laws both apply; anonymisation satisfies both.' },
    ],
  },

  {
    slug: 'case-study',
    title: 'Case study: designing a Jira-like tool (TaskFlow Pro)',
    minutes: 15,
    summary: 'The key design decisions behind a project management product, with corrections to common advice.',
    blocks: [
      { type: 'p', text: 'TaskFlow Pro is a mini Jira: **workspace → project → board → task → subtasks and comments**, with roles, a drag-and-drop Kanban board, a table view, a dashboard and live updates. These are the decisions that make it work:' },
      {
        type: 'table',
        head: ['Problem', 'Design', 'Why'],
        rows: [
          ['Many companies in one app', '**Multi-tenancy**: one database, `workspace_id` on every row, middleware checks membership before any query', 'Simple, and fine up to thousands of tenants'],
          ['Who can do what', '**RBAC**: Owner, Admin, Member, Viewer, checked on the server per route', 'Clear, testable permission boundaries'],
          ['Readable ids like PROJ-042', 'A counter per project, incremented inside the transaction that creates the task', 'Two users creating tasks at once still get different numbers'],
          ['Drag a card between two others', '**Fractional indexing**: give it a position between its neighbours', 'Only the moved row is updated, not the whole column'],
          ['Board must feel instant', '**Optimistic update**: move the card at once, call the API, roll back on failure', 'The user never waits for the network'],
          ['Teammates see changes live', '**WebSockets** (Socket.io), one room per project; events update the shared cache', 'Board, table and dashboard all refresh from one event'],
          ['"Who changed this?"', '**Activity log**: field, old value, new value, user, time', 'Accountability and debugging'],
          ['Undo a deletion', '**Soft delete**: `archivedAt` instead of DELETE', 'Restore and audit; no broken references'],
        ],
      },
      {
        type: 'code',
        lang: 'js',
        code: `// Optimistic move with TanStack Query v5 (note the { queryKey } object syntax)
const moveTask = useMutation({
  mutationFn: ({ taskId, statusId, position }) =>
    api.patch(\`/tasks/\${taskId}/position\`, { statusId, position }),
  onMutate: async (move) => {
    await queryClient.cancelQueries({ queryKey: ['tasks', projectId] }); // no stale refetch overwrites us
    const previous = queryClient.getQueryData(['tasks', projectId]);
    queryClient.setQueryData(['tasks', projectId], (tasks) => applyMove(tasks, move));
    return { previous }; // kept for the rollback
  },
  onError: (_error, _move, context) => {
    queryClient.setQueryData(['tasks', projectId], context.previous);
    toast.error('Could not move the task. It is back where it was.');
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }),
});`,
      },
      {
        type: 'code',
        lang: 'js',
        code: `// Fractional indexing with string keys (npm package "fractional-indexing")
import { generateKeyBetween } from 'fractional-indexing';
const position = generateKeyBetween(above?.position ?? null, below?.position ?? null);
// e.g. 'a0' and 'a1' -> 'a0V'. Strings never run out of precision, unlike 1.5, 1.25, 1.125...`,
      },
      {
        type: 'table',
        head: ['Common advice', 'More accurate'],
        rows: [
          ['"Remember me" extends the JWT to 30 days', 'Extend the **refresh token**; access tokens stay short-lived'],
          ['Lock the account after 5 failed logins', 'Lockout lets anyone lock out a victim. Throttle per IP and email instead'],
          ['Positions as floats (1.5, 1.25 ...)', 'Floats lose precision after many moves; use string keys'],
          ['"Shared database, separate schemas"', 'What is described is a shared **schema** with a tenant id column'],
          ['Web Vitals: FID under 100 ms', 'FID was replaced by **INP** (Interaction to Next Paint) in 2024'],
          ['Always SameSite=Strict cookies', 'Strict breaks redirects back from payment or login providers; Lax plus CSRF checks is common'],
          ['`cancelQueries([\'tasks\'])`', 'TanStack Query v5 takes an object: `cancelQueries({ queryKey: [...] })`'],
          ['Resume: "50+ users", "0 ms latency"', 'Only claim numbers you measured and can explain'],
        ],
      },
      { type: 'callout', kind: 'shopverse', text: 'You already built several of these. The cart uses an **optimistic update** with rollback (`frontend/src/features/cart/cart.api.js`). Invoice numbers come from a **locked counter row** in a transaction (`backend/src/modules/orders/invoice.js`), the same idea as PROJ-042 ids. The Stripe webhook is **idempotent** by event id (`stripe-webhook.js`).' },
    ],
    quiz: [
      { q: 'How does multi-tenancy keep companies\' data apart in one database?', options: ['Separate servers per company', 'Every row has a workspace id and every query is checked against the user\'s membership', 'Hidden URLs', 'Frontend filtering'], answer: 1, why: 'Scoping every query by tenant, enforced in middleware, is the standard SaaS approach.' },
      { q: 'Why fractional indexing for card order?', options: ['It looks clever', 'Moving a card updates one row instead of renumbering the whole column', 'It sorts faster', 'Databases require it'], answer: 1, why: 'One write per drag keeps moves fast and avoids conflicts between users.' },
      { q: 'In an optimistic update, what does onMutate return?', options: ['The server response', 'The previous data, so onError can roll back', 'Nothing', 'An error'], answer: 1, why: 'Saving the previous state is what makes the instant change safe to undo.' },
    ],
  },

  {
    slug: 'interview',
    title: 'Talking about your work in interviews',
    minutes: 8,
    summary: 'How to turn what you built into clear, honest, memorable answers.',
    blocks: [
      {
        type: 'steps',
        items: [
          { title: 'Situation', text: 'The context in one or two sentences.' },
          { title: 'Task', text: 'What you had to achieve, and the constraint that made it hard.' },
          { title: 'Action', text: 'What **you** did, step by step, and why you chose that approach over the alternatives.' },
          { title: 'Result', text: 'What happened, ideally a number you measured, and what you learned.' },
        ],
      },
      {
        type: 'code',
        lang: 'text',
        code: `"Tell me about a bug you found."

S: I built a bulk product import from Excel for my e-commerce project.
T: Re-importing the same file had to report "no changes", or admins
   would never trust the preview.
A: Testing at full scale (323 products), the second run claimed 76
   products had changed. I traced it to PostgreSQL jsonb, which stores
   object keys in its own order, so my JSON.stringify comparison saw
   differences that weren't there. I switched to a key-order-insensitive
   comparison and added a regression test, which I confirmed fails
   without the fix.
R: Re-imports now report 323 unchanged. Lesson: test at realistic
   scale, because small fixtures hid the bug.`,
      },
      {
        type: 'list',
        items: [
          'Prefer numbers you can defend: "66 API tests", "323 products imported in about 5 seconds in one transaction".',
          'Say "I" for your work and "we" for the team\'s. Interviewers want to know what **you** did.',
          'Have a trade-off ready for every decision: "I chose X over Y because Z; Y would be better if...".',
          'It is fine to say "I don\'t know, but here is how I would find out." Bluffing is worse.',
        ],
      },
      {
        type: 'table',
        head: ['Common question', 'What they are really testing'],
        rows: [
          ['"Walk me through your project"', 'Can you explain a system clearly, at the right level of detail?'],
          ['"What was the hardest part?"', 'Depth: did you solve real problems, or follow a tutorial?'],
          ['"What would you change?"', 'Self-awareness and judgement'],
          ['"How did you test it?"', 'Professional habits'],
          ['"How would it scale to 100x users?"', 'System design thinking: bottlenecks, caching, queues'],
        ],
      },
      { type: 'callout', kind: 'interview', text: 'Your ShopVerse answers are strongest where something went wrong and you fixed it properly: the unsafe images you caught before shipping, the jsonb bug, the refresh-token reuse detection. Real problems, solved carefully, beat a long feature list.' },
    ],
    quiz: [
      { q: 'In STAR, what should the "Action" part focus on?', options: ['What the team did', 'What you did and why', 'The company history', 'The tools list'], answer: 1, why: 'Interviewers are hiring you, not your team.' },
      { q: 'Which resume line is strongest?', options: ['"Worked on many features"', '"Built an Excel import that validates every row and saves 323 products in one transaction"', '"Expert in everything"', '"Served millions of users" (unmeasured)'], answer: 1, why: 'Specific, verifiable and easy to ask follow-up questions about.' },
      { q: 'You don\'t know the answer to a question. Best response?', options: ['Make something up', 'Stay silent', 'Say so, then reason out loud about how you\'d find out', 'Change the subject'], answer: 2, why: 'Honest reasoning shows how you work; bluffing destroys trust.' },
    ],
  },
];

// Three tracks: how companies win and run projects, how engineers build them, and how leads run teams.
export const TRACKS = ['business', 'engineering', 'leadership'];
// Each module = its basics, then a "Deep dive" (deep-dives.js): examples, templates, checklists, 2 more questions
const withDeepDive = (m) => {
  const deep = DEEP_DIVES[m.slug];
  if (!deep) return m;
  return { ...m, minutes: m.minutes + deep.minutes, blocks: [...m.blocks, { type: 'deep' }, ...deep.blocks], quiz: [...m.quiz, ...deep.quiz] };
};

// The order a learner meets them: a deal from first contact to support, then life and rules
// inside the company; then engineering from team roles to interviews.
const ORDER = [
  'idea-to-live', 'company-types', 'bidding', 'contracts', 'account-management', 'initiation', 'delivery',
  'communication', 'go-live', 'risk-continuity', 'company-life', 'hr-policies', 'legal-tax', 'compliance-finance',
  'ip-licences',
  'roles', 'lifecycle', 'agile', 'tickets', 'git', 'quality', 'release', 'operations', 'security',
  'tech-debt', 'case-study', 'interview',
  'leading-team', 'hiring', 'managing-performance', 'budgets-planning', 'stakeholders-org',
];
const ALL = [
  ...BUSINESS_MODULES,
  ...EXTRA_BUSINESS,
  ...ENGINEERING_MODULES.map((m) => ({ ...m, track: 'engineering' })),
  ...EXTRA_ENGINEERING,
  ...HR_LEGAL_MODULES,
  ...LEADERSHIP_MODULES,
];
const bySlug = new Map(ALL.map((m) => [m.slug, m]));

export const MODULES = ORDER.map((slug) => bySlug.get(slug)).map(withDeepDive);
