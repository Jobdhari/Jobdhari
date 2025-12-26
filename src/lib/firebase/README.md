# Firebase Folder Rules
- All Firestore reads/writes live in service files here.
- UI pages/components should call these services, not write raw queries everywhere.
- Any new collection requires Firestore security rules update.
