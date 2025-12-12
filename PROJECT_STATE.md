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

import { auth, db, storage } from "@/lib/firebase/auth";

No more @/lib/firebase/auth or @/lib/firebase/db unless we intentionally choose that structure. Right now, you have both patterns mixed — that’s what’s breaking you.