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
  addDoc,
} from "firebase/firestore";
import { generateJobDhariId } from "@/lib/services/jobIdService";

export type JobStatus = "open" | "closed" | "draft";

export interface EmployerJob {
  id: string;
  jobDhariId: string;
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
    orderBy("createdAt", "desc") // ✅ stable, index-safe
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      jobDhariId: data.jobDhariId,
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
 * ✅ Job creation (canonical, production-safe)
 * Default: OPEN + published
 */
export async function createEmployerJob(input: {
  employerId: string;
  title: string;
  companyName: string;
  location: string;
  category: string;
  description?: string;

  // Optional overrides (future-proof)
  status?: JobStatus;
  isPublished?: boolean;
}) {
  if (!input.employerId) throw new Error("Missing employerId");

  const jobDhariId = await generateJobDhariId();

  const status: JobStatus = input.status ?? "open";
  const isPublished: boolean = input.isPublished ?? true;

  const ref = await addDoc(collection(db, "jobs"), {
    jobDhariId,

    title: input.title.trim(),
    companyName: input.companyName.trim(),
    location: input.location.trim(),
    category: input.category.trim(),
    description: (input.description || "").trim(),

    status,
    isPublished,

    createdByUid: input.employerId,
    postedByUid: input.employerId,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastBumpedAt: serverTimestamp(),
  });

  return ref.id;
}
