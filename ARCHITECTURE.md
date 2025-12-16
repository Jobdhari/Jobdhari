# JobDhari Architecture (Locked)

## Firebase
- Initialization happens ONLY in:
  src/lib/firebase/firebaseConfig.ts
- Auth exported from:
  src/lib/firebase/auth.ts
- Firestore exported from:
  src/lib/firebase/db.ts

❌ No page or component initializes Firebase directly.

## User Model (Single Source of Truth)
- One Firebase user
- Role stored in Firestore
- Roles:
  - candidate
  - employer
  - recruiter (future)

## Routing Rules
- /jobs → public
- /candidate/* → candidate only
- /employer/* → employer only
- /admin/* → admin only

## Layout Rules
- Root layout: NO sidebar
- Role layouts control sidebar rendering
Add/confirm:

Stack: Next.js 14 App Router + Firebase

Route map (key):

/employer/dashboard

/employer/post-job

/employer/my-jobs

Firestore collections: users, jobs, applications, counters

Jobs document fields (minimum canonical):

jobDhariId, title, companyName, location, category, description

status, isPublished

createdByUid, postedByUid

createdAt, updatedAt

Service layer is source of truth for writes:

src/lib/firebase/employerJobsService.ts (job creation)

Indexes used for queries (high-level note)

Known issue: duplicate sidebar rendering (layout composition problem)
# JobDhari — Architecture

## Tech Stack
- Frontend: Next.js 14 (App Router, TypeScript)
- Backend: Firebase
  - Auth
  - Firestore
  - Storage (planned)
- Styling: Tailwind CSS, shadcn/ui
- Hosting: Vercel (planned)

---

## App Structure (High Level)

### Layouts
- Root layout: TopNav
- AppShell: TopNav + Sidebar (used for dashboards)

### Key Routes
- /jobs → Public jobs list
- /employer/dashboard → Employer “Jobs & Responses”
- /employer/post-job → Create job
- /employer/my-jobs → Employer job list
- /candidate/dashboard → (planned)
- /candidate/profile → (planned)

---

## Firestore Data Model

### users
- uid
- role (candidate | employer | recruiter | admin)
- email
- createdAt

### jobs (CRITICAL COLLECTION)
Required fields:
- jobDhariId
- title
- companyName
- location
- category
- description
- status ("open", "closed")
- isPublished (boolean)

Ownership fields (MUST WRITE BOTH):
- createdByUid
- postedByUid

Timestamps:
- createdAt
- updatedAt

### applications
- jobId
- userId
- status
- appliedAt

### counters
- jobPosts (used for sequential JobDhari IDs)

---

## Service Layer (IMPORTANT RULE)

All Firestore writes MUST go through services.

Primary services:
- src/lib/firebase/employerJobsService.ts
  - createEmployerJob()
- src/lib/firebase/applicationService.ts

Pages MUST NOT write directly to Firestore.

---

## Known Architecture Issues
- Duplicate Filters sidebar rendering on employer dashboard
- Needs single source of truth for filters (layout vs page)

---

## Non-Goals
- No Resdex / resume search database
- No AI scoring in MVP
- No billing or subscriptions in MVP
## Employer Dashboard UI Architecture (MVP)

### Filter ownership
- Job Filters must exist only in `src/app/employer/dashboard/page.tsx`.
- Shared Sidebar must remain navigation-only.

### Layout rule
- Global layouts control navigation & width.
- Pages must not introduce competing horizontal flex layouts.
- Use page-level grid for filters + content.

### Data consistency
- UI status keys must exactly match Firestore job status values:
  - "open", "closed", "draft"
- User-facing labels may differ (e.g. "Active jobs" → "open").
JobDhari — Architecture Log Update
Navigation Architecture (Finalized)

Top Navbar

Primary employer navigation:

Jobs & Responses

Post a Job

Reports

Sidebar

Disabled for Employer Dashboard

Reserved for future non-dashboard employer pages if needed

Layout Ownership Rules (Locked)
Layer	Responsibility
AppShell / Global Layout	Navigation only
Employer Dashboard Page	Filters, search, actions, data
Auth	Controls data access, not UI rendering
Dashboard Structure
Top Navbar
└── Employer Dashboard
    ├── Filters Panel (left)
    │   ├── Job status (All / Open / Closed / Draft)
    │   └── Search
    └── Jobs & Responses (right)

Anti-patterns Eliminated

❌ Duplicate navigation

❌ Page-level flex layouts conflicting with global layout

❌ Auth-based early returns hiding UI

❌ Multiple sources of truth for filters
JobDhari — Project State Update
Employer Dashboard Status

✅ STABLE
✅ UX-consistent
✅ Production-safe

What Works Now

Filters always visible

Search always accessible

Jobs list stable

No layout jumps on reload

No duplicated UI elements

Clean separation of navigation vs tools

Technical Confidence

Layout architecture is now locked

Future features can be added without breaking structure

Matches patterns used by mature hiring platforms

Ready for Next Phase

Add job actions (Edit / Close)

Add response counts

Add filter persistence (URL/state)

Mobile filter collapse (later)

✅ Summary (one-line)

Employer Dashboard navigation and layout architecture has been finalized, stabilized, and locked for MVP with a single navigation source and page-owned filters.
### Employer Dashboard: URL-synced filters (MVP)
- Filters are persisted in the URL:
  - `status`: open|closed|draft (omitted when all)
  - `q`: search query string (omitted when empty)
- State hydrates from URL on load and updates URL on change using `router.replace()`.
### Job status normalization (MVP)
Canonical job status values: "open" | "closed" | "draft".
For backward compatibility in UI:
- "active" / "approved" / "published" are treated as "open"
- "inactive" is treated as "closed"
### Employer Edit Job (MVP)
Route: `/employer/jobs/[id]/edit`
- Reads job doc from `jobs/{id}`
- Updates editable fields (title, companyName, location, pincode, category, description)
- Writes `updatedAt = serverTimestamp()`
- Does NOT change ownership fields
### Employer Dashboard: Response counts (MVP)
- Source: `applications` collection
- Grouped by `jobId`
- Counts computed client-side after jobs load
- Uses `where("jobId", "in", jobIds)` for MVP scale
## Firestore Security Rules (MVP)

### Jobs
- Public read: only `isPublished == true` and `status == "open"`
- Owner read/write: if `createdByUid == auth.uid` OR `postedByUid == auth.uid`
- Updates: ownership fields immutable; allowed updates are whitelisted; `updatedAt` required.

### Applications
- Create: signed-in candidate can apply only to published/open jobs; `appliedAt == request.time`
- Read: candidate can read own; employer/recruiter can read applications for jobs they own
- Update/Delete: disabled in MVP
### Local development (MVP)
Use Firebase Emulator Suite (Firestore) to test security rules safely before publishing to production.
## Data maintenance
- Admin SDK dry-run migration script exists for `jobs` normalization verification.
- Current `jobs` docs (sample size 11) already conform to canonical schema.
### Job ID Generation
- JobDhari IDs are generated via a shared `/counters` document.
- Current MVP allows authenticated access to counters.
- Before beta, migrate ID generation to:
  - Cloud Function OR
  - Admin-only rule
### Application Counts
- Firestore limits `in` queries to 10 values.
- Employer dashboard batches jobIds in chunks of 10 to fetch application counts safely.
