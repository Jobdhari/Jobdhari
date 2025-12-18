# JobDhari – Project State

## 🔒 Locked Decisions (DO NOT CHANGE)
- Framework: Next.js 14 (App Router)
- Auth: Firebase Auth
- Database: Firestore
- Styling: TailwindCSS + shadcn/ui
- Firebase structure:
  - src/lib/firebase/firebaseConfig.ts
  - src/lib/firebase/auth.ts
  - src/lib/firebase/db.ts

## ✅ Completed
- Candidate job browsing
- Employer job posting (writes to Firestore)
- Firebase modular setup (locked)

## ⚠️ Known Issues (Active)
- Employer dashboard does not show posted jobs (query mismatch)
- Role handling is inconsistent (candidate/employer/recruiter)
- Sidebar/dashboard layout duplication

## 🧭 Current Focus
1. Fix employer dashboard job visibility
2. Lock role model (one user, multiple roles)
3. Clean dashboard routing
4. Admin MVP

## 🚫 Explicitly Out of Scope (for now)
- Payments
- Notifications
- AI matching
Firebase single source: we will use ONLY one import path everywhere:

import { auth, db, storage } from "@/lib/firebase";

No more @/lib/firebase or @/lib/firebase unless we intentionally choose that structure. Right now, you have both patterns mixed — that’s what’s breaking you.
Add/confirm sections:

Roles: Candidate, Employer, Recruiter, Admin (what’s in/out of MVP)

Employer MVP features complete so far: Post job, jobs list, dashboard skeleton

Candidate MVP not complete yet (keep as “planned”)

Non-goals: Naukri-like Resdex / advanced search / heavy ATS features are out of MVP
# JobDhari — Product Overview

## What is JobDhari?
JobDhari is a mobile-first, bilingual, hyperlocal job platform focused on India’s Tier-2 and Tier-3 cities.

It connects:
- Candidates (job seekers)
- Employers (companies)
- Recruiters (consultants working for multiple companies)

The product emphasizes:
- Simple flows
- Local hiring
- WhatsApp-style usability
- Fast job posting and application

---

## User Roles

### Candidate
- Browse jobs
- Apply to jobs
- View applied jobs
- Maintain basic profile

### Employer (MVP Focus)
- Post jobs
- View posted jobs
- View job responses
- Manage job status (open / closed)

### Recruiter
- Similar to employer but may manage jobs for multiple companies
- Partial implementation (not finalized)

### Admin
- Platform overview
- Job moderation (future)

---

## MVP Scope (Current)

### Employer MVP — IN PROGRESS
- Employer login
- Employer dashboard (Jobs & Responses)
- Post a job
- View own jobs
- Firestore-backed job storage

### Candidate MVP — PLANNED
- Candidate login
- Candidate profile creation
- Browse jobs
- Apply to jobs
- My Applications page

### Explicitly OUT of MVP
- Resume database (Resdex-style)
- Advanced AI matching
- Paid plans & billing
- Chat / messaging
- Heavy ATS workflows

---

## Design Principles
- Inspired by platforms like Naukri for structure only
- No design or code copied
- Simple, clean, scalable UI
## SPRINT 1 — Stabilization (NOW)

- [x] Fix duplicate Filters sidebar on Employer Dashboard
- [x] Align job status filters with backend schema ("open", "closed", "draft")
- [x] Fix dashboard layout spacing issues
- [ ] Ensure no UI duplication across employer pages
- [x] Persist Employer Dashboard filters in URL (status + search)
- [x] Fix dashboard status filters/counts when legacy job statuses exist (normalize active/approved → open)
- [x] Employer can edit a job (basic fields) from dashboard
- [x] Show real application counts per job on Employer Dashboard
- [x] Add MVP Firestore security rules for jobs + applications (owner-only writes, safe public reads)
### Employer MVP — Status
✅ Employer login  
✅ Employer dashboard (Jobs & Responses)  
✅ Job posting  
✅ Job status management (open / closed / draft)  
⚠ Counters secured only for MVP (to be hardened before beta)
- Posting a job publishes it immediately in MVP (no manual publish step).
### Publishing rules (MVP decision)
- Posting a job publishes it immediately:
  - status = "open"
  - isPublished = true
- Drafts exist only as an explicit employer action ("Move to Draft").
### Candidate MVP — Status
✅ Public jobs listing (/jobs)
✅ Job detail page (/jobs/[id])
✅ Apply gate foundation (/apply/[id]) — redirects to login/profile
⏳ Candidate profile form + application submission (next)
✅ Public Jobs page supports search params from homepage hero: q + location (+ experience reserved)
### Candidate MVP — Status
- [x] Jobs list + job detail page
- [x] Apply route exists (`/apply/[id]`)
- [ ] Apply UX polish: block re-apply and show “Applied” state consistently (IN PROGRESS)
- [ ] Candidate profile gating + post-profile continue apply (IN PROGRESS)
### Candidate MVP — Status
- [x] Candidate can apply (application created in Firestore)
- [ ] Apply button state reflects “Applied” consistently across jobs list + job detail (IN PROGRESS)
- [ ] Candidate dashboard (Applied jobs, profile, viewed status) (PLANNED)
### Codebase Maintainability (MVP Process)
- We maintain an auto-generated `docs/FEATURE_MAP.md` to track which features exist and which files implement them.
- Regeneration command: `npm run docs:featuremap`
- Rule: all core flows (Jobs, Apply, Employer Dashboard, Candidate Profile) must include `@feature` annotations in the main page/service files.
