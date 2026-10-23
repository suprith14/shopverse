// "TaskFlow Pro: The Complete Knowledge Guide" (the shared PDF), as data. The text and code follow
// the PDF; only copy errors visible in its page images were fixed (lost underscores such as
// password_hash, "hover:bg-gray100"). { kind: 'review' } boxes are OUR notes, kept separate.
import { code, h, li, note, ol, p, table } from './blocks';

export const GUIDE = {
  slug: 'guide',
  title: 'TaskFlow Pro',
  subtitle: 'The Complete Knowledge Guide',
  intro:
    'Every feature explained in depth — **what to build, why it matters, how to implement it, common mistakes to avoid, and what to say in interviews.** This is your complete learning resource and build guide.',
  legend: [
    ['MUST HAVE', 'Core — build first. Without these, the project is incomplete.'],
    ['GOOD TO HAVE', 'Differentiators — separates you from junior developers.'],
    ['WOW FACTOR', 'Interview gold — makes hiring managers remember you.'],
    ['WHY THIS MATTERS', 'Real-world context — why companies care about this feature.'],
    ['COMMON MISTAKE', 'Pitfalls most developers fall into — avoid these.'],
    ['INTERVIEW POINT', 'Exactly what to say when asked about this in interviews.'],
  ],
  footer: 'Generated on September 22, 2026',
  sections: [
    {
      id: 'auth',
      title: '1. Authentication & User Management',
      blocks: [
        p("Authentication is the **first thing** every interviewer checks. If your auth is weak (plain text passwords, no refresh tokens, no validation), it signals that you don't understand production security. This section alone shows backend competence."),
        h('1.1 Sign Up Flow [MUST]'),
        li('**Email + Password registration** with real-time inline validation'),
        p("As the user types, validate each field and show ✓/✕ icons. Don't wait for form submit — instant feedback is the modern UX standard."),
        code(
          'js',
          `// React Hook Form + Zod example
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Need one uppercase')
    .regex(/[0-9]/, 'Need one number')
    .regex(/[^A-Za-z0-9]/, 'Need one special char'),
  confirmPassword: z.string()
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword']
});`,
        ),
        note('why', 'Real companies reject weak passwords. The regex pattern above matches what banks and SaaS apps require. Interviewers notice this level of detail.'),
        note('mistake', 'Never validate passwords only on the frontend. Always re-validate on the server. A user can disable JavaScript or call your API directly with curl.'),
        li('**Password strength meter** — visual bar showing Weak / Fair / Strong / Very Strong'),
        p('Use a library like **zxcvbn** (created by Dropbox) which checks against common passwords, dictionary words, and patterns — not just regex rules.'),
        code(
          'js',
          `import zxcvbn from 'zxcvbn';
const result = zxcvbn(password);
// result.score: 0=weak, 1=fair, 2=good, 3=strong, 4=very strong
// result.feedback.suggestions: ['Add another word or two']`,
        ),
        li('**Email verification flow** — send OTP or magic link'),
        p("After signup, send a 6-digit OTP or a signed magic link (JWT with 1-hour expiry embedded in URL). Show a 'Check your inbox' screen with a resend button (rate-limited to 1 per 60 seconds)."),
        note('interview', "If asked 'how do you handle email verification?', say: 'I generate a signed JWT with the user's email and a 1-hour expiry. The verification link includes this token. When clicked, I decode and verify the JWT, then set is_verified=true in the database. This is stateless — no OTP table needed.'"),
        li('**Prevent duplicate registration** — unique constraint on email in DB'),
        p("At the database level, email should have a UNIQUE constraint. In the API, catch the Prisma unique constraint error and return 'An account with this email already exists.'"),
        note('mistake', "Never say 'This email is already registered' on the login page for security. An attacker could enumerate valid emails. On signup it's acceptable because the user is trying to create an account."),
        h('1.2 Login Flow [MUST]'),
        li('**Email + Password login** with secure error messages'),
        p("Always return **'Invalid email or password'** — never tell the user which one is wrong. This prevents email enumeration attacks."),
        code(
          'js',
          `// Backend controller
const user = await prisma.user.findUnique({ where: { email } });
if (!user) return res.status(401).json({ error: 'Invalid email or password' });

const valid = await bcrypt.compare(password, user.password_hash);
if (!valid) return res.status(401).json({ error: 'Invalid email or password' });`,
        ),
        li('**Rate limiting** — lock after 5 failed attempts for 15 minutes'),
        p("Use Redis to track failed login attempts per email. After 5 failures, return HTTP 429 with 'Too many attempts. Try again in 15 minutes.' This prevents brute force attacks."),
        code(
          'js',
          `// Using Redis
const key = \`login_attempts:\${email}\`;
const attempts = await redis.incr(key);
if (attempts === 1) await redis.expire(key, 900); // 15 min TTL
if (attempts > 5) return res.status(429).json({
  error: 'Account locked. Try again in 15 minutes.'
});`,
        ),
        note('why', 'Rate limiting shows you think about security in production. Most portfolio projects skip this, so having it immediately sets you apart.'),
        note('review', 'Counting per **email only** lets an attacker lock any user out on purpose. Limit per IP + email (ShopVerse uses a sliding window in `backend/src/lib/rate-limiter.js`), so the real owner can still log in from their own device.'),
        li(
          '**Remember me** checkbox — extends refresh token expiry to 30 days',
          '**Show/hide password toggle** — eye icon in password field',
          '**Return URL redirect** — if user was redirected to login from a protected page, send them back after login',
        ),
        code(
          'js',
          `// Middleware redirects to /login?returnUrl=/project/abc/board
// After successful login:
const returnUrl = searchParams.get('returnUrl') || '/dashboard';
router.push(returnUrl);`,
        ),
        note('review', 'Validate the return URL before redirecting: accept only paths on your own site (starting with a single `/`). Otherwise `?returnUrl=https://evil.example` becomes an open redirect used in phishing.'),
        h('1.3 JWT Authentication Architecture [MUST]'),
        p('This is the **most frequently asked topic** in frontend/fullstack interviews. You must understand the dual-token pattern deeply.'),
        h('How It Works:'),
        li(
          '**Access Token** — short-lived (15 min), stored in memory (React state/Zustand), sent in Authorization header',
          '**Refresh Token** — long-lived (7 days), stored in httpOnly cookie (not accessible via JavaScript), sent automatically by browser',
        ),
        h('The Flow:'),
        ol(
          'User logs in → server returns access token in response body + sets refresh token as httpOnly cookie',
          'Frontend stores access token in Zustand/memory (NOT localStorage)',
          'Every API call includes: Authorization: Bearer <access_token>',
          'When access token expires (401 response) → frontend calls /api/auth/refresh-token',
          'Server validates the httpOnly cookie refresh token → issues new access token',
          "This happens silently — user never sees 'session expired'",
        ),
        code(
          'js',
          `// Axios interceptor for silent refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const { data } = await api.post('/auth/refresh-token');
      useAuthStore.getState().setAccessToken(data.accessToken);
      error.config.headers.Authorization = \`Bearer \${data.accessToken}\`;
      return api(error.config); // retry original request
    }
    return Promise.reject(error);
  }
);`,
        ),
        note('mistake', 'NEVER store JWT tokens in localStorage. If your site has any XSS vulnerability, an attacker can steal the token with document.cookie or localStorage.getItem(). httpOnly cookies are invisible to JavaScript — even XSS can\'t read them.'),
        note('interview', "If asked 'where do you store tokens?': 'Access token in memory (Zustand store) — it disappears on page refresh but that's fine because the refresh token in the httpOnly cookie automatically gets a new one. The refresh token is in an httpOnly, Secure, SameSite=Strict cookie — completely inaccessible to JavaScript, which protects against XSS. This is the industry standard used by Auth0, Okta, and most banking apps.'"),
        note('review', 'Two production details: (1) when several requests get a 401 at once, share **one** refresh call (ShopVerse keeps a single `refreshPromise` in `frontend/src/lib/api-client.js`), or the rotating refresh token gets reused and the session is killed; (2) `SameSite=Strict` drops the cookie when users arrive from another site (Stripe, OAuth). ShopVerse uses `Lax` for that reason.'),
        h('1.4 OAuth Social Login [GOOD]'),
        p('Google and GitHub OAuth adds convenience and shows you understand third-party integration. The flow:'),
        ol(
          "User clicks 'Continue with Google' → redirect to Google's consent screen",
          'Google redirects back to your /api/auth/callback/google with an authorization code',
          "Your server exchanges the code for Google's access token",
          'Your server fetches user profile (email, name, avatar) from Google',
          'Create or find user in your DB → issue your own JWT tokens',
        ),
        code(
          'js',
          `// Using Passport.js or next-auth
// Google strategy config:
new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/callback/google'
}, async (accessToken, refreshToken, profile, done) => {
  let user = await prisma.user.findUnique({ where: { email: profile.email }});
  if (!user) {
    user = await prisma.user.create({ data: {
      email: profile.email, name: profile.displayName,
      avatar_url: profile.photos[0].value, is_verified: true
    }});
  }
  done(null, user);
});`,
        ),
        note('why', "OAuth users skip email verification (Google already verified their email). Auto-link accounts: if someone signs up with email first, then later clicks 'Continue with Google' with the same email, merge the accounts — don't create a duplicate."),
        h('1.5 User Profile [MUST]'),
        li('**Avatar upload** with client-side crop and resize'),
        p('Use **react-image-crop** to let users crop their photo before uploading. Resize to 200x200px on the frontend before sending to reduce upload size. Upload to Cloudinary or S3.'),
        li(
          '**Change password** — require current password before allowing change',
          "**Delete account** — 'type DELETE to confirm' pattern (like GitHub repo deletion)",
          '**Download my data** — GDPR-style JSON export of all user data [WOW]',
        ),
        note('why', "The 'type to confirm' pattern for dangerous actions is used by GitHub, AWS, Vercel, and Stripe. It shows you understand UX safety patterns that prevent accidental data loss."),
      ],
    },
    {
      id: 'workspace',
      title: '2. Workspace & Project Management',
      blocks: [
        p('This section proves you can design **multi-tenant architectures** — a critical skill for SaaS companies. Every Bangalore SaaS company (Freshworks, Zoho, Razorpay, Chargebee) builds multi-tenant systems.'),
        h('2.1 Multi-Tenant Architecture [MUST]'),
        p('TaskFlow Pro uses a **shared database, separate schemas** approach. All data lives in one PostgreSQL database, but every query is scoped by workspace_id. This means:'),
        li(
          'Every task belongs to a project, every project belongs to a workspace',
          'API middleware extracts workspace_id from the URL and validates user membership',
          "No user can ever see data from a workspace they don't belong to",
        ),
        code(
          'js',
          `// Middleware: workspace access check
const checkWorkspaceAccess = async (req, res, next) => {
  const { workspaceId } = req.params;
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: workspaceId,
        user_id: req.user.id
      }
    }
  });
  if (!member) return res.status(403).json({ error: 'Access denied' });
  req.workspaceRole = member.role;
  next();
};`,
        ),
        note('interview', "If asked about multi-tenancy: 'I used shared-database multi-tenancy where every query is scoped by workspace_id. The middleware validates workspace membership before any controller logic runs. This approach is simpler than separate databases per tenant and works well up to thousands of tenants — it's what Slack, Notion, and Linear use.'"),
        note('review', 'Naming: what is described (one database, one set of tables, a `workspace_id` column) is a **shared schema**. "Separate schemas" is a different model, with one PostgreSQL schema per tenant.'),
        h('2.2 Role-Based Access Control (RBAC) [MUST]'),
        p('Four roles with clear permission boundaries:'),
        table(
          ['Permission', 'Owner', 'Admin', 'Member', 'Viewer'],
          [
            ['Delete workspace', '✓', '✗', '✗', '✗'],
            ['Manage members & roles', '✓', '✓', '✗', '✗'],
            ['Create/edit projects', '✓', '✓', '✗', '✗'],
            ['Create/edit/delete tasks', '✓', '✓', '✓', '✗'],
            ['Comment on tasks', '✓', '✓', '✓', '✗'],
            ['View board & tasks', '✓', '✓', '✓', '✓'],
            ['Change project settings', '✓', '✓', '✗', '✗'],
          ],
        ),
        code(
          'js',
          `// RBAC middleware
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.workspaceRole)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// Usage in routes:
router.delete('/workspace/:id', requireRole('OWNER'));
router.post('/workspace/:id/invite', requireRole('OWNER', 'ADMIN'));`,
        ),
        note('why', "RBAC is asked in almost every senior frontend/fullstack interview. The pattern above (middleware + role array) is clean and extensible. It's how AWS IAM, GitHub, and Jira implement permissions."),
        note('mistake', "Never check roles only on the frontend. A user can modify the UI with DevTools and click hidden buttons. Always enforce roles on the server — the frontend role check is just UX (hiding buttons they can't use)."),
        h('2.3 Workspace Features [MUST]'),
        li('**Workspace switcher** — dropdown in sidebar showing all workspaces'),
        p('When the user switches workspaces, update the URL (e.g., /workspace/abc123) and re-fetch all data scoped to the new workspace. Store last-used workspace in user preferences so they land there on next login.'),
        li('**Invite members by email** — sends invitation with join link'),
        p("Generate a signed invitation JWT (contains workspace_id + invitee email + role + expiry). Send via email. When clicked, verify the JWT and add the user to the workspace. If they don't have an account, redirect to signup with the invitation token."),
        li("**Pending invitations list** — shows sent invitations that haven't been accepted", '**Transfer ownership** — Owner can transfer to another Admin [GOOD]'),
        h('2.4 Projects [MUST]'),
        li(
          '**Create project** with name, description, color/icon, start date, end date',
          '**Project status**: Active, On Hold, Completed, Archived',
          '**Star/favorite projects** — stored in a UserProjectFavorite join table',
          '**Archive project** — soft delete using an is_archived boolean + archived_at timestamp',
        ),
        p("Soft deletes mean you never actually DELETE the row. You set is_archived=true and filter it out in queries. This allows 'undo' and data recovery. Every production app does this."),
        code(
          'js',
          `// Prisma query excluding archived
const projects = await prisma.project.findMany({
  where: { workspace_id: wId, is_archived: false },
  orderBy: { created_at: 'desc' }
});`,
        ),
        note('interview', "If asked about soft deletes: 'I use a boolean is_archived flag instead of actually deleting rows. This preserves data integrity (no broken foreign keys), allows undo/restore, and is required for audit compliance. All queries filter where is_archived = false. It's standard practice at companies like Stripe and Shopify.'"),
      ],
    },
    {
      id: 'tasks',
      title: '3. Task Management — The Heart of the App',
      blocks: [
        p("This is where you'll spend 40% of your development time. Task management is the core feature — every other view (board, table, dashboard) reads from the same task data. Get this right and everything else follows."),
        h('3.1 Task Data Model [MUST]'),
        code(
          'prisma',
          `// Prisma schema
model Task {
  id           String    @id @default(cuid())
  task_number  Int       // Auto-increment per project: PROJ-001
  title        String    @db.VarChar(200)
  description  String?   @db.Text // Rich text HTML
  status       TaskStatus @relation(fields: [status_id], references: [id])
  status_id    String
  priority     Priority  @default(NONE)
  position     Float     // Fractional indexing for ordering
  assignee     User?     @relation('assigned', fields: [assignee_id], references: [id])
  assignee_id  String?
  reporter     User      @relation('reported', fields: [reporter_id], references: [id])
  reporter_id  String
  project      Project   @relation(fields: [project_id], references: [id])
  project_id   String
  parent_task  Task?     @relation('subtasks', fields: [parent_id], references: [id])
  parent_id    String?
  subtasks     Task[]    @relation('subtasks')
  labels       Label[]   @relation('TaskLabels')
  comments     Comment[]
  attachments  Attachment[]
  activities   Activity[]
  estimation   Float?
  due_date     DateTime?
  start_date   DateTime?
  sprint_id    String?
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt

  @@index([project_id, status_id, position])
  @@index([assignee_id])
  @@index([due_date])
}`,
        ),
        note('why', "The **@@index** lines are database indexes. Without them, queries like 'get all tasks in this project sorted by position' would do a full table scan. With 10,000+ tasks, that's the difference between 5ms and 500ms. Always index columns you filter or sort by."),
        h('3.2 Fractional Indexing for Ordering [MUST]'),
        p("When a user drags task C between tasks A and B on the board, you need to update C's position. Fractional indexing means:"),
        li('Task A has position = 1.0', 'Task B has position = 2.0', 'Drag C between them → C gets position = 1.5', 'Drag D between A and C → D gets position = 1.25'),
        p('This way, you only update ONE row in the database (the moved task), not reorder all tasks. This is how Trello, Linear, and Notion handle ordering.'),
        code(
          'js',
          `// Calculate new position
const getNewPosition = (above, below) => {
  if (!above && !below) return 1.0;
  if (!above) return below.position / 2;
  if (!below) return above.position + 1.0;
  return (above.position + below.position) / 2;
};`,
        ),
        note('mistake', "After many drag-and-drops, positions like 1.00000001 and 1.00000002 can cause floating-point precision issues. Solution: periodically re-index positions (set them back to 1.0, 2.0, 3.0...) as a background job. This is called 'position normalization'."),
        note('interview', "This is a classic system design question. If asked 'how do you handle ordering in a list?', explain fractional indexing vs. integer reindexing. Fractional indexing is O(1) per drag (update 1 row) vs. O(n) for integer reindexing (update all rows below). But it needs periodic normalization."),
        note('review', 'Halving floats runs out of precision after about 50 moves into the same gap. **String** keys (npm package `fractional-indexing`, `generateKeyBetween(a, b)`) can always fit a key between two others, so no normalisation job is needed. Store `position` as a String column.'),
        h('3.3 Auto-Generated Task IDs [MUST]'),
        p('Every task gets a human-readable ID like PROJ-001, PROJ-042. This is a per-project auto-increment counter:'),
        code(
          'js',
          `// In the create task controller:
const lastTask = await prisma.task.findFirst({
  where: { project_id: projectId },
  orderBy: { task_number: 'desc' }
});
const taskNumber = (lastTask?.task_number || 0) + 1;

const task = await prisma.task.create({
  data: {
    task_number: taskNumber,
    title, project_id: projectId, ...rest
  }
});`,
        ),
        note('mistake', 'Race condition: if two users create tasks at the exact same time, they might get the same number. Solution: use a database sequence or a unique constraint on (project_id, task_number) — the second insert will fail and retry with the next number.'),
        note('review', 'A counter **row** per project, incremented inside the same transaction (`UPDATE ... SET next = next + 1 RETURNING next`), avoids the race entirely: the row lock makes concurrent creates wait their turn. ShopVerse does exactly this for gapless invoice numbers in `backend/src/modules/orders/invoice.js`.'),
        h('3.4 Rich Text Description [MUST]'),
        p("Use **Tiptap** (built on ProseMirror) — it's the most popular rich text editor for React in 2026. It supports:"),
        li(
          'Bold, italic, strikethrough, underline',
          'Headings (H1-H3), bullet lists, numbered lists',
          'Code blocks with syntax highlighting',
          'Links, images, horizontal rules',
          '**@mentions** — type @ and see a dropdown of team members [GOOD]',
          'Markdown shortcuts — type ** for bold, - for bullet',
        ),
        code(
          'js',
          `// Tiptap setup
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';

const editor = useEditor({
  extensions: [
    StarterKit,
    Mention.configure({
      suggestion: {
        items: ({ query }) =>
          members.filter(m => m.name.toLowerCase().includes(query.toLowerCase())),
      },
    }),
  ],
  content: task.description,
});`,
        ),
        p('Store the description as **HTML** in the database. When rendering (in comments, activity feed), sanitize with DOMPurify to prevent XSS.'),
        h('3.5 Activity Log / Audit Trail [MUST]'),
        p('Every change to a task is recorded. This is crucial for accountability in real teams.'),
        code(
          'js',
          `// Activity model stores: who changed what, from what, to what
// Example entries:
// 'Ravi changed status from To Do to In Progress • 2h ago'
// 'Priya changed priority from Medium to High • 4h ago'
// 'Amit assigned this task to Ravi • 1d ago'

// Implementation: compare old and new values in the update controller
const changes = [];
if (body.status_id !== task.status_id) {
  changes.push({ field: 'status', old: task.status.name, new: newStatus.name });
}
if (body.priority !== task.priority) {
  changes.push({ field: 'priority', old: task.priority, new: body.priority });
}
await prisma.activity.createMany({
  data: changes.map(c => ({
    task_id: task.id, user_id: req.user.id,
    action: 'updated', field: c.field,
    old_value: c.old, new_value: c.new
  }))
});`,
        ),
        note('why', 'Activity logs are a legal requirement in industries like finance and healthcare. Even for a portfolio project, having them shows you think about auditability and data integrity.'),
      ],
    },
    {
      id: 'kanban',
      title: '4. Kanban Board — The Showpiece',
      blocks: [
        p('The Kanban board is the **single most impressive visual feature** of your project. When a recruiter opens your live demo, the board is what they see first. It must feel smooth, responsive, and polished.'),
        h('4.1 Why @dnd-kit over react-beautiful-dnd? [MUST]'),
        li(
          '**react-beautiful-dnd** is deprecated (Atlassian stopped maintaining it in 2024)',
          '**@dnd-kit** is actively maintained, has better performance, better accessibility, and supports touch devices',
          '@dnd-kit uses the modern HTML Drag & Drop API + pointer events as fallback',
        ),
        note('interview', "If asked 'why @dnd-kit?': 'react-beautiful-dnd is deprecated since 2024. @dnd-kit is actively maintained, has built-in accessibility (keyboard drag-and-drop, screen reader announcements), better performance with large lists, and native touch support — critical for mobile. It also has a smaller bundle size.'"),
        note('review', '@dnd-kit does **not** use the HTML5 Drag & Drop API: it is built on pointer, touch and keyboard **sensors**. That is exactly why it works on phones and with the keyboard, where native HTML5 drag and drop does not.'),
        h('4.2 Drag-and-Drop Implementation [MUST]'),
        code(
          'jsx',
          `// Board component structure
import { DndContext, closestCorners, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

<DndContext
  collisionDetection={closestCorners}
  onDragStart={handleDragStart}   // Set activeTask state
  onDragOver={handleDragOver}     // Move card between columns (optimistic)
  onDragEnd={handleDragEnd}       // Persist to API
>
  {columns.map(col => (
    <Column key={col.id} column={col}>
      <SortableContext items={col.tasks} strategy={verticalListSortingStrategy}>
        {col.tasks.map(task => <TaskCard key={task.id} task={task} />)}
      </SortableContext>
    </Column>
  ))}
  <DragOverlay>
    {activeTask && <TaskCard task={activeTask} isDragging />}
  </DragOverlay>
</DndContext>`,
        ),
        p("The **DragOverlay** renders a copy of the card that follows the cursor — the original card becomes semi-transparent. This gives the polished 'lifting' effect."),
        h('4.3 Optimistic Updates with Rollback [MUST]'),
        p('This is the **most important UX pattern** in the entire project. When a user drags a task, the card must move INSTANTLY — waiting 200-500ms for an API response feels broken.'),
        code(
          'js',
          `// Using React Query useMutation
const moveTask = useMutation({
  mutationFn: ({ taskId, newStatusId, newPosition }) =>
    api.patch(\`/tasks/\${taskId}/position\`, { status_id: newStatusId, position: newPosition }),

  // OPTIMISTIC UPDATE: update cache BEFORE API call
  onMutate: async ({ taskId, newStatusId, newPosition }) => {
    await queryClient.cancelQueries(['tasks', projectId]);
    const previousTasks = queryClient.getQueryData(['tasks', projectId]);

    queryClient.setQueryData(['tasks', projectId], (old) => {
      // Move task to new column with new position in the cached data
      return moveTaskInCache(old, taskId, newStatusId, newPosition);
    });

    return { previousTasks }; // Save for rollback
  },

  // ROLLBACK: if API fails, restore previous state
  onError: (err, variables, context) => {
    queryClient.setQueryData(['tasks', projectId], context.previousTasks);
    toast.error('Failed to move task. Please try again.');
  },

  // SYNC: refetch to ensure consistency
  onSettled: () => {
    queryClient.invalidateQueries(['tasks', projectId]);
  }
});`,
        ),
        note('why', 'This pattern (optimistic update → API call → rollback on error → refetch on success) is used by every major app: Gmail (archive email), Trello (move cards), Twitter (like tweets), Notion (reorder blocks). Mastering it shows you understand production-grade UX.'),
        note('interview', "This is the #1 technical talking point for your interview. Practice explaining: 'I update the React Query cache immediately with onMutate, save the previous state for rollback, fire the API call, and if it fails, revert the cache to the saved state and show an error toast. On success, I invalidate the query to refetch fresh data. The user perceives zero latency.'"),
        note('review', 'In TanStack Query **v5** (the version the spec lists) these calls take an object: `cancelQueries({ queryKey: [\'tasks\', projectId] })` and `invalidateQueries({ queryKey: [...] })`. The array form shown is v4 syntax. ShopVerse\'s cart uses this exact pattern in `frontend/src/features/cart/cart.api.js`.'),
        h('4.4 Task Card Design [MUST]'),
        p('Each card on the board shows at a glance:'),
        li(
          'Task ID in muted text (PROJ-042)',
          'Title (truncated to 2 lines with ellipsis)',
          'Priority icon (colored dot or icon)',
          'Assignee avatar (circular, 24px, with tooltip showing name)',
          'Due date badge — turns red if overdue, orange if due today',
          'Label badges — colored pills with label name',
          "Subtask progress — '3/5' with mini progress bar",
          'Comment count icon — 3',
        ),
        note('mistake', "Don't overload the card. If you show 15 fields, it becomes unreadable. The card is a summary — the detail panel shows everything. This is a UX principle called 'progressive disclosure'."),
        h('4.5 Swimlanes [WOW]'),
        p('Swimlanes add a second grouping dimension. Instead of just columns (status), you also group rows by assignee, priority, or label. The board becomes a 2D grid:'),
        li(
          'Rows = swimlanes (grouped by assignee: Ravi, Priya, Unassigned)',
          'Columns = statuses (To Do, In Progress, Done)',
          'Each cell shows the tasks that match both the swimlane and column',
        ),
        p('This is an advanced feature found in Jira and Azure DevOps. Having it shows you can build complex, nested UI layouts.'),
      ],
    },
    {
      id: 'table',
      title: '5. List / Table View',
      blocks: [
        p('The table view is where **power users** live. Managers who need to see 100 tasks at once prefer tables over boards. A well-built table with sorting, filtering, inline editing, and bulk actions demonstrates advanced frontend skills.'),
        h('5.1 Inline Editing [MUST]'),
        p('Click any cell (status, priority, assignee, due date) and edit it right in the table — no modal needed. This is how Notion, Airtable, and Linear work.'),
        code(
          'jsx',
          `// Inline edit component
const InlineSelect = ({ value, options, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return <span onClick={() => setIsEditing(true)} className='cursor-pointer hover:bg-gray-100 px-2 py-1 rounded'>{value}</span>;
  }

  return (
    <select autoFocus value={value}
      onChange={(e) => { onChange(e.target.value); setIsEditing(false); }}
      onBlur={() => setIsEditing(false)}>
      {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  );
};`,
        ),
        note('review', 'Accessibility: a clickable `<span>` can\'t be reached with the keyboard. Use a `<button>` for the read-only state, so Tab and Enter work and screen readers announce it as editable.'),
        h('5.2 Sorting [MUST]'),
        p('Click a column header to sort. Click again to reverse. Hold Shift + click for multi-column sorting.'),
        li(
          'Sort state stored in URL params: ?sort=priority:desc,due_date:asc',
          'Server-side sorting for large datasets (pass sort params to API)',
          'Client-side sorting for small datasets (<200 tasks) for instant response',
        ),
        note('why', "URL-driven sort means someone can bookmark a view or share the link. This is called 'deep linking' and is expected in production apps."),
        h('5.3 Virtualized Rows for Performance [GOOD]'),
        p('If a project has 500+ tasks, rendering all 500 DOM rows is slow. **Virtualization** renders only the ~20 visible rows + a buffer of 5 above and below. As the user scrolls, rows are recycled.'),
        code(
          'jsx',
          `// Using @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: tasks.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 48, // row height in px
  overscan: 5, // render 5 extra rows above/below viewport
});

// Render only virtual rows
{rowVirtualizer.getVirtualItems().map(virtualRow => (
  <TaskRow key={virtualRow.key} task={tasks[virtualRow.index]}
    style={{ transform: \`translateY(\${virtualRow.start}px)\` }} />
))}`,
        ),
        note('interview', "If asked about performance with large lists: 'I use @tanstack/react-virtual for windowed rendering. It only renders the 20-25 visible rows plus a 5-row overscan buffer. The total DOM node count stays constant regardless of data size. This keeps the table smooth even with 10,000+ rows. It's the same technique used by Google Sheets, Slack message lists, and VS Code's file explorer.'"),
      ],
    },
    {
      id: 'dashboard',
      title: '6. Dashboard & Analytics',
      blocks: [
        p('The dashboard is your **data visualization showcase**. Bangalore companies love candidates who can build charts and dashboards — especially fintech (Razorpay, Groww), analytics (Fractal, Mu Sigma), and SaaS companies.'),
        h('6.1 Summary Cards [MUST]'),
        p('Four metric cards at the top of the dashboard:'),
        li(
          '**Total Tasks** — count of all tasks in the project',
          "**Open Tasks** — tasks not in 'Done' status",
          "**Completed This Week** — tasks moved to 'Done' in the last 7 days, with % change from previous week (green arrow up or red arrow down)",
          "**Overdue** — tasks past due_date that aren't Done (shown in red)",
        ),
        code(
          'js',
          `// API endpoint: GET /api/projects/:id/analytics/summary
const summary = {
  totalTasks: await prisma.task.count({ where: { project_id } }),
  openTasks: await prisma.task.count({ where: { project_id, status: { name: { not: 'Done' }}}}),
  completedThisWeek: await prisma.task.count({ where: {
    project_id, status: { name: 'Done' },
    updated_at: { gte: startOfWeek }
  }}),
  overdue: await prisma.task.count({ where: {
    project_id, due_date: { lt: new Date() },
    status: { name: { not: 'Done' }}
  }})
};`,
        ),
        note('review', 'Two details: these four counts run one after another, so wrap them in `Promise.all` (or one `groupBy`) to run in parallel; and `updated_at` changes on **any** edit, so "completed this week" needs a real `completed_at` timestamp set when a task moves to Done.'),
        h('6.2 Charts (Recharts) [MUST]'),
        li(
          '**Donut Chart** — task distribution by status (color-coded segments)',
          '**Bar Chart** — tasks by priority level',
          '**Line Chart** — tasks created vs completed over time (dual-line with area fill)',
          '**Horizontal Bar** — workload per team member',
        ),
        code(
          'jsx',
          `// Recharts donut chart example
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = { 'To Do': '#94a3b8', 'In Progress': '#3b82f6',
                 'In Review': '#f59e0b', 'Done': '#10b981' };

<ResponsiveContainer width='100%' height={300}>
  <PieChart>
    <Pie data={statusData} innerRadius={60} outerRadius={100}
         dataKey='count' nameKey='status' label>
      {statusData.map(entry => (
        <Cell key={entry.status} fill={COLORS[entry.status]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>`,
        ),
        note('why', 'Always use **ResponsiveContainer** to make charts resize with the browser. Fixed-width charts break on tablets and phones — an instant red flag for interviewers.'),
        h('6.3 Sprint Burndown Chart [WOW]'),
        p('The burndown chart shows remaining work (story points) over the sprint duration. Two lines: the **ideal line** (straight diagonal from total points to zero) and the **actual line** (real progress). If the actual line is above the ideal line, the team is behind schedule.'),
        p('This single chart tells interviewers you understand Agile/Scrum — a huge plus for any Bangalore product company.'),
        note('interview', "If asked about sprint metrics: 'The burndown chart plots remaining story points against sprint days. I calculate the ideal line as a straight diagonal (total points / sprint days). Each day, I sum remaining points from uncompleted tasks. If the actual line crosses above ideal, it signals the team needs to reduce scope or the sprint was over-committed. I also track velocity (points completed per sprint) to improve future sprint planning.'"),
      ],
    },
    {
      id: 'realtime',
      title: '7. Real-Time Collaboration (WebSockets)',
      blocks: [
        p('Real-time features are what separate a portfolio project from a production app. When User A drags a task, User B should see it move instantly — without refreshing. This section is **extremely impressive in interviews** because most candidates never implement WebSockets.'),
        h('7.1 Socket.io Architecture [MUST]'),
        code(
          'js',
          `// Server setup
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL }
});

// Redis adapter for multi-server scaling
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

// Room-per-project: each project is a 'room'
io.on('connection', (socket) => {
  // Verify JWT from handshake
  const token = socket.handshake.auth.token;
  const user = verifyJWT(token);
  if (!user) return socket.disconnect();

  socket.on('join-project', (projectId) => {
    socket.join(\`project:\${projectId}\`);
    // Broadcast presence
    io.to(\`project:\${projectId}\`).emit('user-joined', {
      userId: user.id, name: user.name, avatar: user.avatar_url
    });
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(\`project:\${projectId}\`);
  });
});`,
        ),
        note('review', '`join-project` must check that the user is a **member** of that project\'s workspace before `socket.join`. Otherwise any logged-in user can join any room and read another company\'s live updates: the same access rule as the REST API.'),
        h('When to emit events:'),
        li(
          "Task created → emit 'task:created' with the new task data",
          "Task updated (status, priority, assignee, title, etc.) → emit 'task:updated' with changed fields",
          "Task deleted → emit 'task:deleted' with task ID",
          "Task moved (drag-and-drop) → emit 'task:moved' with taskId, newStatusId, newPosition",
          "Comment added → emit 'comment:created'",
        ),
        code(
          'js',
          `// In your task update controller (after DB save):
const updatedTask = await prisma.task.update({ ... });

// Emit to all users viewing this project (except the one who made the change)
io.to(\`project:\${task.project_id}\`)
  .except(socket.id) // Don't send back to sender
  .emit('task:updated', updatedTask);`,
        ),
        note('review', 'An HTTP controller has no `socket`: the client must send its socket id (for example in an `X-Socket-Id` header) so the server can exclude it. Alternatively broadcast to everyone and let the sender ignore its own change.'),
        h('Frontend: Listening to Events'),
        code(
          'js',
          `// Custom hook: useRealtimeSync
useEffect(() => {
  socket.on('task:updated', (updatedTask) => {
    queryClient.setQueryData(['tasks', projectId], (old) =>
      old.map(t => t.id === updatedTask.id ? updatedTask : t)
    );
  });

  socket.on('task:created', (newTask) => {
    queryClient.setQueryData(['tasks', projectId], (old) => [...old, newTask]);
  });

  socket.on('task:deleted', ({ taskId }) => {
    queryClient.setQueryData(['tasks', projectId], (old) =>
      old.filter(t => t.id !== taskId)
    );
  });

  return () => { socket.off('task:updated'); ... }; // Cleanup
}, [projectId]);`,
        ),
        note('why', 'The key insight: Socket.io events update the React Query cache directly. This means the board, table, and dashboard all update simultaneously — because they all read from the same React Query cache. One event, all views updated.'),
        note('mistake', 'Always authenticate WebSocket connections. Without JWT verification in the handshake, anyone could connect to your Socket.io server and listen to all events. This is a security hole most portfolio projects have.'),
        note('interview', "If asked 'how do you handle real-time?': 'I use Socket.io with a room-per-project architecture. When a user opens a project, their socket joins that project's room. When anyone in the project makes a change, the API controller emits an event to the room (excluding the sender). On the frontend, a custom hook listens for these events and updates the React Query cache directly — so all views (board, table, dashboard) stay in sync without refetching. I use Redis adapter for horizontal scaling across multiple server instances.'"),
        h('7.2 Presence & Connection Status [GOOD]'),
        li(
          '**Online indicator** — green dot on avatars of connected users',
          '**Connection status** — navbar shows: Connected | Reconnecting... | Offline',
          '**Auto-reconnect** with exponential backoff (1s, 2s, 4s, 8s, max 30s)',
        ),
        code(
          'js',
          `// Frontend connection status
socket.on('connect', () => setStatus('connected'));
socket.on('disconnect', () => setStatus('disconnected'));
socket.on('reconnect_attempt', () => setStatus('reconnecting'));`,
        ),
        note('review', 'In Socket.io v4 the reconnect events live on the **Manager**: `socket.io.on(\'reconnect_attempt\', ...)`, not `socket.on(...)`.'),
      ],
    },
    {
      id: 'ai',
      title: '8. AI-Powered Features',
      blocks: [
        p("AI integration is the **#1 trending skill** in 2026. Every company's job description mentions AI/LLM experience. Having real AI features (not just a chatbot wrapper) demonstrates you can build practical AI-powered product experiences."),
        h('8.1 AI Task Description Generator [MUST]'),
        code(
          'js',
          `// Backend: POST /api/ai/generate-description
import OpenAI from 'openai';
const openai = new OpenAI();

app.post('/api/ai/generate-description', async (req, res) => {
  const { title, projectName } = req.body;

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true, // Enable streaming
    messages: [
      {
        role: 'system',
        content: \`You are a senior product manager. Given a task title for the project "\${projectName}", write a clear task description including: 1) What needs to be done, 2) Acceptance criteria (bullet points), 3) Edge cases to consider, 4) Technical notes if applicable. Keep it concise and actionable.\`
      },
      { role: 'user', content: \`Task title: \${title}\` }
    ],
    max_tokens: 500
  });

  // Stream response to frontend (typewriter effect)
  res.setHeader('Content-Type', 'text/event-stream');
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    res.write(\`data: \${JSON.stringify({ content })}\\n\\n\`);
  }
  res.write('data: [DONE]\\n\\n');
  res.end();
});`,
        ),
        code(
          'js',
          `// Frontend: streaming with EventSource
const generateDescription = async (title) => {
  setIsGenerating(true);
  setDescription('');

  const response = await fetch('/api/ai/generate-description', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, projectName })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    const lines = text.split('\\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      const { content } = JSON.parse(data);
      setDescription(prev => prev + content); // Typewriter effect
    }
  }
  setIsGenerating(false);
};`,
        ),
        note('why', 'The **streaming response** (typewriter effect) is key. Without it, the user waits 3-5 seconds seeing nothing, then the full text appears. With streaming, they see text appearing word by word — it feels fast and interactive. This is how ChatGPT, Claude, and every modern AI product works.'),
        note('review', 'The code reads the stream with `fetch` (EventSource can\'t send a POST body), despite its comment. A network chunk can end in the middle of a `data:` line, so keep the unfinished part in a buffer until the next chunk, and use `decoder.decode(value, { stream: true })`. Put AI endpoints behind auth and a per-user limit: each call costs money.'),
        h('8.2 AI Subtask Breakdown [WOW]'),
        p("User clicks 'Break into subtasks' → AI returns suggested subtasks → user picks which ones to add:"),
        code(
          'text',
          `// Prompt
\`Break this task into 3-7 actionable subtasks.
Task: "\${title}"
Description: "\${description}"

Respond ONLY with a JSON array:
[{"title": "...", "estimation_hours": N}, ...]\``,
        ),
        note('mistake', 'Always validate AI output. The model might return malformed JSON or inject HTML. Parse with try/catch, validate with Zod, and sanitize any HTML content before rendering.'),
        h('8.3 Daily Standup Generator [WOW]'),
        p("Reads the user's task activity from the last 24 hours and generates a standup report. Output format:"),
        li(
          '**Yesterday:** Completed PROJ-042 (Fix login redirect), Reviewed PROJ-038',
          '**Today:** Working on PROJ-045 (Dashboard charts)',
          '**Blockers:** Waiting for API spec from backend team',
          'Copy to clipboard button — paste into Slack/Teams',
        ),
        h('8.4 Natural Language Task Creation [WOW]'),
        p("User types: 'Fix the payment bug on mobile, high priority, assign to Ravi, due Friday'"),
        p("AI extracts: title='Fix the payment bug on mobile', priority=HIGH, assignee=Ravi, due_date=next Friday"),
        p('Show pre-filled form → user confirms → task created. This is the most impressive AI feature because it shows NLP parsing into structured data.'),
      ],
    },
    {
      id: 'search',
      title: '9. Global Search (Command Palette)',
      blocks: [
        p('The Cmd+K command palette is now a standard UX pattern used by GitHub, Vercel, Linear, Notion, VS Code, and Figma. Not having it in 2026 makes your app feel dated.'),
        h('9.1 Implementation [MUST]'),
        code(
          'jsx',
          `// SearchModal component
const SearchModal = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Open with Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Debounced search
  const debouncedSearch = useDebouncedCallback(async (q) => {
    const { data } = await api.get(\`/search?q=\${q}\`);
    setResults(data);
  }, 300);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') setSelectedIndex(i => Math.min(i+1, results.length-1));
    if (e.key === 'ArrowUp') setSelectedIndex(i => Math.max(i-1, 0));
    if (e.key === 'Enter') navigateToResult(results[selectedIndex]);
    if (e.key === 'Escape') setIsOpen(false);
  };
};`,
        ),
        note('review', 'Encode the query (`?q=${encodeURIComponent(q)}`, or pass `{ params: { q } }` to axios), or a search for "a&b" breaks the URL. Also ignore answers that arrive after a newer search started, so slow results never replace fresh ones.'),
        li(
          'Results grouped by type: Tasks (with task ID + status badge), Projects (with icon), Members (with avatar)',
          'Recent searches stored in localStorage (last 5)',
          "Quick actions: 'Create task', 'Go to settings', 'Switch workspace' [GOOD]",
        ),
        note('why', 'The keyboard navigation (arrow keys + Enter + Escape) is what makes this feel professional. Without it, users who prefer keyboard over mouse (most developers) will notice.'),
      ],
    },
    {
      id: 'performance',
      title: '10. Performance, Error Handling & Loading States',
      blocks: [
        p('This section separates **senior developers from juniors**. Juniors build happy-path features. Seniors handle loading, empty, error, offline, and edge-case states. Interviewers check for this.'),
        h('10.1 Skeleton Screens [MUST]'),
        p('Never use spinners. Skeleton screens (pulsing gray boxes that match the layout of the actual content) provide **perceived performance** — the user feels like content is loading, not that the app is frozen.'),
        code(
          'jsx',
          `// Skeleton component
const TaskCardSkeleton = () => (
  <div className='animate-pulse rounded-lg border p-3 space-y-2'>
    <div className='h-3 bg-gray-200 rounded w-1/3' />   {/* Task ID */}
    <div className='h-4 bg-gray-200 rounded w-full' />  {/* Title line 1 */}
    <div className='h-4 bg-gray-200 rounded w-2/3' />   {/* Title line 2 */}
    <div className='flex gap-2 mt-2'>
      <div className='h-5 w-5 bg-gray-200 rounded-full' /> {/* Avatar */}
      <div className='h-5 bg-gray-200 rounded w-16' />     {/* Due date */}
    </div>
  </div>
);

// Usage
{isLoading ? (
  Array.from({ length: 5 }).map((_, i) => <TaskCardSkeleton key={i} />)
) : (
  tasks.map(task => <TaskCard key={task.id} task={task} />)
)}`,
        ),
        note('review', '"Never" is too strong: skeletons suit **content** that is loading; a spinner inside a **button** is right for an action in progress (the spec itself asks for both in 14.1). Use `motion-safe:animate-pulse` so the pulse stops for people who chose reduced motion.'),
        h('10.2 Empty States [MUST]'),
        p('Every list/page needs a meaningful empty state — not just a blank screen:'),
        li(
          "**No projects** → illustration + 'Create your first project' button",
          "**No tasks** → 'This project is empty. Create a task to get started.'",
          "**No search results** → 'No tasks match your filters. Try adjusting your search.'",
          "**No notifications** → 'You're all caught up!'",
        ),
        note('mistake', "A blank white screen with no explanation is the #1 UX mistake in portfolio projects. Every empty state should explain WHY it's empty and WHAT to do next."),
        h('10.3 Error Boundary [MUST]'),
        code(
          'jsx',
          `// Global error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Send to Sentry
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex flex-col items-center justify-center h-screen'>
          <h2>Something went wrong</h2>
          <p>We've been notified and are looking into it.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}`,
        ),
        p("Wrap your app at the top level AND wrap individual routes. This way a crash in the dashboard doesn't break the entire app — the user can still navigate to other pages."),
        h('10.4 Offline Detection [GOOD]'),
        code(
          'jsx',
          `// Network status hook
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => { ... cleanup };
  }, []);
  return isOnline;
};

// Show banner when offline
{!isOnline && (
  <div className='bg-yellow-50 text-yellow-800 text-center py-2 text-sm'>
    You're offline. Changes will sync when you reconnect.
  </div>
)}`,
        ),
        note('review', 'Cleanup needs the **same** function references that were added, so define the handlers as named functions first; inline arrows can\'t be removed. ShopVerse\'s offline popup listens to these same events in `frontend/src/lib/api-error.js`.'),
      ],
    },
    {
      id: 'security',
      title: '11. Security Best Practices',
      blocks: [
        p('Security is non-negotiable for production apps. Having these in your portfolio project shows maturity that most candidates lack.'),
        li('**Input sanitization (XSS prevention)** — sanitize all user-generated HTML with DOMPurify before rendering. The rich text editor stores HTML, so always sanitize on output. [MUST]'),
        code(
          'jsx',
          `import DOMPurify from 'dompurify';
// When rendering task description:
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description) }} />`,
        ),
        li(
          '**SQL injection prevention** — Prisma parameterizes all queries automatically. Never use raw SQL with user input. [MUST]',
          '**CSRF protection** — SameSite=Strict on cookies prevents cross-site request forgery [MUST]',
          '**Rate limiting** — express-rate-limit: 100 req/15min general, 5 attempts for login, 10 req/min for AI endpoints (expensive) [MUST]',
          '**Helmet.js** — sets 11 secure HTTP headers in one line of code [MUST]',
        ),
        code(
          'js',
          `import helmet from 'helmet';
app.use(helmet()); // Sets X-Content-Type-Options, X-Frame-Options, CSP, HSTS, etc.`,
        ),
        li(
          '**CORS whitelist** — only your frontend domain can call your API [MUST]',
          '**File upload validation** — check MIME type, extension, AND file size on the server (not just frontend) [MUST]',
          '**API input validation** — Zod schemas on every endpoint; reject invalid payloads before business logic runs [MUST]',
        ),
        code(
          'js',
          `// Zod schema for task creation
const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE']).optional(),
  assignee_id: z.string().cuid().optional(),
  due_date: z.string().datetime().optional(),
  estimation: z.number().positive().optional()
});

// Middleware
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
  req.body = result.data; // Use validated & typed data
  next();
};`,
        ),
        note('interview', "If asked 'how do you handle security?': Walk through all the layers: 'Input validation with Zod on every endpoint, XSS prevention with DOMPurify for rich text, SQL injection protection via Prisma's parameterized queries, JWT in httpOnly cookies (not localStorage), Helmet for secure headers, rate limiting for brute-force protection, CORS whitelist, and file upload validation on the server. I also run npm audit in CI to catch dependency vulnerabilities.'"),
        note('review', 'In Express 5, `req.query` is read-only, which is why ShopVerse\'s `validate` middleware stores the clean result in `res.locals` instead of overwriting the request (`backend/src/middleware/validate.js`).'),
      ],
    },
    {
      id: 'testing',
      title: '12. Testing Strategy',
      blocks: [
        p('Having tests in your portfolio project is **extremely rare** and immediately signals senior-level thinking. Even 15-20 well-written tests make a huge impression.'),
        h('12.1 What to Test (Priority Order) [MUST]'),
        ol(
          '**Utility functions** — pure functions are easiest to test. Date formatting, sorting logic, filter functions, position calculation.',
          '**Custom hooks** — useAuth (login/logout/refresh), useDebounce, useNetworkStatus',
          '**Critical components** — LoginForm (validation + submit), TaskCard (renders all fields), SearchModal (keyboard navigation)',
          '**API endpoints** — auth flow, task CRUD, permission checks',
          '**E2E critical path** — login → create project → create task → drag on board',
        ),
        h('12.2 Example Tests [MUST]'),
        code(
          'js',
          `// Utility test
describe('getNewPosition', () => {
  it('returns midpoint between two tasks', () => {
    expect(getNewPosition({ position: 1.0 }, { position: 2.0 })).toBe(1.5);
  });
  it('returns half of below task when no above', () => {
    expect(getNewPosition(null, { position: 2.0 })).toBe(1.0);
  });
});

// Component test
describe('TaskCard', () => {
  it('renders task title and ID', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('PROJ-042')).toBeInTheDocument();
    expect(screen.getByText('Fix login redirect')).toBeInTheDocument();
  });
  it('shows overdue badge for past due dates', () => {
    render(<TaskCard task={overdueTask} />);
    expect(screen.getByText('Overdue')).toHaveClass('text-red-500');
  });
});

// API test with Supertest
describe('POST /api/tasks', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/projects/p1/tasks').send({ title: 'Test' });
    expect(res.status).toBe(401);
  });
  it('creates task and returns 201', async () => {
    const res = await request(app)
      .post('/api/projects/p1/tasks')
      .set('Authorization', \`Bearer \${token}\`)
      .send({ title: 'New task', priority: 'HIGH' });
    expect(res.status).toBe(201);
    expect(res.body.task_number).toBe(1);
  });
});`,
        ),
        note('why', "Test BEHAVIOR, not implementation. Don't test 'useState was called 3 times'. Test 'when I click submit with invalid email, the error message appears'. This makes tests resilient to refactoring."),
        note('review', 'Checking a CSS class (`toHaveClass(\'text-red-500\')`) tests the implementation the same box warns against: a colour change breaks it. Prefer something the user perceives, such as the "Overdue" text or an accessible label.'),
      ],
    },
    {
      id: 'deployment',
      title: '13. Deployment, DevOps & CI/CD',
      blocks: [
        h('13.1 Hosting Setup [MUST]'),
        li(
          '**Frontend** → Vercel (free, auto-deploys from GitHub, edge network, perfect for Next.js)',
          '**Backend** → Railway ($5/month) or Render (free tier with cold starts)',
          '**Database** → Neon (serverless PostgreSQL, free 500MB) or Supabase (free 500MB)',
          '**Redis** → Upstash (serverless, free 10K commands/day)',
          '**File storage** → Cloudinary (free 25GB) for avatars and attachments',
          '**Email** → Resend (free 100 emails/day) for verification and notifications',
        ),
        note('why', 'Total cost: $0-5/month. All services have generous free tiers. A live, deployed project with a real URL is 10x more impressive than code on GitHub with no demo.'),
        note('review', 'Free-tier limits and prices change often; check each provider\'s current pricing page before relying on these numbers.'),
        h('13.2 CI/CD with GitHub Actions [GOOD]'),
        code(
          'yaml',
          `# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint          # ESLint
      - run: npm run type-check    # tsc --noEmit
      - run: npm run test          # Jest
      - run: npm run build         # Next.js build`,
        ),
        p('This pipeline runs on every PR and every push to main. If any step fails, the PR is blocked. This ensures broken code never reaches production.'),
        h('13.3 Docker Setup [GOOD]'),
        code(
          'yaml',
          `# docker-compose.yml
services:
  api:
    build: ./apps/api
    ports: ['4000:4000']
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/taskflow
      REDIS_URL: redis://redis:6379
    depends_on: [db, redis]
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: taskflow
      POSTGRES_PASSWORD: password
    volumes: ['pgdata:/var/lib/postgresql/data']
  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
volumes:
  pgdata:`,
        ),
        p('One command to start: **docker compose up**. Anyone who clones your repo can run the entire backend stack in seconds. This shows DevOps maturity.'),
      ],
    },
    {
      id: 'resume',
      title: '14. Resume Bullet Points (Copy-Paste Ready)',
      blocks: [
        p("Add these under a 'Projects' section on your resume. Each bullet starts with an action verb and includes measurable impact:"),
        li(
          '**Built a real-time project management dashboard** (Next.js, TypeScript, PostgreSQL, Socket.io) with Kanban drag-and-drop, inline table editing, and AI-powered task generation serving 50+ demo users',
          '**Implemented optimistic UI updates** for drag-and-drop task management, achieving instant visual feedback with automatic rollback on API failure, reducing perceived latency to 0ms',
          '**Designed 35+ REST API endpoints** with JWT + refresh token auth, RBAC (4 roles), rate limiting, Zod validation, and comprehensive error handling across 14 database tables',
          '**Integrated OpenAI GPT-4o-mini** for AI task description generation with streaming responses (typewriter effect), subtask breakdown, and daily standup summaries',
          '**Developed real-time collaboration** using Socket.io with room-per-project architecture, live presence indicators, and conflict resolution for concurrent edits',
          '**Built analytics dashboard** with 5+ interactive charts (Recharts) including sprint burndown, velocity, task distribution, and team workload visualizations',
          '**Achieved 90%+ Lighthouse score** through code splitting, virtualized lists (react-virtual), skeleton loading states, and bundle optimization (under 200KB gzipped)',
          '**Wrote 30+ automated tests** (Jest, React Testing Library, Playwright) covering auth flows, task CRUD, drag-and-drop, and critical E2E paths',
          '**Set up CI/CD pipeline** with GitHub Actions (lint → type-check → test → build → deploy), Docker containerization, and Sentry error monitoring',
        ),
        note('review', 'Write only what you built and measured. Numbers like "50+ demo users" or "0ms" will be questioned; real, checkable facts from your own project are far stronger.'),
      ],
    },
    {
      id: 'plan',
      title: '15. 4-Week Build Plan',
      blocks: [
        table(
          ['Week', 'Focus', 'Deliverables'],
          [
            ['1', 'Foundation', 'Auth (login, register, JWT, refresh, OAuth), Prisma schema + migrations, Project CRUD, Task CRUD (all fields), Docker + docker-compose'],
            ['2', 'Core Views', 'Kanban board (drag-drop + optimistic updates), Task detail panel, Comments, Subtasks, Labels, Activity log, Rich text editor'],
            ['3', 'Power Features', 'Table view (sort, filter, inline edit, bulk actions), Dashboard (5 charts), Global search (Cmd+K), Responsive design, Dark mode, Notifications'],
            ['4', 'Polish & Ship', 'Socket.io real-time, AI features (3 features with streaming), Testing (30+ tests), CI/CD pipeline, Deploy to Vercel + Railway, README case study, Demo video, Resume update, LinkedIn post'],
          ],
        ),
        p('**You now have everything you need.** The feature spec, the implementation knowledge, the code patterns, the interview answers, and the resume bullets. Build it in 4 weeks, deploy it live, and apply to those 531 Bangalore companies with confidence. Good luck!'),
      ],
    },
  ],
};
