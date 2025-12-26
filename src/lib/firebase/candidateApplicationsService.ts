/**
 * @feature Candidate Applications
 * @responsibility Read candidate applications + related jobs for dashboard
 * @usedBy /candidate/dashboard
 */

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  documentId,
} from "firebase/firestore";
import { collection as fsCollection } from "firebase/firestore";
import { getDocs as fsGetDocs } from "firebase/firestore";

export type ApplicationStatus = "applied";

export type CandidateApplication = {
  id: string;
  jobId: string; // Firestore jobs doc id
  userId: string; // candidate uid
  status: ApplicationStatus;
  appliedAt?: Timestamp | null;
};

export type PublicJobLite = {
  id: string; // Firestore doc id
  title?: string;
  companyName?: string;
  location?: string;
  pincode?: string;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function listMyApplications(userId: string) {
  const ref = collection(db, "applications");
  const q = query(ref, where("userId", "==", userId), orderBy("appliedAt", "desc"));
  const snap = await getDocs(q);

  const apps: CandidateApplication[] = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      jobId: String(data.jobId ?? ""),
      userId: String(data.userId ?? ""),
      status: (data.status ?? "applied") as ApplicationStatus,
      appliedAt: data.appliedAt ?? null,
    };
  });

  // Filter out any broken docs without jobId (defensive)
  return apps.filter((a) => a.jobId);
}

export async function getJobsLiteByIds(jobIds: string[]) {
  const unique = Array.from(new Set(jobIds)).filter(Boolean);
  if (unique.length === 0) return new Map<string, PublicJobLite>();

  // Firestore "in" limit is 10 values → batch
  const batches = chunk(unique, 10);
  const jobsMap = new Map<string, PublicJobLite>();

  for (const ids of batches) {
    const jobsRef = fsCollection(db, "jobs");
    const q = query(jobsRef, where(documentId(), "in", ids));
    const snap = await fsGetDocs(q);

    snap.docs.forEach((d) => {
      const data = d.data() as any;
      jobsMap.set(d.id, {
        id: d.id,
        title: data.title,
        companyName: data.companyName,
        location: data.location,
        pincode: data.pincode,
      });
    });
  }

  return jobsMap;
}
