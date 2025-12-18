/**
 * @feature Public Jobs
 * @responsibility Read-only public job discovery (open + published)
 * @routes /jobs, /
 * @files src/lib/firebase/publicJobsService.ts
 */

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

/**
 * Public-safe job shape
 * This can grow without breaking callers
 */
export type PublicJob = {
  id: string;
  jobDhariId?: string;

  // Core
  title: string;
  companyName?: string;
  location?: string;
  category?: string;
  description?: string;

  // Status
  status: "open" | "closed" | "draft";
  isPublished: boolean;

  // Meta
  updatedAt?: any;
};

/**
 * Public jobs query
 * ONLY open + published jobs
 */
export async function listPublicJobs(): Promise<PublicJob[]> {
  const q = query(
    collection(db, "jobs"),
    where("isPublished", "==", true),
    where("status", "==", "open"),
    orderBy("updatedAt", "desc"),
    limit(50)
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id, // ✅ Firestore doc id is the canonical public job id
      jobDhariId: d.jobDhariId,
      title: d.title,
      companyName: d.companyName,
      location: d.location,
      category: d.category,
      description: d.description,
      status: d.status,
      isPublished: d.isPublished,
      updatedAt: d.updatedAt,
    };
  });
}
