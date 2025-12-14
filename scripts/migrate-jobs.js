/* scripts/migratejobs.js */

const admin = require("firebase-admin");
const path = require("path");

// Load service account
const serviceAccount = require(path.join(
  __dirname,
  "..",
  "serviceAccountKey.json"
));

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateJobs() {
  const snap = await db.collection("jobs").get();

  console.log(`Found ${snap.size} job(s)`);

  for (const doc of snap.docs) {
    const data = doc.data();

    const ownerUid =
      data.createdByUid ||
      data.postedByUid ||
      data.employerUid ||
      "REPLACE_WITH_REAL_UID";

    const normalizedStatus =
      data.status === "closed" || data.status === "draft"
        ? data.status
        : "open";

    const updatePayload = {
      createdByUid: ownerUid,
      postedByUid: ownerUid,
      status: normalizedStatus,
      isPublished: normalizedStatus === "open",
      createdAt: data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await doc.ref.set(updatePayload, { merge: true });

    console.log(`✔ Migrated job ${doc.id}`);
  }

  console.log("✅ Job migration complete");
}

migrateJobs().catch(console.error);
