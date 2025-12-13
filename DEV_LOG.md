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
