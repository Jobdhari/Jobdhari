## Guardrails Checklist
- [ ] New collection created? -> Firestore rules updated
- [ ] New page uses hooks? -> "use client" present
- [ ] New import path? -> file name matches exactly
- [ ] Any job listing? -> no per-job reads
- [ ] Profile changes? -> only /profile is truth, quick-profile augments
# JobDhari Architecture Guardrails (Next.js 14 + Firebase)

## 0) Stack (Locked)
- Next.js 14 (App Router)
- Firebase Auth + Firestore
- TailwindCSS + shadcn/ui

---

## 1) Project Structure (Do not break)
- Routes: `src/app/<route>/page.tsx`
- Layouts: `src/app/<route>/layout.tsx`
- UI components: `src/components/ui/*`
- Feature components: `src/components/<feature>/*`
- Firebase services only: `src/lib/firebase/*`

✅ Rule: Firestore queries must live in `src/lib/firebase/*Service.ts` files.  
❌ Don’t scatter Firestore queries across pages/components.

---

## 2) Client vs Server Components (Biggest break cause)
Add `"use client"` ONLY when file uses:
- React hooks: `useState/useEffect`
- Next hooks: `useRouter/useSearchParams`
- Firebase auth hooks: `useAuthState/onAuthStateChanged`

✅ Rule: If a page needs auth state or browser Firestore calls → it must be a client component.  
❌ Don’t call hooks in a file without `"use client"`.

---

## 3) Import Path Consistency (Stops “Module not found” loops)
✅ Rule: File name and import path must match EXACTLY (case-sensitive).
Example:
- File: `src/components/jobs/ApplyJobButton.tsx`
- Import: `@/components/jobs/ApplyJobButton`

❌ Don’t rename files without updating all imports.

---

## 4) Firestore Reads/Writes (Performance rules)
### Reads
- Jobs list: 1 query to `jobs`
- Applied job ids: 1 query to `applications` where userId == uid
- My jobs: 1 query to `applications` where userId == uid

### Writes
- Apply: 1 write only, idempotent doc id: `${uid}_${jobId}`
- Use `setDoc()` so applying twice does not create duplicates.

✅ Rule: Store job summary inside application doc to avoid extra job reads.  
❌ No “N+1 reads” (loop jobs -> fetch each job doc).

---

## 5) Firestore Security Rules (Most “Missing permissions” errors)
If you see: `Missing or insufficient permissions`
It usually means:
- Rules don’t allow the read/write for this collection
- Wrong collection name
- Doc fields don’t match rule checks

✅ Rule: Every new collection requires rules update at the same time.

---

## 6) Profile Truth (Avoid user confusion)
We have:
- Full Profile: `/profile` (source of truth)
- Quick Profile: `/quick-profile` (onboarding/preferences helper)

✅ Rule: `/profile` is source of truth.  
✅ Quick profile only merges/augments preferences.  
❌ Never keep conflicting profile data in two places.

---

## 7) Candidate Apply Flow (must be consistent)
1) Browse jobs
2) Click apply
3) If not logged in -> login (return to jobs)
4) If profile missing -> quick-profile (return to jobs)
5) Apply (1 write)
6) Redirect -> /my-jobs

✅ Rule: redirects must be predictable:
- Apply success -> /my-jobs
- Not logged in -> /login?next=/jobs
- Profile missing -> /quick-profile?next=/jobs

---

## 8) MVP Safety Rule (No big refactors)
✅ Rule: 1 change = 1 commit.  
❌ Avoid big renames/moves and multi-page rewrites.

---

## 9) Matching Engine Guardrails (MVP)
- Start as pure function: `matchScore(candidate, job) -> number`
- First version runs client-side using already-loaded data
- No extra reads per job

✅ Rule: matching must not introduce additional Firestore reads per card.

# JobDhari — Architecture Guardrails
(Next.js 14 + Firebase)

This document exists to prevent regressions, confusion, and repeated failures.
If something breaks, check here first.

---

## 0) Stack (LOCKED)
- Next.js 14 (App Router)
- Firebase Auth + Firestore
- TailwindCSS + shadcn/ui

❌ Do not introduce new frameworks or state managers in MVP.

---

## 1) Project Structure (DO NOT BREAK)

- Routes: `src/app/<route>/page.tsx`
- Layouts: `src/app/<route>/layout.tsx`
- UI primitives: `src/components/ui/*`
- Feature components: `src/components/<feature>/*`
- Firebase services ONLY: `src/lib/firebase/*Service.ts`

✅ Firestore reads/writes must live in service files  
❌ Do not query Firestore directly in pages or components

Why: Prevents scattered logic and rule mismatches.

---

## 2) Client vs Server Components (MOST COMMON FAILURE)

Add `"use client"` ONLY if file uses:
- React hooks (`useState`, `useEffect`)
- Next hooks (`useRouter`, `useSearchParams`)
- Firebase auth listeners

✅ If hooks exist → `"use client"` must exist  
❌ Never use hooks in `page.tsx` unless it is explicitly client

Why: Prevents infinite render / freeze bugs.

---

## 3) Routing Safety Rules

- `page.tsx` = render only
- Logic lives in `*Client.tsx` components

❌ Do not mix routing + auth + UI refactors together  
✅ Refactor one concern per commit

Why: Login/dashboard freezes happened due to mixed changes.

---

## 4) Import Path Discipline

✅ Import paths must match file names exactly (case-sensitive)

Example:
File: src/components/jobs/ApplyJobButton.tsx
Import: @/components/jobs/ApplyJobButton


❌ Renaming files without updating imports is forbidden

Why: Prevents “module not found” loops.

---

## 5) Firestore Read / Write Rules

### Reads
- Jobs list: 1 query
- Applications by user: 1 query
- Employer jobs: 1 query

❌ No per-job reads inside loops (N+1)

### Writes
- Apply: single idempotent write (`${uid}_${jobId}`)
- Use `setDoc`, not `addDoc`

Why: Performance + cost control.

---

## 6) Firestore Security Rules

If you see:
`Missing or insufficient permissions`

Check:
- Collection name
- Required fields
- Rule ownership logic

✅ Any new collection requires rules update at same time  
❌ Never add collections without rules

---

## 7) Candidate Profile Truth

- `/profile` → single source of truth
- `/quick-profile` → onboarding helper only

❌ Never store conflicting profile data in two places  
✅ Quick profile only augments main profile

---

## 8) Candidate Apply Flow (LOCKED)

1. Browse jobs
2. Click Apply
3. If not logged in → `/login`
4. If profile missing → `/quick-profile`
5. Apply (1 write)
6. Redirect → `/my-jobs`

Redirect rules:
- Not logged in → `/login?next=/jobs`
- Profile missing → `/quick-profile?next=/jobs`
- Apply success → `/my-jobs`

---

## 9) MVP Safety Rules

✅ 1 logical change = 1 commit  
❌ Avoid large refactors during feature work

Why: Prevents cascading failures.

---

## 10) Matching Engine (MVP Guardrail)

- Start as pure function:
  `matchScore(candidate, job) -> number`
- Run client-side
- Use already-loaded data only

❌ No extra Firestore reads per job card