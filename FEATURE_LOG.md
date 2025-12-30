# JobDhari Feature Log

This document tracks product features, their status, and the commits that introduced or modified them.

---

## F-001 — Candidate Login (Email + Google)

**Status:** ✅ Stable  
**Area:** Candidate Auth  
**Primary Route:** /login?role=candidate

### Description
Candidate authentication using:
- Email + password
- Google sign-in
- Forgot password
- Create account entry

### Commits
- fix(login): stabilize and finalize candidate login UI  
  → commit: <PASTE_COMMIT_HASH_HERE>

### Notes
- UI locked as of DEV-2025-12-30-01
- Further changes must be behavior-only (errors, redirects)

---

## F-002 — Candidate Signup

**Status:** 🟡 In Progress  
**Area:** Candidate Auth  
**Primary Route:** /signup/candidate

### Description
Account creation for candidates using email/password or Google.

### Commits
- (pending)

---

## F-003 — Candidate Profile (View + Edit)

**Status:** 🟡 In Progress  
**Area:** Candidate Profile  
**Primary Routes:**
- /candidate/profile
- /candidate/profile/edit

### Description
Candidate can view and edit personal details (name, phone, email).

### Commits
- (pending)

---

## F-004 — Candidate Dashboard (My Applications)

**Status:** 🟡 In Progress  
**Area:** Candidate Dashboard  
**Primary Route:** /candidate/dashboard

### Description
Shows jobs applied to by the candidate.

### Commits
- feat(candidate): my applications dashboard v1  
  → commit: 7f2b1e0

---

## F-005 — Employer Job Posting

**Status:** ✅ Stable  
**Area:** Employer  
**Primary Route:** /employer/post-job

### Commits
- feat(employer): add EmployerGate + job posting  
  → commit: 9fb6679
