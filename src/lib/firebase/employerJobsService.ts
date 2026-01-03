/**
 * @feature Employer Jobs Service
 * @responsibility Employer job CRUD (create, list, publish)
 * @routes /employer/dashboard, /employer/post-job
 * @files src/lib/firebase/employerJobsService.ts
 */

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  runTransaction,
} from "firebase/firestore";

export type JobStatus = "open" | "closed" | "draft";

export interface EmployerJob {
  id: string;
  jobDhariId?: string; // optional for legacy jobs
  jobNumber?: number;  // optional for legacy jobs
  title: string;
  companyName: string;
  location: string;
  category: string;
  description?: string;
  status: JobStatus | string;
  isPublished: boolean;
  createdByUid: string;
  postedByUid: string;
  createdAt?: any;
  updatedAt?: any;
  lastBumpedAt?: any;
}

/**
 * ✅ Employer dashboard job list (owner-only)
 * Stable ordering — no composite index required
 */
export async function listEmployerJobs(params: { employerUid: string }) {
  const { employerUid } = params;
  if (!employerUid) return [];

  const q = query(
    collection(db, "jobs"),
    where("postedByUid", "==", employerUid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      jobDhariId: data.jobDhariId,
      jobNumber: data.jobNumber,
      title: data.title,
      companyName: data.companyName,
      location: data.location,
      category: data.category,
      description: data.description,
      status: data.status,
      isPublished: data.isPublished,
      createdByUid: data.createdByUid,
      postedByUid: data.postedByUid,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastBumpedAt: data.lastBumpedAt,
    } as EmployerJob;
  });
}

/**
 * ✅ Job creation (canonical, transactional, production-safe)
 * Uses /counters/jobs
 * This is the ONLY JobDhari ID generator
 */
export async function createEmployerJob(input: {
  employerId: string;
  title: string;
  companyName: string;
  location: string;
  category: string;
  description?: string;

  status?: JobStatus;
  isPublished?: boolean;
}) {
  if (!input.employerId) throw new Error("Missing employerId");

  // minimal validation (MVP-safe)
  const title = (input.title || "").trim();
  const companyName = (input.companyName || "").trim();
  const location = (input.location || "").trim();
  const category = (input.category || "").trim();
  const description = (input.description || "").trim();

  if (!title) throw new Error("Missing title");
  if (!companyName) throw new Error("Missing companyName");
  if (!location) throw new Error("Missing location");
  if (!category) throw new Error("Missing category");

  const status: JobStatus = input.status ?? "open";
  const isPublished: boolean = input.isPublished ?? true;

  const counterRef = doc(db, "counters", "jobs");
  const jobsRef = collection(db, "jobs");

  const result = await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(counterRef);

    let nextNumber = 1;

    if (!counterSnap.exists()) {
      tx.set(counterRef, { next: 2 });
    } else {
      const data = counterSnap.data();
      nextNumber = Number(data.next || 1);
      tx.update(counterRef, { next: nextNumber + 1 });
    }

    const jobNumber = nextNumber;
    const jobDhariId = `JOBDHARI-${String(jobNumber).padStart(4, "0")}`;

    const jobRef = doc(jobsRef);

    tx.set(jobRef, {
      jobNumber,
      jobDhariId,

      title,
      companyName,
      location,
      category,
      description,

      status,
      isPublished,

      createdByUid: input.employerId,
      postedByUid: input.employerId,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastBumpedAt: serverTimestamp(),
    });

    return { jobId: jobRef.id, jobDhariId, jobNumber };
  });

  return result;
}
