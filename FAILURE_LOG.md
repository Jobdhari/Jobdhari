# FAILURE LOG
> Purpose:
> Track engineering failures that caused incorrect behavior, broken UX,
> data inconsistency, or blocked flows.
>
> > Rule:
> - Every failure gets an ID: FAIL-YYYY-MM-DD-XX
> - Every resolved failure must link to a DEV entry (DEV-YYYY-MM-DD-XX)
> - Failures are never deleted, only marked Resolved
> - Even unshipped failures must be logged (future prevention)

## Failure Template

## FAIL-YYYY-MM-DD-XX — <short failure title>

**Date:** YYYY-MM-DD  
**Status:** ⛔ Open | ✅ Resolved  
**Fixed In:** DEV-YYYY-MM-DD-XX (only when resolved)

### Symptom
What the user/dev observed.

### Root Cause
The actual technical reason (not the fix).

### Fix
What was changed to resolve it.

### Prevention Rule
One rule to prevent this class of failure again.

No advice, no new steps — only what was tried and why it failed.

❌ Attempt 1: Tighten Firestore rules immediately

What we did

Replaced permissive rules with strict rules

Enforced:

request.auth != null

request.auth.uid == employerId

required fields

Why it failed

Existing job documents did not match new schema

Old jobs used createdByUid, not employerId

Rules blocked reads and writes instantly

Result

Dashboard showed no jobs

Posting job failed silently

Lesson

Never tighten rules before verifying existing data matches them.

❌ Attempt 2: Change dashboard query to employerId

What we did

Updated dashboard query to:

where("employerId", "==", currentUser.uid)


Why it failed

Most old jobs did not have employerId

Firestore returned empty results

Result

“No jobs match your filters”

Looked like data loss

Lesson

Never change query fields until all documents contain that field.

❌ Attempt 3: Partial data migration

What we did

Wrote migrate-jobs.js

Copied createdByUid → employerId for some jobs

Why it failed

Migration did not:

normalize status

verify all docs updated

Some docs still blocked by rules

Result

Some jobs visible, others missing

Inconsistent state

Lesson

Migration must be 100% complete or not run at all.

❌ Attempt 4: Introduce new status enum

What we did

Changed status values:

from "active"

to "open" | "closed" | "draft"

Why it failed

Existing jobs still had "active"

Rules rejected unknown status values

Result

Reads blocked

Writes rejected

Lesson

Changing enums requires backfilling all existing data.

❌ Attempt 5: Add composite indexes repeatedly

What we did

Created multiple Firestore indexes

Some already existed

Why it failed

Indexes were not the real issue

Rules blocked before index mattered

Result

Wasted time

Confusing signals (“index enabled but still broken”)

Lesson

Index errors often hide rule or schema problems.

❌ Attempt 6: Introduce useAuth hook

What we did

Replaced getAuth().currentUser with useAuth()

Imported @/lib/auth-context

Why it failed

auth-context file didn’t exist or wasn’t wired

Build errors:

useAuth is not defined

module not found

Result

Dashboard page crashed

App failed to compile

Lesson

Never introduce auth abstraction mid-debug.

❌ Attempt 7: Change firebase imports and paths

What we did

Mixed imports:

@/lib/firebase/db

@/lib/firebase

direct firebase/firestore

Why it failed

Paths didn’t exist

Aliases mismatched

Build errors

Result

Pages wouldn’t load

Hard failures

Lesson

During recovery, never change import structure.

❌ Attempt 8: Try Firebase Emulator mid-crisis

What we did

Installed emulators

Connected Firestore emulator

Tried auth emulator

Why it failed

App not wired for emulator auth

Credentials mismatched

Emulator data empty → more confusion

Result

Login errors

“Nothing exists” impression

Lesson

Emulators are for validation, not recovery.

❌ Attempt 9: Console-based auth inspection

What we did

Tried running:

import("firebase/auth")


in browser console

Why it failed

Browser console cannot resolve ESM imports

Firebase SDK already bundled

Result

More runtime errors

Misleading failures

Lesson

Never debug Firebase auth via browser import.

❌ Attempt 10: Fix UI before fixing data

What we did

Adjusted dashboard UI

Changed filters

Changed messages

Why it failed

Backend still broken

UI reflected backend failure correctly

Result

UI appeared “broken”

Real issue untouched

Lesson

UI is never the cause in data/rules failures.

❌ Attempt 11: Mixing production + emulator mental model

What we did

Looked for users/jobs in emulator UI

Compared with prod expectations

Why it failed

Emulator starts empty

Auth users are separate

Result

Assumed data loss

Extra panic

Lesson

Emulator data ≠ production data.

FINAL ROOT CAUSE (single sentence)

We tried to fix rules, data, queries, auth, and tooling at the same time, causing cascading failures instead of a controlled recovery.

What NOT to try again (summary list)

❌ Tighten rules before data validation
❌ Change schema without full migration
❌ Introduce auth abstractions mid-debug
❌ Add emulator after prod is broken
❌ Change imports during recovery
❌ Trust index errors blindly
❌ Debug auth in browser console
❌ Fix UI before backend
❌ Mix old + new status values

This is the complete failure log.
## F-2025-012 — Job posting wrote legacy fields

### What failed
Employer could not post jobs reliably.

### Root cause
Post Job flow was still writing:
- employerId
- status: "active"

These fields are no longer used by dashboard queries or filters.

### Lesson
Never allow legacy fields in new writes. New data must always be canonical.
## F-2025-013 — Assumed legacy jobs needed migration (but data was already compliant)

### What we assumed
Legacy job docs were the main reason employer jobs were missing / posting failed.

### What we found
Admin SDK dry-run scanned 11 job docs and found:
- 11/11 already compliant
- 0 changes required
- 0 failures

### Lesson
Validate data with a dry-run script before committing to migration. Missing jobs can be caused by Auth/Rules/config, not necessarily data shape.
# FAILURE_LOG.md

This is a record of incidents, breakages, and confusing behavior.
Goal: prevent repeating the same debugging paths.

Each entry format:
- Date+Time (IST)
- Symptom
- Root cause
- Fix
- Prevention rule

---

## 2025-12-17 (IST) — Apply button not changing to “Applied”
**Symptom**
- Candidate successfully applies (toast shown, applications created)
- Job page still shows “Apply” instead of “Applied”

**Likely root causes**
- UI uses static `<Link href="/apply/...">` instead of `<ApplyJobButton />`
- OR jobId mismatch: UI passes jobDhariId but applications store Firestore doc id
- OR ApplyJobButton only checks once and doesn’t refresh state after apply redirect

**Fix (planned)**
- Replace static Apply links with `<ApplyJobButton jobId={job.id} />` on jobs list + job detail
- Ensure public job list returns `id: doc.id`
- Add a focus-based refresh in ApplyJobButton (MVP-safe)

**Prevention rule**
- Any “action button with state” must be powered by a single component and never duplicated with raw links.
## 2025-12-17 06:10 (IST) — Apply felt like two-step / applied state confusing
**Symptom**
- Candidate sees “Ready to apply” screen, then applies, then returns to job page still showing “Apply”

**Root cause**
- /apply/[id] designed as manual confirmation page (2-step flow)
- Apply state not guaranteed to refresh on return to job page

**Fix**
- Converted /apply/[id] into auto-apply gate (apply immediately after auth+profile checks)
- Redirect back to job page after apply with toast

**Prevention rule**
- User actions should complete in a single click whenever possible (no confirmation pages unless required by policy).
## 2025-12-18 21:25 (IST) — Apply UX does not switch to “Applied” after applying

### Symptom
- After applying, user sees "Application submitted" and can navigate back to job.
- On `/jobs/[id]` page, Apply still shows as “Apply” instead of “Applied”.
- UX feels like two-step apply with duplicate CTAs.

### Attempt 1 — Add `?applied=1` on ApplyGate back navigation
**Change**
- Updated `src/app/apply/[id]/page.tsx` button:
  - `router.push(`/jobs/${jobId}?applied=1`)`

**Expected**
- Job detail page should detect flag and show “Applied”.

**Result**
- Navigation flag works, but UI still shows “Apply”.
- Root cause is downstream: `/jobs/[id]` UI (Apply button component) does not read `applied=1` or does not use the correct applied-state service.

### Conclusion
- ApplyGate is correct and read-only.
- Fix must be in `ApplyJobButton` and/or `src/app/jobs/[id]/page.tsx` where Apply UI is rendered.
## Employer dashboard renders blank (header only)

**Date observed:** 2025-12-19  
**Time (IST):** ~02:30–03:00 AM  
**Route:** /employer/dashboard  

### Symptom
Employer dashboard loads the top navigation bar but renders no page content.

### Last known good state
Dashboard rendered job cards and response counts correctly before recent auth-related refactors.

### Triggering change (most likely)
Introduction of stricter auth gating logic inside
`src/app/employer/dashboard/page.tsx`, relying on:

- `getAuth().currentUser` during initial render
- Early `return null` / `return` when user is not yet available
- Use of `user.uid` or `fetchedJobs` before variables were defined

### Root cause
Firebase authentication state is asynchronous.  
During initial render, `currentUser` is `null`, causing the page component to return no JSX.  
Because no re-render is triggered, the dashboard stays blank.

### What did NOT fix the issue
- Verifying `{children}` in `employer/layout.tsx`
- Replacing layout shells
- Checking route configuration

### Correct fix
Gate rendering with `onAuthStateChanged` and an `authReady` flag:
- Render loading state until auth resolves
- Render login prompt if not authenticated
- Only fetch jobs after `employerId` is available

### Prevention
Never return `null` from a page due to auth state.
Always render:
- Loading UI
- Error UI
- Empty state UI
## F-001 — Employer dashboard rendered blank

## F-001 — Employer dashboard rendered blank

**Date:** 2025-12-19  
**Status:** ✅ Resolved  
**Resolved in:** DEV-014  

### Symptom
Employer dashboard loaded header but showed no content area.

### Root Cause
Layout conflict:
- `EmployerLayout` / `AppShell` already owned the layout
- `employer/dashboard/page.tsx` also acted like a layout
- Nested layout containers caused content collapse

### Fix
- Removed layout responsibility from dashboard page
- Page now renders content only
- Layout ownership enforced at `EmployerLayout`

### Prevention Rule
Under App Router:
- Layouts own structure
- Pages render data + UI only
- Never nest `<main>` or layout shells in pages
## F-006 — Failure checker script crashed on unguarded status lines

**Date:** 2025-12-20  
**Status:** ✅ Resolved  
**Resolved in:** DEV-006

### Symptom
`npm run check:failures` crashed with TypeError.

### Root Cause
Script assumed `Status:` lines always appear after `## F-XXX` headers.

### Fix
Added guard to ignore status lines until a failure block exists.

### Prevention Rule
Always defensive-parse human-edited files.
[2025-12-21] Employer dashboard appeared blank

Cause:
- Page and layout both attempted to control main layout
- Nested <main> containers collapsed content

Fix:
- Moved layout responsibility exclusively to EmployerLayout
- Dashboard page renders content only

Status: RESOLVED
## FAIL-2025-12-20-03

### Severity
HIGH

### Status
RESOLVED

### Area
Candidate Entry / Profile Flow

### Symptom
After creating a candidate profile, user was redirected to /jobs instead of dashboard.

### Root Cause
Profile save handler had hardcoded:
router.push("/jobs")

This bypassed candidate dashboard flow.

### Fix
Redirect now follows:
- ?redirect param if present
- defaults to /candidate/dashboard

### Fixed In
DEV-2025-12-21-01

### Prevention Rule
Never hardcode post-save redirects.
Always respect redirect param or role dashboard.
## FAIL-2025-12-21-04

### Severity
MEDIUM

### Status
RESOLVED

### Area
Home Page (src/app/page.tsx)

### Symptom
Build failed with JSX syntax error: unexpected </Link> token.

### Root Cause
A closing </Link> tag existed after the component return block, without a matching opening <Link>.

### Fix
Removed stray </Link>. Ensured no JSX exists after component closing brace.

### Fixed In
DEV-2025-12-21-02

### Prevention Rule
Never leave JSX tags outside the component return tree.
## FAIL-2025-12-21-04

### Severity
MEDIUM

### Status
RESOLVED

### Area
Home Page (src/app/page.tsx)

### Symptom
Build failed with JSX syntax error: unexpected </Link> token.

### Root Cause
A closing </Link> tag existed after the component return block, without a matching opening <Link>.

### Fix
Removed stray </Link>. Ensured no JSX exists after component closing brace.

### Fixed In
DEV-2025-12-21-02

### Prevention Rule
Never leave JSX tags outside the component return tree.
## FAIL-2025-12-21-01 — Employer jobs broke due to schema + rules + query changes (multi-attempt recovery)

**Date:** 2025-12-21  
**Status:** ✅ Resolved  
**Fixed In:** DEV-2025-12-21-01

### Symptom
- Employer dashboard showed no jobs
- Posting a job failed with permission-denied errors
- Jobs existed in Firestore but did not render
- Multiple UI paths appeared broken or empty

### Root Cause
Multiple uncoordinated changes were applied:
- Firestore rules tightened before validating existing documents
- Job schema fields were renamed/assumed inconsistently
- Queries relied on fields not present in older job documents
- Server timestamp comparisons conflicted with strict rules

### Fix
- Standardized job ownership fields
- Relaxed rule conditions to be serverTimestamp-safe
- Aligned queries with actual stored schema
- Stabilized Firebase import and usage paths

### Prevention Rule
Never tighten Firestore rules or change schema/query fields without:
1) validating existing documents, and  
2) recording the change as a DEV entry before implementation.
FAIL-2025-12-21-02 — Pre-push build gate blocked push due to non-MVP broken routes/imports

Date: 2025-12-21 22:xx IST
Severity: High
Status: ⛔ Open
Fixed In: DEV-2025-12-21-02
In FAIL-2025-12-21-02, add under Symptom:
Build failed due to userPreferences.ts invalid import line
Build failed due to missing external dependency twilio imported by /send-test/route.ts
And under Fix:
Replaced userPreferences.ts with canonical imports from @/lib/firebase
Disabled /send-test route to remove twilio dependency from MVP build
## FAIL-2025-12-26-01 — Candidate profile save blocked by Firestore rules

**Date:** 2025-12-26  
**Status:** ✅ Resolved  
**Fixed In:** DEV-2025-12-26-02

### Symptom
Candidate Profile page shows: “FirebaseError: Missing or insufficient permissions” when trying to save/edit profile.

### Root Cause
Firestore rules did not include permissions for `candidateProfiles/{uid}`.

### Fix
Added a rule allowing an authenticated user to read/create/update only their own profile document.

### Prevention Rule
Whenever we add a new collection (or start writing to it), we must add Firestore rules for it before shipping UI.

**Status:** ✅ Resolved  
**Fixed In:** DEV-2025-12-26-02

### Symptom
Clicking "Candidate Login / Create Profile" or "Employer Login" caused the app to hang.
Browser showed “Wait or Reload page”.

### Root Cause
Recent changes to login page structure caused a client-side render freeze.

### Fix
Reverted login page to last known working version.

### Prevention Rule
Never refactor auth/login UX and routing together.
Always validate navigation before UI polish.
