/**
 * @feature Job Application
 * @responsibility Application read/write logic (duplicate-check + persistence)
 * @files src/lib/firebase/applicationService.ts
 */

// src/lib/firebase/applicationService.ts

import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

export type ApplicationStatus = "applied";

/* ======================================================
   READ: Check if user already applied to a job
====================================================== */
export async function hasAppliedToJob(params: {
  jobId: string;
  userId: string;
}) {
  const { jobId, userId } = params;

  if (!jobId) throw new Error("Missing jobId");
  if (!userId) throw new Error("Missing userId");

  const q = query(
    collection(db, "applications"),
    where("jobId", "==", jobId),
    where("userId", "==", userId),
    limit(1)
  );

  const snap = await getDocs(q);
  return !snap.empty;
}

/* ======================================================
   WRITE: Apply to job (idempotent, MVP-safe)
====================================================== */
export async function applyToJob(params: {
  jobId: string;
  userId: string;
}) {
  const { jobId, userId } = params;

  const already = await hasAppliedToJob({ jobId, userId });
  if (already) {
    return { ok: true as const, alreadyApplied: true as const };
  }

  await addDoc(collection(db, "applications"), {
    jobId,
    userId,
    status: "applied" as ApplicationStatus,
    appliedAt: serverTimestamp(),
  });

  return { ok: true as const, alreadyApplied: false as const };
}

/* ======================================================
   READ: Get all jobIds a user has applied to
   (Used by ApplyJobButton everywhere)
====================================================== */
export async function getUserAppliedJobIds(userId: string) {
  if (!userId) return new Set<string>();

  const q = query(
    collection(db, "applications"),
    where("userId", "==", userId)
  );

  const snap = await getDocs(q);

  const set = new Set<string>();
  for (const d of snap.docs) {
    const data = d.data();
    if (data?.jobId) set.add(String(data.jobId));
  }
  return set;
}

/* ======================================================
   READ: Employer — list applications for a job
====================================================== */
export type JobApplication = {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus | string;
  appliedAt?: any;
};

export async function listApplicationsForJob(jobId: string) {
  if (!jobId) return [];

  const q = query(
    collection(db, "applications"),
    where("jobId", "==", jobId),
    orderBy("appliedAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      jobId: String(data.jobId),
      userId: String(data.userId),
      status: data.status,
      appliedAt: data.appliedAt,
    } as JobApplication;
  });
}
