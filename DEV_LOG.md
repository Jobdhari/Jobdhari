# Dev Log

## Day 1 - Firebase Stabilization + Employer Jobs Fix
- Goal: Single Firebase init + employer dashboard shows employer-posted jobs.
- Locked decision: All imports from "@/lib/firebase" only.
- Files changed:
  - src/lib/firebase.ts
  - src/app/employer/post-job/page.tsx
  - src/app/employer/dashboard/page.tsx
- Replaced imports:
  - "@/lib/firebase" -> "@/lib/firebase"
  - "@/lib/firebase" -> "@/lib/firebase"
- Result:
  - Employer can post job and see it in employer dashboard.
## Checkpoint: Firebase + Dashboard/Roles (WIP)

### Goal
Unify Firebase imports and stop role/dashboard confusion.

### Current Firebase source of truth
- src/lib/firebase.ts exports: auth, db, storage, app

### Known broken/cleanup items to finish next
- Remove old imports like "@/lib/firebase/auth" and "@/lib/firebase/db"
- Fix any remaining imports pointing to "@/lib/firebase/applicationService.ts" using "./db" etc
- Make /dashboard role-aware redirect:
  - candidate -> /candidate/home
  - employer -> /employer/dashboard
- Sidebar should be role-aware (no mixed menus)

### Next session plan
1) Fix remaining build errors (import paths)
2) Implement /dashboard redirect by role
3) Separate Candidate Home and Employer Dashboard UX
Dev Log (what we did today)

You can copy-paste this into a DEV_LOG.md or Notion.

Date: 13 Dec 2025
Project: JobDhari

Work completed:

Finalised Employer Dashboard layout

Implemented Jobs & Responses main page

Implemented Post a Job page under employer flow

Unified TopNav + AppShell so header behaves consistently

Fixed logo alignment issue (home vs dashboard mismatch)

Sidebar + filters structure added (job status, search)

Verified employer auth gating for “Post a Job”

Set up GitHub repository and successfully pushed code

Resolved Git remote, branch tracking, and authentication issues

Known issues (intentionally paused):

Duplicate filter panels appearing side-by-side (to be cleaned later)

Firestore composite index required for some job queries

UI polish (spacing, mobile responsiveness) pending

Status:
✅ Stable
🚧 Iteration pending
Added employer top navigation (Jobs & Responses / Post a Job / Reports)

Implemented Employer Dashboard “Jobs & Responses” page UI

Implemented Post Job page UI + connected job creation service

Fixed Firestore composite index requirement for jobs queries

Standardized job writing: ensure createdByUid + postedByUid are written

Git repo connected to GitHub and push working

Known issue created: duplicate Filters panel appears twice on employer dashboard (needs fix)
# DEV LOG — JobDhari

## 2025-01 (Current Sprint)

### Employer Dashboard & Job Posting
- Implemented Employer Dashboard (“Jobs & Responses”) page
- Implemented Employer Post Job page UI
- Connected Post Job flow to Firestore via service layer
- Added JobDhari human-readable job ID format (JDYYYY-xxxxx)

### Firestore & Data Fixes
- Standardized job document writes to include BOTH:
  - createdByUid
  - postedByUid
- Fixed issue where jobs appeared in /jobs but not in employer dashboard
- Added backward compatibility for older jobs using only one field
- Fixed Firestore composite index errors for jobs queries

### Layout & Navigation
- Introduced AppShell layout (TopNav + Sidebar)
- Fixed double navigation issue (TopNav + Sidebar duplication)
- Employer dashboard now uses AppShell consistently

### Git & Project Hygiene
- Initialized Git repository
- Connected project to GitHub remote
- Verified commit & push workflow

### Known Issues (Open)
- Duplicate Filters sidebar appears twice on Employer Dashboard
- Filters are UI-only (no live filtering yet)
- Candidate profile flow incomplete
- Recruiter flows partially implemented but not standardized
## 2025-12-14 — Employer Dashboard stabilization (filters + layout)

### Fixes
- Removed duplicate Filters UI from shared Sidebar component.
- Confirmed Employer Dashboard page as the single owner of job filters.
- Fixed critical job status mismatch:
  - UI now uses backend-correct value `"open"` instead of invalid `"active"`.
- Corrected dashboard layout spacing by removing nested flex layout and using page-level grid.

### Files changed
- src/components/layout/Sidebar.tsx (removed Filters UI)
- src/app/employer/dashboard/page.tsx (layout fix + status key alignment)

### Outcome
- One Filters panel
- Correct backend-aligned filtering
- Clean, predictable dashboard layout
JobDhari — Development Log Update
Date 15-12-2025 at 12:30 AM

Employer Dashboard UI Stabilization (Current Sprint)

Changes Implemented

Resolved duplicate navigation issue

Identified that both Top Navbar and Left Sidebar were rendering employer navigation.

Removed sidebar navigation rendering for /employer/dashboard.

Final rule: Top Navbar is the single source of navigation for employer flows.

Stabilized Employer Dashboard layout

Dashboard now renders:

Left column → Filters only (Job status + Search)

Right column → Jobs & Responses content

Removed layout conflicts caused by nested flex containers.

Adopted a grid-based layout inside the dashboard page only.

Fixed disappearing UI issue

Root cause: early return based on getAuth().currentUser.

Removed auth-based early return.

Dashboard layout always renders.

Auth now gates data, not structure.

Unified filter logic

Filters exist only in employer/dashboard/page.tsx.

Removed filter/search UI from global sidebar.

Ensured job status values match backend schema:

open, closed, draft

UI label “Active jobs” correctly maps to open.
## 2025-12-15 21:40 (IST) — Employer Dashboard: mobile filters + clear + status counts

### Change
Upgraded Filters UX on `/employer/dashboard`:
- Mobile filters are collapsible using `Sheet` (drawer).
- Added `Clear filters` to reset search + status.
- Added per-status counts (Open / Closed / Draft) using `Badge`, computed from loaded jobs.

### Files changed
- src/app/employer/dashboard/page.tsx

### Notes
- No Firestore changes.
- Status keys remain backend-aligned: "open" | "closed" | "draft".
## 2025-12-15 00:54 (IST) — Employer Dashboard: persist filters in URL

### Change
Persisted dashboard filters in the URL to keep state across refresh/share:
- `status` stored as `?status=open|closed|draft` (omitted when "all")
- `search` stored as `?q=...` (omitted when empty)

### Files changed
- src/app/employer/dashboard/page.tsx

### Notes
- Uses `router.replace()` to avoid polluting browser history.
- Status values remain backend-aligned: "open" | "closed" | "draft".
## 2025-12-15 HH:MM (IST) — Employer Dashboard: normalize job status for filters + counts

### Issue
Existing job docs used legacy status values like "active" and "approved", while dashboard filters/counts expected canonical statuses: "open" | "closed" | "draft". This caused status filters to show no results and counts to remain 0.

### Fix
Added a status normalization layer in the employer dashboard UI:
- active/approved/published → open
- inactive → closed
- open/closed/draft → unchanged
Unknown values default to open to avoid hiding jobs.

### Files changed
- src/app/employer/dashboard/page.tsx

### Notes
UI-only stabilization. Firestore write logic will be updated separately to always write canonical statuses.
## 2025-12-15 22:10 (IST) — Fix build error in updateJobStatus import

### Issue
Build failed because `updateJobStatus.ts` attempted to import Firestore instance from a non-existent path (`@/lib/firebase/db`).

### Fix
Aligned Firestore import with existing project convention:
- Updated import to use `@/lib/firebase`.

### Files changed
- src/lib/updateJobStatus.ts

### Notes
No logic changes. Import path correction only.
## 2025-12-15 22:25 (IST) — Employer jobs: add Edit Job page + dashboard link

### Change
Enabled employers to edit an existing job:
- Added `/employer/jobs/[id]/edit` page to load job by id, prefill form fields, and update job document.
- Added "Edit" action button on employer dashboard job cards.

### Files changed
- src/app/employer/jobs/[id]/edit/page.tsx (new)
- src/app/employer/dashboard/page.tsx (add Edit button)

### Notes
- Edit updates `updatedAt` only.
- Does not modify ownership fields (`createdByUid`, `postedByUid`).
## 2025-12-15 22:45 (IST) — Employer Dashboard: backend response count wiring

### Change
Wired real application counts to Employer Dashboard job cards:
- Applications are fetched from `applications` collection.
- Counts are grouped by `jobId` and displayed per job.

### Files changed
- src/app/employer/dashboard/page.tsx

### Notes
- MVP implementation uses `where("jobId", "in", [...])` (max 10 jobs).
- No Firestore schema changes.
## 2025-12-15 23:05 (IST) — Firestore Security Rules: Jobs + Applications (MVP lockdown)

### Change
Implemented MVP Firestore security rules to protect production data:
- Jobs: public read only for published open jobs; owners can read/write their own jobs.
- Jobs updates: ownership fields locked; updates restricted to a safe whitelist; updatedAt must match request.time.
- Applications: candidates can create for published/open jobs; candidates can read their own; employers can read apps for jobs they own.
- Counters locked (admin-only later).

### Files changed
- firestore.rules (or firebase/firestore.rules)

### Notes
Rules enforce canonical job statuses: "open" | "closed" | "draft".
## 2025-12-16 00:10 (IST) — Git reset to last stable employer MVP

### Context
Local changes caused application breakage during ongoing development.

### Action
Reset working directory to last known stable commit:
- Employer dashboard MVP (filters, job actions, edit job, response counts, Firestore rules)

### Commit restored
- 029e89b

### Notes
All subsequent development will follow small-change + immediate-commit workflow.
## 2025-12-16 00:40 (IST) — Setup: Firestore Rules testing via Firebase Emulator

### Change
Started validating Firestore security rules using Firebase Emulator Suite to avoid breaking production rules during iteration.

### Notes
- Firestore Emulator runs locally (default 8080) with Emulator UI (default 4000).
- App can be configured to connect to emulator in development mode.
## 2025-12-16 02:05 (IST) — Fixed employer job posting (canonical write)

### Change
Fixed Post Job submit handler to write only canonical fields.

### Details
- Removed legacy `employerId`
- Replaced status `"active"` with `"open"`
- Always write:
  - createdByUid
  - postedByUid
  - isPublished = true

### Impact
- New jobs reliably appear on employer dashboard
- Filters and counts work correctly
## 2025-12-16 03:30 (IST) — Jobs migration dry-run validated (no changes needed)

### Action
Ran Admin SDK dry-run migration script against `jobs` collection.

### Result
- Scanned: 11 jobs
- Already compliant: 11
- Would change: 0
- Failures: 0
- CAN_PROCEED = true

### Conclusion
No legacy normalization required for current jobs dataset. Remaining issues are likely Auth/Rules/config, not job document schema.
