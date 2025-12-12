// src/lib/firestoreQueries.ts
// ====================================================
// This file contains Firestore query helpers for JobDhari.
// ====================================================

import { db } from "./firebase";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ====================================================
// ✅ 1. Function: Get all public & open jobs (for everyone)
// ====================================================
export async function getPublicJobs() {
  try {
    const q = query(
      collection(db, "jobs"),
      where("isPublic", "==", true),
      where("status", "==", "open"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const snap = await getDocs(q);
    const jobs = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return jobs;
  } catch (error) {
    console.error("Error loading public jobs:", error);
    return [];
  }
}

// ====================================================
// ✅ 2. Function: Get jobs created by the logged-in employer
// ====================================================
export async function getEmployerJobs() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    // If no user is logged in, return empty list
    if (!user) {
      console.warn("No employer logged in");
      return [];
    }

    // Query only the jobs where employerId matches the current user
    const q = query(
      collection(db, "jobs"),
      where("employerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    const jobs = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return jobs;
  } catch (error) {
    console.error("Error loading employer jobs:", error);
    return [];
  }
}

// ====================================================
// End of file
// ====================================================
