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
