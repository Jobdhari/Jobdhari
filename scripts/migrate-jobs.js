/**
 * ONE-TIME FIRESTORE MIGRATION SCRIPT FOR JOBDHARI
 *
 * Adds missing fields to all jobs without overwriting existing values.
 * Safe to run. After running once, delete this file.
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// TODO: Replace with your firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// FINAL SCHEMA DEFAULTS
const DEFAULTS = {
  topSkills: [],
  domainSkills: [],
  mustHaveExperience: [],
  experienceMin: 0,
  experienceMax: 0,
  salaryMin: 0,
  salaryMax: 0,
  jobType: "full-time",
  workMode: "onsite",
  pinCode: "",
  city: "",
  views: 0,
  applicationsCount: 0,
  status: "Open",
};

async function migrateJobs() {
  console.log("🚀 Starting job migration...");

  const jobsSnap = await getDocs(collection(db, "jobs"));
  console.log(`Found ${jobsSnap.size} job documents.`);

  for (const jobDoc of jobsSnap.docs) {
    const data = jobDoc.data();
    const updates = {};

    // Only add fields that are missing
    Object.entries(DEFAULTS).forEach(([field, defaultValue]) => {
      if (data[field] === undefined) {
        updates[field] = defaultValue;
      }
    });

    // Set updatedAt if missing
    if (!data.updatedAt) {
      updates.updatedAt = serverTimestamp();
    }

    // If no description, make an empty description
    if (data.description === undefined) {
      updates.description = "";
    }

    // If no companyName, fall back to hiringFor or "Company"
    if (!data.companyName) {
      updates.companyName = data.hiringFor || "Company";
    }

    // If nothing to update, skip
    if (Object.keys(updates).length === 0) {
      console.log(`✔ Job ${jobDoc.id} already up to date`);
      continue;
    }

    // Otherwise update
    await updateDoc(doc(db, "jobs", jobDoc.id), updates);
    console.log(`🔧 Updated job ${jobDoc.id}:`, updates);
  }

  console.log("🎉 Migration complete!");
}

migrateJobs().catch((err) => console.error("Migration failed", err));
