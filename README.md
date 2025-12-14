This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# JobDhari 🚀

JobDhari is a hyperlocal, mobile-first job platform focused on India’s Tier-2 and Tier-3 cities.

The goal is to make hiring and job discovery **simple, fast, and accessible**, especially for employers and candidates who find existing platforms too complex.

---

## 🧠 What Problem Are We Solving?

Current job portals:
- Are cluttered and overwhelming
- Are built for metro cities
- Assume technical literacy
- Have complex ATS-style workflows

JobDhari focuses on:
- Simple job posting
- Fast applications
- Clear employer dashboards
- Local hiring use cases

---

## 👥 User Roles

### Candidate
- Browse jobs
- Apply to jobs
- Maintain a basic profile
- Track applications

### Employer (Current Focus)
- Post jobs
- View jobs posted
- View responses
- Manage job status

### Recruiter
- Post jobs on behalf of companies
- Manage multiple employers (planned)

### Admin
- Platform monitoring
- Moderation (future)

---

## 🧱 Tech Stack

- **Frontend:** Next.js 14 (App Router, TypeScript)
- **Backend:** Firebase
  - Authentication
  - Firestore
  - Storage (planned)
- **UI:** Tailwind CSS, shadcn/ui
- **Hosting:** Vercel (planned)
- **Version Control:** Git + GitHub

---

## 📂 Project Structure (Simplified)

```text
src/
 ├─ app/                 # Routes (App Router)
 ├─ components/          # Reusable UI components
 ├─ lib/
 │   └─ firebase/        # Firebase services (ALL DB writes go here)
 ├─ styles/
 └─ scripts/

DEV_LOG.md               # What changed & why
PROJECT.md               # Product scope & decisions
ARCHITECTURE.md          # Technical architecture
README.md                # You are here
Important Engineering Rules

Pages never write directly to Firestore

All writes go through service files in src/lib/firebase/

Jobs MUST include both ownership fields

createdByUid
postedByUid


Layouts are centralized

TopNav → global navigation

AppShell → dashboards (TopNav + Sidebar)

MVP-first development

No AI

No resume database (Resdex-style)

No billing or subscriptions yet

✅ Current Status (As of Now)
Completed

Employer authentication

Employer dashboard (Jobs & Responses)

Post job flow

Firestore job persistence

Git & GitHub setup

Layout cleanup (TopNav + Sidebar)

In Progress

Employer dashboard UI refinements

Filters behavior cleanup

Candidate dashboard planning

Not Started

Candidate profile

Applications flow (candidate → employer)

Recruiter flows

Admin tools

🗺️ Roadmap (High Level)
Sprint 1 (Current)

Stabilize employer dashboard

Fix UI duplication issues

Finalize job data consistency

Sprint 2

Candidate login & profile

Apply to job flow

My Applications page

Sprint 3

Recruiter dashboard

Recruiter job posting

Admin overview

📜 Documentation Files

We actively maintain:

DEV_LOG.md → daily development history

PROJECT.md → product scope & decisions

ARCHITECTURE.md → system design & rules

These files are considered source of truth.

⚠️ Legal & Design Note

UI inspiration may reference platforms like Naukri for usability patterns

No code or design is copied

Branding, naming, and data models are original

🤝 Contributing (Internal)

If you are new:

Read this README

Read PROJECT.md

Read ARCHITECTURE.md

Check DEV_LOG.md for recent changes

🧩 Philosophy

Build simple.
Ship stable.
Scale later.