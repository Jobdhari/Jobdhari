This is a post-mortem log of everything we tried to “fix” employer jobs, why each attempt failed or made things worse, so you do not repeat these paths again.

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