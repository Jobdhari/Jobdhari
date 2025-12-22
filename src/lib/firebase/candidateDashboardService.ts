/**
 * @feature Candidate Dashboard
 * @responsibility Fetch candidate applications joined with job data (read-only)
 * @files src/lib/firebase/candidateDashboardService.ts
 */

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

export type CandidateApplicationWithJob = {
  applicationId: string;
  jobId: string;
  userId: string;
  status: string;
  appliedAt?: Timestamp;

  // job snapshot fields (best-effort)
  jobTitle?: string;
  companyName?: string;
  location?: string;
};

export async function listCandidateApplicationsWithJobs(
  userId: string
): Promise<CandidateApplicationWithJob[]> {
  if (!userId) return [];

  // fetch applications (latest first)
  const qApps = query(
    collection(db, "applications"),
    where("userId", "==", userId),
    orderBy("appliedAt", "desc"),
    limit(50)
  );

  const snap = await getDocs(qApps);
  if (snap.empty) return [];

  // build rows with minimal reads
  const apps = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      applicationId: d.id,
      jobId: String(data.jobId || ""),
      userId: String(data.userId || ""),
      status: String(data.status || "applied"),
      appliedAt: data.appliedAt as Timestamp | undefined,
    };
  });

  // join jobs one-by-one (MVP-safe)
  // Upgrade later: batch/getAll via Admin or a denormalized app doc.
  const rows: CandidateApplicationWithJob[] = [];
  for (const a of apps) {
    let jobTitle: string | undefined;
    let companyName: string | undefined;
    let location: string | undefined;

    if (a.jobId) {
      const jSnap = await getDoc(doc(db, "jobs", a.jobId));
      if (jSnap.exists()) {
        const j = jSnap.data() as any;
        jobTitle = j.title;
        companyName = j.companyName;
        location = j.location;
      }
    }

    rows.push({ ...a, jobTitle, companyName, location });
  }

  return rows;
}
