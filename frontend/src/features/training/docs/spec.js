// "TaskFlow Pro: Complete Feature Specification & Build Guide" (the shared PDF), as data.
// The text follows the PDF; DocumentPage.jsx draws it. Tags like [MUST HAVE] in the text become
// coloured badges. { type: 'callout', kind: 'review' } boxes are OUR notes where the PDF is out of
// date or inaccurate: they are separate from the original text and can be hidden on the page.
import { code, h, li, note, p, table } from './blocks';

export const SPEC = {
  slug: 'spec',
  title: 'TaskFlow Pro',
  subtitle: 'Complete Feature Specification & Build Guide',
  intro:
    'A production-grade, real-time Project Management Dashboard designed to showcase frontend-heavy full-stack development skills for experienced developers (4+ years) targeting top Bangalore tech companies.',
  legend: [
    ['MUST HAVE', 'Core features — build these first'],
    ['GOOD TO HAVE', 'Strong differentiators'],
    ['WOW FACTOR', 'Interview gold — makes you memorable'],
  ],
  footer: 'Generated on September 22, 2026. Good luck with your job search!',
  sections: [
    {
      id: 'overview',
      title: '1. Project Overview & Why This Project',
      blocks: [
        h('What Is TaskFlow Pro?'),
        p('A real-time, collaborative project management dashboard — a mini Jira + Linear + Notion hybrid. Teams can create workspaces, manage projects, track tasks on a Kanban board or table view, view analytics, get AI-powered suggestions, and collaborate in real-time.'),
        h('Why This Beats Other Project Ideas'),
        li(
          '**Complex state management** — nested data: workspace → project → board → column → task → subtask → comment',
          '**Real product UI patterns** — drag-and-drop, modals, popovers, toasts, infinite scroll, optimistic updates',
          '**Full-stack proof** — auth, REST API, database design, WebSockets, file uploads',
          "**AI integration** — proves you're current with 2026 trends",
          '**Every company can relate** — every interviewer has used Jira / Trello / Asana',
          '**Not a tutorial clone** — original product with real-world complexity',
        ),
        h('What Interviewers Will See'),
        table(
          ['Skill Demonstrated', 'How TaskFlow Pro Proves It'],
          [
            ['Complex UI / State', 'Kanban drag-drop, nested modals, multi-step forms'],
            ['API Design', '35+ REST endpoints with auth, pagination, filtering'],
            ['Database Design', '12+ tables with relations, indexes, migrations'],
            ['Real-Time', 'WebSocket live updates, presence indicators'],
            ['TypeScript', 'Strict mode, shared types across frontend & backend'],
            ['Performance', 'Optimistic updates, virtualized lists, skeleton loaders'],
            ['Testing', 'Unit, component, integration, E2E tests'],
            ['DevOps', 'CI/CD pipeline, Docker, cloud deployment'],
            ['AI Integration', 'OpenAI API for task description & subtask generation'],
            ['Responsive Design', 'Mobile-first with touch-friendly interactions'],
            ['Accessibility', 'WCAG 2.1 AA, keyboard navigation, screen reader support'],
            ['Security', 'JWT + refresh tokens, rate limiting, input sanitization'],
          ],
        ),
      ],
    },
    {
      id: 'auth',
      title: '2. Authentication & User Management',
      blocks: [
        h('2.1 Sign Up [MUST HAVE]'),
        li(
          'Email + Password registration with strong password validation (min 8 chars, 1 uppercase, 1 number, 1 special char)',
          'Real-time inline validation — show ✓/✕ next to each field as user types',
          "Email verification flow — send OTP or magic link, show 'check your inbox' screen",
          'Prevent duplicate email registration with clear error message',
          'Terms & conditions checkbox (required)',
          'Password strength meter (Weak / Fair / Strong / Very Strong) with color bar',
        ),
        h('2.2 Login [MUST HAVE]'),
        li(
          'Email + Password login',
          "'Remember me' checkbox — extends JWT expiry to 30 days",
          'Show/hide password toggle (eye icon)',
          'Rate limiting — lock account after 5 failed attempts for 15 minutes',
          "Clear error messages: 'Invalid email or password' (never reveal which one is wrong)",
          'Redirect to original requested page after login (return URL)',
        ),
        note('review', '"Remember me" should extend the **refresh token** (the cookie), not the JWT access token, which stays short-lived. And a hard account lock lets anyone lock a victim out by typing wrong passwords; throttling per IP + email (as ShopVerse does) protects without that risk.'),
        h('2.3 OAuth Social Login [GOOD TO HAVE]'),
        li(
          "Google OAuth 2.0 — 'Continue with Google' button",
          "GitHub OAuth — 'Continue with GitHub' button",
          'Auto-create account if first time, auto-link if email matches existing account',
        ),
        h('2.4 Forgot Password [MUST HAVE]'),
        li(
          'Enter email → receive password reset link (expires in 1 hour)',
          'Reset password page with new password + confirm password',
          "Success screen: 'Password changed! Redirecting to login...'",
          'Invalidate all existing sessions after password reset',
        ),
        h('2.5 User Profile [MUST HAVE]'),
        li(
          'Profile picture upload (crop & resize before upload, max 2MB)',
          'Display name, email (read-only), bio, job title, timezone',
          'Change password (current password required)',
          "Delete account with 'type DELETE to confirm' safety modal",
          'Download my data — GDPR-style data export',
        ),
        h('2.6 Session Management [GOOD TO HAVE]'),
        li(
          'JWT access token (15 min expiry) + refresh token (7 days, stored in httpOnly cookie)',
          "Silent token refresh — user never sees 'session expired' unless truly expired",
          'View active sessions — show device, browser, IP, last active',
          "'Log out of all devices' button",
          'Session revocation on password change',
        ),
      ],
    },
    {
      id: 'workspace',
      title: '3. Workspace & Project Management',
      blocks: [
        h('3.1 Workspaces [MUST HAVE]'),
        li(
          'Create workspace with name, description, logo/icon',
          'Workspace switcher in sidebar — dropdown showing all workspaces user belongs to',
          'Invite members by email — sends email invitation with join link',
          'Member roles: **Owner** (full control), **Admin** (manage projects & members), **Member** (create & edit tasks), **Viewer** (read-only)',
          'Members list page — avatar, name, role, joined date, last active',
          'Remove member / change role (Owner & Admin only)',
          'Leave workspace option',
          'Workspace-level activity feed — all recent actions across all projects',
        ),
        h('3.2 Projects [MUST HAVE]'),
        li(
          'Create project with: name, description, color/icon, start date, end date',
          'Project status: Active, On Hold, Completed, Archived',
          'Project sidebar showing all projects in current workspace (collapsible)',
          'Star/favorite projects — starred ones appear at top of sidebar',
          'Archive project (soft delete — can restore later)',
          'Duplicate project — copies structure, labels, and settings (not tasks)',
          'Project README/description page — Markdown-rendered',
        ),
        h('3.3 Project Settings [GOOD TO HAVE]'),
        li(
          "Custom task statuses per project (e.g., 'In QA', 'UAT', 'Deployed')",
          'Custom labels/tags with colors',
          'Priority levels: Urgent, High, Medium, Low, No Priority',
          'Default assignee setting',
          'Estimation type: Story Points, Hours, T-shirt sizes (S/M/L/XL)',
          'Project-level notification settings',
        ),
      ],
    },
    {
      id: 'tasks',
      title: '4. Task Management Core',
      blocks: [
        h('4.1 Create Task [MUST HAVE]'),
        li(
          "**Quick create** — press 'C' or click '+' → inline title input → Enter to create (assigns to current user, current project, 'To Do' status)",
          '**Full create modal** — all fields listed below',
          'Auto-generated task ID: PROJ-001, PROJ-002 (like Jira)',
          'Task templates — save frequently used task structures as templates [WOW FACTOR]',
        ),
        h('4.2 Task Fields [MUST HAVE]'),
        li(
          '**Title** — required, max 200 chars',
          '**Description** — rich text editor (bold, italic, bullet lists, code blocks, links, @mention users)',
          '**Status** — To Do → In Progress → In Review → Done (customizable per project)',
          '**Priority** — Urgent (red), High (orange), Medium (yellow), Low (green), No Priority (gray)',
          '**Assignee** — single user, with avatar display',
          '**Reporter** — auto-set to task creator',
          '**Labels/Tags** — multiple selection, colored badges',
          "**Due date** — date picker with calendar, shows 'overdue' badge in red if past",
          '**Start date** — optional',
          '**Estimation** — story points (Fibonacci: 1, 2, 3, 5, 8, 13, 21) or hours',
          '**Sprint/Cycle** — assign to a sprint',
          '**Custom fields** — text, number, dropdown, date (per project) [WOW FACTOR]',
        ),
        h('4.3 Task Detail Panel [MUST HAVE]'),
        li(
          'Opens as a **slide-over panel** from right side (not a new page — keeps board visible behind)',
          'Also accessible as a full page via URL: /project/PROJ/task/PROJ-042',
          'Breadcrumb: Workspace → Project → Task ID',
          "Activity log at bottom — shows all changes: 'Ravi changed status from To Do to In Progress • 2h ago'",
          'Created date, updated date, time-in-status',
          "Related tasks — link tasks as 'blocks', 'is blocked by', 'related to' [GOOD TO HAVE]",
        ),
        h('4.4 Subtasks [GOOD TO HAVE]'),
        li(
          'Add subtasks within a task — each has title, assignee, status (checkbox done/not done)',
          "Progress bar showing '3/5 subtasks complete'",
          'Convert a subtask to a standalone task',
        ),
        h('4.5 Comments [MUST HAVE]'),
        li(
          'Rich text in comments (bold, italic, code, links)',
          '@mention users — triggers notification',
          'Edit / delete own comments',
          'Reactions on comments — thumbs up, heart, celebration (emoji picker)',
          'Threaded replies on comments [GOOD TO HAVE]',
        ),
        h('4.6 Attachments [GOOD TO HAVE]'),
        li(
          'Drag-and-drop file upload onto a task',
          'Image preview inline (thumbnails)',
          'File types: images, PDFs, docs — max 10MB per file',
          'Upload progress bar with cancel option',
        ),
        h('4.7 Task Actions [MUST HAVE]'),
        li(
          'Duplicate task',
          'Move task to another project',
          'Copy task link (shareable URL)',
          'Delete task — with confirmation modal',
          'Bulk actions — select multiple tasks → change status, assignee, priority, labels, delete',
          'Task history/audit trail — full changelog per task [GOOD TO HAVE]',
        ),
      ],
    },
    {
      id: 'kanban',
      title: '5. Kanban Board (Drag & Drop)',
      blocks: [
        h('5.1 Board Layout [MUST HAVE]'),
        li(
          'Columns = task statuses (To Do, In Progress, In Review, Done)',
          'Each column shows: column title + task count badge',
          'Task cards show: title, task ID, priority icon, assignee avatar, due date, label badges, subtask progress, comment count',
          'Column scrolls independently (vertical scroll per column)',
          'Board scrolls horizontally when columns overflow',
        ),
        h('5.2 Drag and Drop [MUST HAVE]'),
        li(
          'Drag task card between columns → updates status automatically',
          'Drag task card within a column → reorder (position saved to DB)',
          'Visual feedback: card lifts with shadow on grab, drop zone highlights',
          'Smooth animation on drop (200ms ease)',
          '**Optimistic update** — UI updates instantly, API call happens in background; if API fails, card snaps back with error toast',
          'Use @dnd-kit/core library (accessible, performant, touch-friendly)',
        ),
        h('5.3 Column Management [GOOD TO HAVE]'),
        li('Add / rename / reorder / delete columns', 'Column WIP limit — column header turns red when exceeded', 'Collapse/expand column'),
        h('5.4 Swimlanes [WOW FACTOR]'),
        li('Group tasks by: Assignee, Priority, Label, Sprint, None', 'Each swimlane is a horizontal row with its own set of columns', 'Collapse/expand individual swimlanes'),
        h('5.5 Board Filters [MUST HAVE]'),
        li(
          'Filter bar above board: filter by assignee, priority, label, due date',
          'Multiple filters combined (AND logic)',
          "'Only My Tasks' quick toggle",
          'Active filter count badge',
        ),
      ],
    },
    {
      id: 'table',
      title: '6. List / Table View',
      blocks: [
        h('6.1 Table Layout [MUST HAVE]'),
        li(
          'Spreadsheet-style table: Checkbox, Task ID, Title, Status, Priority, Assignee, Labels, Due Date, Estimation, Created',
          'Click task row → opens task detail panel',
          'Inline editing — click a cell to edit status, priority, assignee, due date directly',
        ),
        h('6.2 Sorting [MUST HAVE]'),
        li('Click column header to sort ascending/descending with sort icon indicator', 'Multi-column sort: hold Shift + click for secondary sort'),
        h('6.3 Filtering & Pagination [MUST HAVE]'),
        li(
          'Same filter bar as Kanban board (shared filter state)',
          'Column-level filters, text search, date range filter',
          "Pagination: 25/50/100 per page with 'Showing 1-25 of 142 tasks' text",
        ),
        h('6.4 Bulk Operations [GOOD TO HAVE]'),
        li("Checkbox select with floating action bar: '12 tasks selected → Change Status | Assignee | Priority | Delete'"),
        h('6.5 Grouping [GOOD TO HAVE]'),
        li('Group rows by: Status, Priority, Assignee, Label, Sprint', 'Collapsible groups with task count and subtotals'),
        h('6.6 Resizable & Reorderable Columns [WOW FACTOR]'),
        li('Drag column edges to resize', 'Drag column headers to reorder', 'Show/hide columns via column visibility menu', 'Column preferences saved per user'),
      ],
    },
    {
      id: 'dashboard',
      title: '7. Dashboard & Analytics',
      blocks: [
        h('7.1 Project Dashboard [MUST HAVE]'),
        li(
          '**Summary Cards** — Total Tasks, Open Tasks, Completed This Week, Average Completion Time, Overdue Count',
          '**Task Distribution Donut Chart** — tasks by status with counts',
          '**Priority Breakdown Bar Chart** — tasks by priority level',
          '**Tasks Created vs Completed Line Chart** — daily/weekly trend for last 30 days',
          '**Overdue Tasks Section** — red badge with list of overdue task IDs',
          'Date range selector: Last 7 days, Last 30 days, This Sprint, Custom Range',
          'Click chart segment → filter view to those tasks',
        ),
        h('7.2 Team Performance [GOOD TO HAVE]'),
        li(
          '**Workload by Assignee** — horizontal bar chart showing task count per team member',
          '**Completion Rate by Member** — who completes most tasks on time',
          '**Unassigned Tasks** — count and list',
        ),
        h('7.3 Sprint Dashboard [WOW FACTOR]'),
        li(
          '**Burndown Chart** — ideal line vs actual remaining story points',
          '**Velocity Chart** — story points completed per sprint (last 5 sprints)',
          '**Sprint Progress Bar** — percentage complete with days remaining',
          '**Scope Creep Indicator** — tasks added after sprint start (highlighted in orange)',
          '**Cumulative Flow Diagram** — stacked area chart showing tasks in each status over time',
        ),
      ],
    },
    {
      id: 'realtime',
      title: '8. Real-Time Collaboration',
      blocks: [
        h('8.1 Live Updates [MUST HAVE]'),
        li(
          'When User A drags a task, User B sees the task move in real-time (no refresh)',
          'New task / edited task / deleted task synced to all connected clients immediately',
          'Socket.io with room-per-project architecture',
          'Reconnection handling — auto-reconnect with exponential backoff',
          'Sync indicator in navbar: green dot = connected, orange = reconnecting, red = disconnected',
        ),
        h('8.2 Presence Indicators [GOOD TO HAVE]'),
        li("Green dot on online users' avatars", "'3 people viewing this board' indicator", "On task detail: 'Priya is also viewing this task' with avatar"),
        h('8.3 Conflict Resolution [WOW FACTOR]'),
        li("Last write wins + toast notification: 'Ravi just updated this task'", 'Optimistic UI with server reconciliation', 'If server rejects (conflict), revert with clear error toast'),
      ],
    },
    {
      id: 'ai',
      title: '9. AI-Powered Features',
      blocks: [
        h('9.1 Smart Task Description Generator [MUST HAVE]'),
        li(
          "Button: 'Generate with AI' next to description field",
          'Input: task title + project context',
          'Output: detailed acceptance criteria, steps to implement, edge cases',
          'User can accept, edit, or regenerate',
          'Streaming response — text appears word by word (typewriter effect)',
        ),
        h('9.2 AI Task Breakdown [WOW FACTOR]'),
        li("Button: 'Break into subtasks' on any task", 'AI suggests 3-7 subtasks based on title + description', "User checks/unchecks which to add → 'Add Selected' creates them all"),
        h('9.3 Smart Labels / Priority Suggestion [GOOD TO HAVE]'),
        li('AI auto-suggests priority and labels based on title keywords', 'Shows as ghost/suggested badges user can accept with one click'),
        h('9.4 Duplicate Task Detection [WOW FACTOR]'),
        li('On task creation, check if similar task exists using title similarity', "Show banner: 'Similar task found: PROJ-028. View it?'"),
        h('9.5 Daily Standup Summary [WOW FACTOR]'),
        li("Button: 'Generate Standup' on dashboard", 'AI reads recent activity and generates: Yesterday / Today / Blockers', 'Copy to clipboard button for Slack standup'),
        h('9.6 Natural Language Task Creation [WOW FACTOR]'),
        li("Type: 'Fix login bug on mobile, high priority, assign to Ravi, due Friday'", 'AI parses and pre-fills all fields → user confirms and creates'),
      ],
    },
    {
      id: 'search',
      title: '10. Search & Filtering',
      blocks: [
        h('10.1 Global Command Palette (Cmd+K) [MUST HAVE]'),
        li(
          'Press Cmd/Ctrl + K → opens search modal (command palette style)',
          'Search across: task titles, task IDs, project names, member names',
          'Results grouped by type: Tasks, Projects, Members',
          'Debounced search — 300ms delay',
          'Recent searches history (last 5)',
          'Keyboard navigation — arrow keys to move, Enter to select, Escape to close',
          "Quick actions: 'Create task', 'Go to settings', 'Switch workspace' [GOOD TO HAVE]",
        ),
        h('10.2 Advanced Filter Builder [GOOD TO HAVE]'),
        li(
          'Filter builder UI — add multiple conditions with AND/OR logic',
          "Save filter as a 'View' (e.g., 'My Urgent Tasks', 'Overdue Items')",
          'Saved views appear in sidebar under the project',
        ),
        h('10.3 URL-Driven Filters [GOOD TO HAVE]'),
        li('All active filters reflected in URL query params — shareable', 'Browser back/forward works with filter states'),
      ],
    },
    {
      id: 'notifications',
      title: '11. Notification System',
      blocks: [
        h('11.1 In-App Notifications [MUST HAVE]'),
        li(
          'Bell icon in navbar with unread count badge',
          'Notification types: assigned, commented, mentioned, status changed, due tomorrow, overdue, member joined',
          'Mark individual as read / Mark all as read',
          'Click notification → navigates to the relevant task',
          'Real-time — notifications appear instantly via WebSocket',
          "Grouped notifications: '3 new comments on PROJ-042' [GOOD TO HAVE]",
        ),
        h('11.2 Toast Notifications [MUST HAVE]'),
        li('Bottom-right corner toast for: success, error, warning, info', 'Auto-dismiss after 4 seconds, with manual close button', 'Retry button on error toasts', 'Stack multiple toasts vertically'),
        h('11.3 Email Notifications [GOOD TO HAVE]'),
        li('Daily digest email — summary of updates, mentions, overdue items', 'Immediate email for: assigned, @mentioned, due date reminder', 'Email preferences page — toggle per notification type'),
      ],
    },
    {
      id: 'settings',
      title: '12. Settings & Preferences',
      blocks: [
        li(
          '**Theme** — Light / Dark / System preference (auto) with sun/moon toggle [MUST HAVE]',
          '**Language / Locale** — date format (DD/MM/YYYY vs MM/DD/YYYY), timezone selector [GOOD TO HAVE]',
          '**Workspace Settings** — name, description, logo, manage members, pending invitations [MUST HAVE]',
          '**Notification Preferences** — toggle per type: in-app on/off, email on/off [GOOD TO HAVE]',
          '**Default Board View** — choose default landing: Board or List [GOOD TO HAVE]',
          '**Sidebar Collapse State** — remember expanded/collapsed per user [MUST HAVE]',
          '**Compact Mode** — reduce card sizes and spacing for power users [WOW FACTOR]',
        ),
      ],
    },
    {
      id: 'responsive',
      title: '13. Responsive Design & Mobile UX',
      blocks: [
        h('13.1 Breakpoints [MUST HAVE]'),
        li(
          '**Desktop** (1280px+) — full sidebar + board/table + task detail panel side-by-side',
          '**Tablet** (768px-1279px) — collapsible sidebar (hamburger), board scrolls horizontally',
          '**Mobile** (<768px) — bottom nav bar, board shows one column at a time with swipe, table switches to card list',
        ),
        h('13.2 Mobile-Specific UX [MUST HAVE]'),
        li(
          'Bottom navigation bar: Home, Projects, Create (+), Notifications, Profile',
          'Task detail opens as full-screen sheet (slide up from bottom)',
          'Swipe right on task card → quick status change',
          'Pull-to-refresh on task lists',
          'Touch-friendly drag-and-drop on Kanban board',
          'Floating Action Button (FAB) for quick task creation',
          'Skeleton loaders on all cards and lists',
        ),
      ],
    },
    {
      id: 'performance',
      title: '14. Performance & Error Handling',
      blocks: [
        h('14.1 Loading States [MUST HAVE]'),
        li(
          '**Skeleton screens** on every page (board: ghost columns + ghost cards, table: ghost rows, dashboard: ghost chart containers)',
          'Button loading state — spinner inside button + disabled state during API call',
          'Page-level loading bar at top (NProgress style)',
        ),
        h('14.2 Empty States [MUST HAVE]'),
        li(
          "No projects → illustration + 'Create your first project' CTA",
          "No tasks → 'Add a task to get started'",
          "No search results → 'No tasks match your filters'",
          "No notifications → 'You're all caught up!'",
        ),
        h('14.3 Error States [MUST HAVE]'),
        li(
          '**React Error Boundary** — catches render crashes with Retry button',
          '**API error handling** — every call has try/catch with specific messages',
          "**Network offline** — banner: 'You're offline. Changes will sync when you reconnect.'",
          '**Custom 404 page** and **403 page** (no permission)',
          "**Rate limit page** — 'Too many requests. Please wait.' with countdown",
        ),
        h('14.4 Optimistic Updates [MUST HAVE]'),
        li(
          'Status change / drag-drop → update UI instantly → API in background → revert on failure',
          "React Query's useMutation with onMutate (optimistic) + onError (rollback)",
        ),
        h('14.5 Caching & Performance [GOOD TO HAVE]'),
        li(
          'React Query caching — stale time 5 min, refetch on window focus',
          'Debounce search (300ms), throttle scroll events (100ms)',
          'Virtualized list for large task lists (react-virtual)',
          'Image lazy loading, code splitting with React.lazy + Suspense',
          'Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1',
          'Bundle analyzer — keep initial JS bundle under 200KB gzipped',
        ),
        note('review', 'Since March 2024 the Core Web Vitals use **INP** (Interaction to Next Paint, target under 200 ms) instead of FID.'),
      ],
    },
    {
      id: 'a11y',
      title: '15. Accessibility & Keyboard Navigation',
      blocks: [
        h('15.1 WCAG 2.1 AA Compliance [GOOD TO HAVE]'),
        li(
          'Color contrast ratio >= 4.5:1 for all text',
          'Focus indicators visible (blue ring) on all interactive elements',
          'All images have alt text, form labels linked with htmlFor',
          "Error messages announced by screen readers (aria-live='polite')",
          'Modal traps focus — Tab cycles within modal, Escape closes',
          'Skip navigation link for keyboard users',
          'Semantic HTML: proper heading hierarchy, landmark regions (nav, main, aside)',
        ),
        h('15.2 Keyboard Shortcuts [GOOD TO HAVE]'),
        li(
          'Cmd/Ctrl + K — global search | C — create task | B — board view | L — list view',
          'D — dashboard | Escape — close modal/panel | ? — show shortcuts help overlay',
          'Arrow keys navigate task cards on board',
        ),
      ],
    },
    {
      id: 'security',
      title: '16. Security Best Practices',
      blocks: [
        li(
          '**Input Sanitization** — sanitize all user inputs server-side to prevent XSS (use DOMPurify on frontend for rich text) [MUST HAVE]',
          '**SQL Injection Prevention** — Prisma ORM parameterizes all queries automatically [MUST HAVE]',
          '**CSRF Protection** — SameSite cookie attribute + CSRF token on state-changing requests [MUST HAVE]',
          '**Rate Limiting** — express-rate-limit: 100 requests/15min for API, 5 attempts for login [MUST HAVE]',
          '**Helmet.js** — sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options, CSP) [MUST HAVE]',
          '**CORS** — whitelist only your frontend domain [MUST HAVE]',
          '**Password Hashing** — bcrypt with salt rounds = 12 [MUST HAVE]',
          '**JWT Secret Rotation** — plan for secret rotation without mass logout [GOOD TO HAVE]',
          '**File Upload Validation** — validate MIME type, file size, and extension server-side [MUST HAVE]',
          '**Dependency Scanning** — npm audit in CI pipeline, Snyk or Socket for supply chain [GOOD TO HAVE]',
          '**API Input Validation** — Zod schemas on every endpoint; reject invalid payloads before business logic [MUST HAVE]',
        ),
      ],
    },
    {
      id: 'api',
      title: '17. API Design & Database Schema',
      blocks: [
        h('17.1 REST API Endpoints (35+) [MUST HAVE]'),
        table(
          ['Group', 'Method', 'Endpoint', 'Description'],
          [
            ['Auth', 'POST', '`/api/auth/register`', 'Create account'],
            ['Auth', 'POST', '`/api/auth/login`', 'Login, returns JWT'],
            ['Auth', 'POST', '`/api/auth/logout`', 'Invalidate refresh token'],
            ['Auth', 'POST', '`/api/auth/refresh-token`', 'Get new access token'],
            ['Auth', 'POST', '`/api/auth/forgot-password`', 'Send reset email'],
            ['Auth', 'POST', '`/api/auth/reset-password`', 'Reset with token'],
            ['Auth', 'GET', '`/api/auth/me`', 'Current user profile'],
            ['Workspace', 'GET', '`/api/workspaces`', "List user's workspaces"],
            ['Workspace', 'POST', '`/api/workspaces`', 'Create workspace'],
            ['Workspace', 'GET', '`/api/workspaces/:id`', 'Get workspace detail'],
            ['Workspace', 'PATCH', '`/api/workspaces/:id`', 'Update workspace'],
            ['Workspace', 'POST', '`/api/workspaces/:id/invite`', 'Invite member'],
            ['Workspace', 'GET', '`/api/workspaces/:id/members`', 'List members'],
            ['Project', 'GET', '`/api/workspaces/:wId/projects`', 'List projects'],
            ['Project', 'POST', '`/api/workspaces/:wId/projects`', 'Create project'],
            ['Project', 'PATCH', '`/api/projects/:id`', 'Update project'],
            ['Project', 'DELETE', '`/api/projects/:id`', 'Delete/archive'],
            ['Task', 'GET', '`/api/projects/:pId/tasks`', 'List tasks (filterable)'],
            ['Task', 'POST', '`/api/projects/:pId/tasks`', 'Create task'],
            ['Task', 'GET', '`/api/tasks/:id`', 'Get task detail'],
            ['Task', 'PATCH', '`/api/tasks/:id`', 'Update task fields'],
            ['Task', 'DELETE', '`/api/tasks/:id`', 'Delete task'],
            ['Task', 'PATCH', '`/api/tasks/:id/position`', 'Drag-drop reorder'],
            ['Task', 'POST', '`/api/tasks/:id/comments`', 'Add comment'],
            ['Task', 'GET', '`/api/tasks/:id/activity`', 'Task changelog'],
            ['Dashboard', 'GET', '`/api/projects/:pId/analytics/summary`', 'Summary cards'],
            ['Dashboard', 'GET', '`/api/projects/:pId/analytics/charts`', 'Chart data'],
            ['AI', 'POST', '`/api/ai/generate-description`', 'AI description'],
            ['AI', 'POST', '`/api/ai/suggest-subtasks`', 'AI subtask breakdown'],
            ['AI', 'POST', '`/api/ai/standup-summary`', 'AI standup generator'],
            ['Search', 'GET', '`/api/search?q=keyword`', 'Global search'],
            ['Notif.', 'GET', '`/api/notifications`', 'List notifications'],
            ['Notif.', 'PATCH', '`/api/notifications/read-all`', 'Mark all read'],
          ],
        ),
        h('17.2 Database Tables (PostgreSQL + Prisma) [MUST HAVE]'),
        li(
          '**User** — id, email, password_hash, name, avatar_url, timezone, created_at',
          '**Workspace** — id, name, description, logo_url, created_by, created_at',
          '**WorkspaceMember** — workspace_id, user_id, role (OWNER|ADMIN|MEMBER|VIEWER), joined_at',
          '**Project** — id, workspace_id, name, description, color, status, start_date, end_date',
          '**TaskStatus** — id, project_id, name, position, color',
          '**Task** — id, project_id, task_number, title, description, status_id, priority, assignee_id, reporter_id, parent_task_id, position, estimation, due_date, created_at, updated_at',
          '**Label** — id, project_id, name, color',
          '**TaskLabel** — task_id, label_id (many-to-many join)',
          '**Comment** — id, task_id, user_id, content, parent_comment_id, created_at',
          '**Attachment** — id, task_id, user_id, file_name, file_url, file_size, mime_type',
          '**Activity** — id, task_id, user_id, action, field, old_value, new_value, created_at',
          '**Notification** — id, user_id, type, title, message, task_id, is_read, created_at',
          '**Sprint** — id, project_id, name, start_date, end_date, status',
          '**Session** — id, user_id, refresh_token_hash, device, ip, expires_at',
        ),
        h('17.3 Database Indexing Strategy [GOOD TO HAVE]'),
        li(
          'Composite index on Task: (project_id, status_id, position) — for board queries',
          "Index on Task: (assignee_id) — for 'My Tasks' filter",
          'Index on Task: (due_date) — for overdue queries',
          'Index on Notification: (user_id, is_read) — for unread count',
          'Index on Activity: (task_id, created_at) — for task changelog',
        ),
      ],
    },
    {
      id: 'redis',
      title: '18. Caching & Redis Strategy',
      blocks: [
        li(
          '**Session store** — refresh tokens stored in Redis with TTL (7 days)',
          '**Rate limiting** — sliding window counter per IP/user in Redis',
          '**Socket.io adapter** — Redis adapter for multi-server WebSocket broadcasting',
          '**Dashboard cache** — cache analytics queries for 5 min (invalidate on task change)',
          '**User online status** — Redis SET of online user IDs per workspace',
          '**Search suggestions** — cache recent search queries per user [GOOD TO HAVE]',
        ),
      ],
    },
    {
      id: 'testing',
      title: '19. Testing Strategy',
      blocks: [
        h('19.1 Unit Tests [MUST HAVE]'),
        li(
          'Test utility functions — date formatting, priority sorting, filter logic',
          'Test custom hooks — useAuth, useDebounce, useWebSocket',
          'Test Zustand stores — task actions, filter state, auth state',
          'Tools: Jest + React Testing Library | Target: 15-20 tests',
        ),
        h('19.2 Component Tests [MUST HAVE]'),
        li(
          'TaskCard — renders priority, assignee, labels correctly',
          'LoginForm — validates inputs, shows errors, calls onSubmit',
          'SearchModal — opens on Ctrl+K, filters results, keyboard navigation',
          'Target: 10-15 component tests',
        ),
        h('19.3 Integration Tests [GOOD TO HAVE]'),
        li('Auth flow — register → verify → login → access dashboard → logout', 'Task CRUD — create → edit → change status → delete', 'Tool: Supertest for API testing'),
        h('19.4 E2E Tests [WOW FACTOR]'),
        li('Full journey: login → create project → create tasks → drag on board → view dashboard', 'Tool: Playwright or Cypress | Target: 3-5 critical path tests'),
      ],
    },
    {
      id: 'deployment',
      title: '20. Deployment & DevOps',
      blocks: [
        h('20.1 Hosting [MUST HAVE]'),
        li(
          '**Frontend** — Vercel (auto-deploys from GitHub main branch)',
          '**Backend API** — Railway or Render',
          '**Database** — Neon (serverless PostgreSQL) or Supabase',
          '**File Storage** — Cloudinary or AWS S3',
          '**Redis** — Upstash (serverless Redis)',
        ),
        h('20.2 CI/CD Pipeline [GOOD TO HAVE]'),
        li(
          'GitHub Actions: On every PR → lint (ESLint) → type check (tsc) → unit tests (Jest) → build',
          'On merge to main → all above + auto-deploy to Vercel/Railway',
          'Branch protection — require PR review + passing checks',
        ),
        h('20.3 Docker [GOOD TO HAVE]'),
        li('docker-compose.yml with: api, postgres, redis containers', 'One command local setup: docker compose up', 'Multi-stage Dockerfile for production build'),
      ],
    },
    {
      id: 'logging',
      title: '21. Logging & Observability',
      blocks: [
        li(
          '**Structured logging** — JSON logs with request ID, user ID, endpoint, duration [GOOD TO HAVE]',
          '**Error tracking** — Sentry (free tier) on frontend and backend [GOOD TO HAVE]',
          '**API response time logging** — morgan middleware with custom format [MUST HAVE]',
          '**Uptime monitoring** — UptimeRobot (free) pinging /api/health every 5 min [GOOD TO HAVE]',
          '**Health check endpoint** — GET /api/health returns DB status, Redis status, uptime [MUST HAVE]',
          '**Web Vitals reporting** — send CWV metrics to analytics on page load [WOW FACTOR]',
        ),
      ],
    },
    {
      id: 'export',
      title: '22. Data Export & Import',
      blocks: [
        li(
          '**Export tasks to CSV** — download all tasks in current view as .csv file [GOOD TO HAVE]',
          '**Export to PDF** — generate printable task list or sprint report [WOW FACTOR]',
          '**Import tasks from CSV** — upload CSV with mapped columns → bulk create tasks [WOW FACTOR]',
          '**Export project backup** — JSON dump of entire project (tasks, comments, labels) [GOOD TO HAVE]',
        ),
      ],
    },
    {
      id: 'pwa',
      title: '23. PWA & Offline Support',
      blocks: [
        li(
          '**Service Worker** — cache static assets for offline access [WOW FACTOR]',
          '**App manifest** — installable as PWA on mobile (Add to Home Screen) [WOW FACTOR]',
          '**Offline indicator** — banner when offline, queue changes, sync when back online [WOW FACTOR]',
          '**Push notifications** — browser push for assigned tasks and mentions [WOW FACTOR]',
        ),
      ],
    },
    {
      id: 'git',
      title: '24. Git Workflow & Code Quality',
      blocks: [
        h('24.1 Branching Strategy [MUST HAVE]'),
        li(
          '**main** — production, always deployable',
          '**develop** — integration branch',
          '**feature/task-drag-drop** — feature branches off develop',
          '**fix/login-redirect** — bug fix branches',
          'PR template with: What changed, Screenshots, Testing done, Checklist',
        ),
        h('24.2 Code Quality [MUST HAVE]'),
        li(
          '**ESLint** — strict TypeScript rules, no-any, exhaustive-deps',
          '**Prettier** — consistent formatting on save',
          '**Husky + lint-staged** — pre-commit: lint + format changed files only',
          '**Commit convention** — Conventional Commits: feat:, fix:, docs:, refactor:',
          '**PR size** — keep PRs under 400 lines; split larger features',
        ),
        note('review', 'A `develop` branch is GitFlow. Many web product teams now use **trunk-based** development instead: short-lived branches straight off `main`, with unfinished work behind feature flags. Both are valid; know why a team picks one.'),
      ],
    },
    {
      id: 'stack',
      title: '25. Tech Stack (Exact Packages)',
      blocks: [
        table(
          ['Layer', 'Package', 'Purpose'],
          [
            ['Frontend', 'Next.js 14+', 'App Router, SSR, API routes'],
            ['Frontend', 'TypeScript 5+ (strict)', 'Type safety'],
            ['Frontend', 'Tailwind CSS 3.4+', 'Utility-first styling'],
            ['Frontend', 'Zustand', 'Lightweight state management'],
            ['Frontend', '@tanstack/react-query v5', 'Server state, caching, optimistic updates'],
            ['Frontend', '@dnd-kit/core', 'Accessible drag and drop'],
            ['Frontend', 'Recharts', 'Charts and graphs'],
            ['Frontend', 'Tiptap', 'Rich text editor'],
            ['Frontend', 'React Hook Form + Zod', 'Forms + validation'],
            ['Frontend', 'Lucide React', 'Icon library'],
            ['Frontend', 'Sonner', 'Toast notifications'],
            ['Frontend', 'next-themes', 'Dark mode'],
            ['Frontend', 'socket.io-client', 'Real-time client'],
            ['Frontend', 'date-fns', 'Date formatting'],
            ['Backend', 'Node.js 20+ / Express 4.18', 'HTTP framework'],
            ['Backend', 'TypeScript', 'Backend type safety'],
            ['Backend', 'Prisma 5+', 'ORM + migrations'],
            ['Backend', 'PostgreSQL 15+', 'Primary database'],
            ['Backend', 'Redis (Upstash)', 'Caching, rate limit, pub/sub'],
            ['Backend', 'Socket.io', 'WebSocket server'],
            ['Backend', 'jsonwebtoken + bcryptjs', 'JWT auth + password hashing'],
            ['Backend', 'multer + Cloudinary', 'File upload + storage'],
            ['Backend', 'openai SDK', 'AI features'],
            ['Backend', 'Resend', 'Transactional emails'],
            ['Backend', 'Zod', 'Request validation'],
            ['Backend', 'helmet + cors + morgan', 'Security + logging'],
            ['Testing', 'Jest + React Testing Library', 'Unit + component tests'],
            ['Testing', 'Playwright', 'E2E tests'],
            ['Testing', 'Supertest', 'API integration tests'],
            ['DevOps', 'GitHub Actions', 'CI/CD pipeline'],
            ['DevOps', 'Docker + docker-compose', 'Containerization'],
            ['DevOps', 'Sentry', 'Error monitoring'],
            ['DevOps', 'ESLint + Prettier + Husky', 'Code quality'],
          ],
        ),
        note('review', 'Versions move fast: Express 5 is the current major (ShopVerse uses it, with built-in async error handling), and Tailwind 4 replaced 3.4 with CSS-first configuration.'),
      ],
    },
    {
      id: 'folders',
      title: '26. Folder Structure',
      blocks: [
        code(
          'text',
          `taskflow-pro/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/login/ register/ forgot-password/
│   │   │   ├── (dashboard)/workspace/[wId]/project/[pId]/
│   │   │   │   ├── board/page.tsx
│   │   │   │   ├── list/page.tsx
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── layout.tsx, globals.css
│   │   ├── components/
│   │   │   ├── ui/          (Button, Modal, Input, Avatar, Badge, Tooltip, Skeleton)
│   │   │   ├── board/       (KanbanBoard, Column, TaskCard, DragOverlay)
│   │   │   ├── table/       (TaskTable, TableRow, InlineEdit, BulkActions)
│   │   │   ├── dashboard/   (Charts, SummaryCards, SprintBurndown)
│   │   │   ├── task/        (TaskDetail, TaskForm, CommentList, SubtaskList)
│   │   │   ├── layout/      (Sidebar, Navbar, MobileNav, SearchModal)
│   │   │   └── shared/      (EmptyState, ErrorBoundary, LoadingSpinner)
│   │   ├── hooks/           (useAuth, useDebounce, useTasks, useWebSocket)
│   │   ├── stores/          (authStore, taskStore, filterStore, uiStore)
│   │   ├── lib/             (api.ts, socket.ts, utils.ts, constants.ts)
│   │   ├── types/           (task.ts, project.ts, user.ts, workspace.ts)
│   │   └── __tests__/
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── routes/       (auth, workspaces, projects, tasks, ai, search,
│       │   │                  notifications)
│       │   ├── controllers/
│       │   ├── middleware/   (auth, validate, rateLimiter, errorHandler)
│       │   ├── services/     (task, ai, notification, email, analytics)
│       │   ├── socket/       (WebSocket event handlers)
│       │   ├── prisma/schema.prisma + migrations/
│       │   ├── utils/        (jwt.ts, hash.ts, logger.ts)
│       │   └── index.ts
│       └── __tests__/
├── docker-compose.yml
├── .github/workflows/ci.yml
├── .env.example
├── README.md
└── package.json`,
        ),
      ],
    },
    {
      id: 'env',
      title: '27. Environment Variables (.env.example)',
      blocks: [
        code(
          'bash',
          `# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/taskflow

# Auth
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Email
RESEND_API_KEY=re_your-key-here

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret

# App
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Sentry
SENTRY_DSN=https://your-sentry-dsn`,
        ),
      ],
    },
    {
      id: 'readme',
      title: '28. README Template for GitHub',
      blocks: [
        p('Copy this structure for your GitHub README. This is what hiring managers and interviewers will see first.'),
        code(
          'markdown',
          `# TaskFlow Pro — Real-Time Project Management Dashboard

A production-grade, collaborative project management tool built with
Next.js, TypeScript, Node.js, PostgreSQL, Socket.io, and AI features.

[Live Demo](https://taskflow-pro.vercel.app) | [API Docs](link) | [Demo Video](link)

## Screenshots
[Board View] [Table View] [Dashboard] [Mobile View] [Dark Mode]

## Features
- Kanban board with drag-and-drop (optimistic updates)
- List/table view with inline editing, sort, filter
- Real-time collaboration via WebSockets
- AI-powered task description & subtask generation (OpenAI)
- Dashboard with burndown, velocity, and distribution charts
- Role-based access (Owner, Admin, Member, Viewer)
- Global search with Cmd+K command palette
- Dark/light mode, fully responsive (mobile-first)
- JWT auth with refresh tokens and OAuth (Google, GitHub)

## Tech Stack
Frontend: Next.js 14, TypeScript, Tailwind CSS, Zustand, React Query
Backend: Node.js, Express, Prisma, PostgreSQL, Redis, Socket.io
AI: OpenAI GPT-4o-mini | Testing: Jest, Playwright
DevOps: Docker, GitHub Actions, Vercel, Railway, Sentry

## Architecture Decisions
- Why Zustand over Redux? [explanation]
- Why @dnd-kit over react-beautiful-dnd? [explanation]
- Why REST over GraphQL? [explanation]
- Optimistic update strategy [explanation]

## Run Locally
git clone ... | npm install | docker compose up | npm run dev

## What I Learned
[2-3 specific technical lessons]

## What I'd Improve
[honest next steps — shows self-awareness]`,
        ),
      ],
    },
    {
      id: 'resume',
      title: '29. Resume Bullet Points (Copy-Paste Ready)',
      blocks: [
        p('Use these on your resume under the Projects section. Each bullet starts with an action verb and includes measurable impact.'),
        li(
          '**Built a real-time project management dashboard** (Next.js, TypeScript, PostgreSQL, Socket.io) with Kanban drag-and-drop, inline table editing, and AI-powered task generation serving 50+ demo users',
          '**Implemented optimistic UI updates** for drag-and-drop task management, achieving instant visual feedback with automatic rollback on API failure, reducing perceived latency to 0ms',
          '**Designed and built 35+ REST API endpoints** with JWT authentication, role-based access control (4 roles), rate limiting, and Zod input validation across 14 database tables',
          '**Integrated OpenAI GPT-4o-mini** for AI-powered task description generation, subtask breakdown, and daily standup summaries with streaming responses',
          '**Developed real-time collaboration features** using Socket.io with room-per-project architecture, live presence indicators, and conflict resolution for concurrent edits',
          '**Built responsive dashboard** with 5+ interactive charts (Recharts) including sprint burndown, velocity, task distribution, and team workload analytics',
          '**Achieved 90%+ Lighthouse score** through code splitting, virtualized lists, skeleton loading states, image lazy loading, and bundle optimization (<200KB gzipped)',
          '**Wrote 30+ automated tests** (Jest, React Testing Library, Playwright) covering auth flows, task CRUD, drag-and-drop, and E2E critical paths',
          '**Set up CI/CD pipeline** with GitHub Actions (lint, type-check, test, build, deploy), Docker containerization, and Sentry error monitoring',
        ),
        note('review', 'Only use numbers you actually measured and can explain. "Serving 50+ demo users" and "perceived latency 0ms" invite "how did you measure that?" in an interview. Prefer facts you can show, like "66 API tests" or "imports 323 products in one transaction".'),
      ],
    },
    {
      id: 'talking-points',
      title: '30. Interview Talking Points',
      blocks: [
        p("When asked about this project in interviews, here's how to talk about it. Each answer follows the STAR method (Situation → Task → Action → Result)."),
        h("'Walk me through a challenging technical problem you solved.'"),
        note('answer', "The Kanban drag-and-drop had to feel instant — any lag breaks the UX. I implemented optimistic updates where the UI moves the card immediately, then sends the API call in the background. If the server rejects (e.g., another user moved the card), I revert the card to its original position with a toast notification explaining what happened. I used React Query's onMutate for the instant update and onError for rollback. The tricky part was maintaining correct column ordering when multiple users drag simultaneously — I solved this with server-side position recalculation using fractional indexing."),
        h("'How did you handle state management?'"),
        note('answer', 'I split state into two layers: **server state** managed by React Query (tasks, projects, user data — with caching, stale time, and background refetching) and **client state** managed by Zustand (UI state like sidebar open/closed, active filters, current theme). This avoids the common mistake of putting server data in Redux and manually keeping it in sync. For real-time updates, Socket.io events invalidate the React Query cache, which triggers an automatic refetch — so the board stays in sync without manual state manipulation.'),
        h("'How did you ensure the app performs well?'"),
        note('answer', 'Multiple layers: code splitting with React.lazy so each route loads only its code, virtualized lists with react-virtual for projects with 500+ tasks, skeleton screens instead of spinners for perceived performance, debounced search (300ms), throttled scroll events, and React Query caching with a 5-minute stale time so repeat visits are instant. I tracked Web Vitals (LCP, FID, CLS) and kept the initial bundle under 200KB gzipped using the Next.js bundle analyzer.'),
        h("'Tell me about the AI features.'"),
        note('answer', "I integrated OpenAI's GPT-4o-mini for three features: (1) generating detailed task descriptions from just a title — it writes acceptance criteria, edge cases, and implementation steps; (2) breaking a large task into 3-7 subtasks automatically; (3) generating daily standup summaries from the user's recent task activity. I used streaming responses so text appears word-by-word (typewriter effect), which feels natural. The AI context includes the project name and recent tasks to give relevant suggestions. I kept the prompts minimal and used Zod to validate the API response structure."),
        h("'How did you handle security?'"),
        note('answer', "JWT access tokens (15-min expiry) plus httpOnly refresh tokens (7-day), so even if XSS occurs, the refresh token isn't accessible via JavaScript. All inputs are validated with Zod schemas server-side before touching the database. Prisma prevents SQL injection by parameterizing all queries. I used Helmet.js for secure HTTP headers, rate limiting (100 req/15min general, 5 attempts for login), CORS whitelisting only my frontend domain, and bcrypt with 12 salt rounds for password hashing. File uploads are validated for MIME type, size, and extension on the server — never trust the client."),
        h("'Why did you choose this tech stack?'"),
        note('answer', "Next.js for SSR/SSG flexibility and the App Router's file-based routing; TypeScript end-to-end because shared types between frontend and backend catch bugs at compile time; Tailwind because utility classes ship less CSS than component libraries; Zustand over Redux because the API is simpler with no boilerplate and it handles the client-state slice perfectly; React Query over SWR because of superior mutation/optimistic update support; @dnd-kit over react-beautiful-dnd because it's maintained, accessible, has touch support, and is more performant with large lists; PostgreSQL over MongoDB because the data is highly relational (users → workspaces → projects → tasks → comments)."),
      ],
    },
    {
      id: 'plan',
      title: '4-Week Build Plan',
      blocks: [
        table(
          ['Week', 'Focus Area', 'Deliverables'],
          [
            ['Week 1', 'Foundation', 'Auth (login/register/JWT/OAuth), DB schema with Prisma, Project CRUD, basic Task CRUD, folder structure, Docker setup'],
            ['Week 2', 'Core Views', 'Kanban board with drag-and-drop, task detail panel, status updates, comments, subtasks, labels, priority'],
            ['Week 3', 'Power Features', 'List/table view with sort/filter/inline edit, dashboard charts, global search (Cmd+K), responsive design + dark mode'],
            ['Week 4', 'Polish & Ship', 'Real-time (Socket.io), AI features (3 features), notifications, testing (30+ tests), CI/CD, deploy live, README case study, demo video/GIF'],
          ],
        ),
        note('answer', "**After deploy:** Write the README case study with architecture decisions. Record a 2-minute demo video or GIF walkthrough. Update your resume with the bullet points from Section 29. Add the live link to your LinkedIn headline: 'Frontend Developer | Built TaskFlow Pro (live demo)'. Share a LinkedIn post with screenshots and the link — tag it #BuildInPublic. Apply to those 531 Bangalore companies with confidence."),
      ],
    },
  ],
};
