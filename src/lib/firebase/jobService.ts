// src/lib/firebase/jobService.ts

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type Job = {
  title: string;
  companyName?: string;
  location?: string;
  city?: string;
  state?: string;
  pincode?: string;
  category?: string;
  employmentType?: string; // full-time, contract, etc.
  workType?: string; // remote / onsite / hybrid
  description?: string;
  salaryMin?: number;
  salaryMax?: number;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  isPublished?: boolean;
  postedByUid?: string;
};

export type JobWithId = Job & {
  id: string;
};

// ─────────────────────────────────────────────────────────────
// Job CRUD (ONLY JOBS — NO APPLICATIONS HERE)
// ─────────────────────────────────────────────────────────────

/**
 * Create a new job (employer)
 */
export async function createJob(data: Job) {
  const jobsRef = collection(db, "jobs");

  const payload: Job = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isPublished: data.isPublished ?? true,
  };

  const docRef = await addDoc(jobsRef, payload);
  return docRef.id;
}

/**
 * Get job by id
 */
export async function getJobById(jobId: string): Promise<JobWithId | null> {
  if (!jobId) return null;

  const jobRef = doc(db, "jobs", jobId);
  const snap = await getDoc(jobRef);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as Job),
  };
}

/**
 * Get all published jobs (public / jobs pages)
 */
export async function getAllPublishedJobs(): Promise<JobWithId[]> {
  const jobsRef = collection(db, "jobs");

  const q = query(
    jobsRef,
    where("isPublished", "==", true),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Job),
  }));
}

/**
 * Get jobs posted by employer
 */
export async function getEmployerJobs(
  employerUid: string
): Promise<JobWithId[]> {
  if (!employerUid) return [];

  const jobsRef = collection(db, "jobs");
  const q = query(
    jobsRef,
    where("postedByUid", "==", employerUid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Job),
  }));
}

/**
 * Update job
 */
export async function updateJob(jobId: string, partial: Partial<Job>) {
  const jobRef = doc(db, "jobs", jobId);

  await updateDoc(jobRef, {
    ...partial,
    updatedAt: Timestamp.now(),
  });
}
