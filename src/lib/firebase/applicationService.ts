// src/lib/firebase/applicationService.ts

import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  Timestamp,
} from "firebase/firestore";

/**
 * =========================
 * Types
 * =========================
 */

export type JobSummaryForApplication = {
  id: string;
  title: string;
  companyName?: string;
  location?: string;
  category?: string;
};

export type JobApplicationDoc = {
  jobId: string;
  userId: string;
  status: "applied";
  appliedAt: Timestamp | ReturnType<typeof serverTimestamp>;
};

/**
 * =========================
 * ✅ CANONICAL APPLY (SINGLE WRITER)
 * =========================
 * - Deterministic ID: `${userId}_${jobId}`
 * - Idempotent (no duplicates possible)
 * - Minimal schema (rule-safe)
 * - This is the ONLY real writer
 */
export async function applyToJob(params: {
  jobId: string;
  userId: string;
}) {
  const { jobId, userId } = params;

  if (!jobId) throw new Error("JOB_ID_REQUIRED");
  if (!userId) throw new Error("USER_ID_REQUIRED");

  const current = auth.currentUser;
  if (!current) throw new Error("AUTH_REQUIRED");
  if (current.uid !== userId) throw new Error("USER_MISMATCH");

  const applicationId = `${userId}_${jobId}`;

  const payload: JobApplicationDoc = {
    userId,
    jobId,
    status: "applied",
    appliedAt: serverTimestamp(),
  };

  await setDoc(
    doc(db, "applications", applicationId),
    payload,
    { merge: false } // hard overwrite, deterministic
  );

  return { applicationId };
}

/**
 * =========================
 * ⚠️ TEMP LEGACY WRAPPER
 * =========================
 * - DO NOT write here
 * - Exists only to avoid breaking old imports
 * - Safe to delete once fully migrated
 */
export async function createJobApplication(
  userId: string,
  job: JobSummaryForApplication
) {
  if (!userId) throw new Error("Missing userId");
  if (!job?.id) throw new Error("Missing job.id");

  await applyToJob({ userId, jobId: job.id });
}

/**
 * =========================
 * Fetch Applied Job IDs
 * =========================
 */
export async function getUserAppliedJobIds(
  userId: string
): Promise<Set<string>> {
  const ids = new Set<string>();
  if (!userId) return ids;

  const appsRef = collection(db, "applications");

  const q = query(appsRef, where("userId", "==", userId));
  const snap = await getDocs(q);

  snap.forEach((d) => {
    const data = d.data() as any;
    if (data?.jobId) ids.add(String(data.jobId));
  });

  return ids;
}
