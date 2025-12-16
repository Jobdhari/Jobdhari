/**
 * JobDhari — One-time Jobs Migration (DRY RUN)
 * -------------------------------------------
 * DO NOT MODIFY LOGIC WITHOUT UPDATING SPEC
 * Mode: DRY RUN ONLY
 */

// ---- Load env vars FIRST ----
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env.local"),
});

// ---- Debug (temporary) ----
console.log(
  "Loaded FIREBASE_ADMIN_KEY_PATH =",
  process.env.FIREBASE_ADMIN_KEY_PATH
);

// ---- Imports ----
const admin = require("firebase-admin");

// ---- Safety ----
const DRY_RUN = true; // 🔒 MUST STAY TRUE FOR FIRST RUN

// ---- Validate env ----
const keyPath = process.env.FIREBASE_ADMIN_KEY_PATH;
if (!keyPath) {
  throw new Error("FIREBASE_ADMIN_KEY_PATH not set");
}

// ---- Init Admin SDK ----
admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(keyPath))),
});

const db = admin.firestore();

// ---- Helpers ----
function normalizeStatus(status) {
  const map = {
    active: "open",
    approved: "open",
    open: "open",
    closed: "closed",
    draft: "draft",
  };
  return map[status];
}

// ---- Migration ----
async function migrateJobs() {
  const snapshot = await db.collection("jobs").get();

  let total = 0;
  let compliant = 0;
  let toChange = 0;
  let failures = [];

  console.log(`\nScanning ${snapshot.size} job documents...\n`);

  for (const doc of snapshot.docs) {
    total++;
    const data = doc.data();
    const issues = [];
    const updates = {};

    // 1️⃣ Ownership
    const owner = data.createdByUid || data.employerId || null;
    if (!owner) {
      issues.push("Missing ownership (createdByUid/employerId)");
    } else {
      if (!data.createdByUid) updates.createdByUid = owner;
      if (!data.postedByUid) updates.postedByUid = owner;
    }

    // 2️⃣ Status
    const normalizedStatus = normalizeStatus(data.status);
    if (!normalizedStatus) {
      issues.push(`Unknown status: ${data.status}`);
    } else if (data.status !== normalizedStatus) {
      updates.status = normalizedStatus;
    }

    // 3️⃣ isPublished
    if (data.isPublished === undefined) {
      updates.isPublished = normalizedStatus === "open";
    }

    // 4️⃣ Timestamps
    if (!data.createdAt && data.updatedAt) {
      updates.createdAt = data.updatedAt;
    }
    if (!data.createdAt && !data.updatedAt) {
      issues.push("Missing both createdAt and updatedAt");
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // ---- Result ----
    if (issues.length) {
      failures.push({ id: doc.id, issues });
      continue;
    }

    if (Object.keys(updates).length === 1) {
      compliant++;
    } else {
      toChange++;
      console.log(`Would update job ${doc.id}:`, updates);
      if (!DRY_RUN) {
        await doc.ref.update(updates);
      }
    }
  }

  // ---- Summary ----
  console.log("\n=== MIGRATION SUMMARY ===");
  console.log("Total jobs:", total);
  console.log("Already compliant:", compliant);
  console.log("Would change:", toChange);
  console.log("Failures:", failures.length);

  if (failures.length) {
    console.log("\n❌ FAILURES (migration aborted):");
    failures.forEach(f =>
      console.log(`- ${f.id}: ${f.issues.join(", ")}`)
    );
    console.log("\nCAN_PROCEED = false");
  } else {
    console.log("\n✅ No failures detected");
    console.log("CAN_PROCEED = true");
  }
}

// ---- Run ----
migrateJobs()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Migration error:", err);
    process.exit(1);
  });
