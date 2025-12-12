# JobDhari Architecture (Locked)

## Firebase
- Initialization happens ONLY in:
  src/lib/firebase/firebaseConfig.ts
- Auth exported from:
  src/lib/firebase/auth.ts
- Firestore exported from:
  src/lib/firebase/db.ts

❌ No page or component initializes Firebase directly.

## User Model (Single Source of Truth)
- One Firebase user
- Role stored in Firestore
- Roles:
  - candidate
  - employer
  - recruiter (future)

## Routing Rules
- /jobs → public
- /candidate/* → candidate only
- /employer/* → employer only
- /admin/* → admin only

## Layout Rules
- Root layout: NO sidebar
- Role layouts control sidebar rendering
