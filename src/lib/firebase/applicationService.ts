// src/lib/firebase/applicationService.ts
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Small summary of a job that we store inside the application document.
// This lets "My Jobs" show data WITHOUT extra reads from the jobs collection.
export type JobSummaryForApplication = {
  id: string;                // jobId
  title: string;
  companyName?: string;
  location?: string;
  category?: string;
};

export type JobApplication = {
  id: string;                // application document id
  userId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  category: string;
  status: "applied";
  appliedAt: Date | null;    // serverTimestamp comes as Firestore Timestamp; we’ll handle in UI
};

/**
 * Create (or overwrite) a job application for a user.
 * Optimized:
 * - Single write (no extra read)
 * - Idempotent: re-applying just overwrites same doc, no duplicates
 */
export async function createJobApplication(
  userId: string,
  job: JobSummaryForApplication
): Promise<void> {
  const applicationId = `${userId}_${job.id}`;
  const applicationRef = doc(db, "applications", applicationId);

  const companyName = job.companyName || "Company not specified";
  const location = job.location || "";
  const category = job.category || "";

  await setDoc(applicationRef, {
    userId,
    jobId: job.id,
    jobTitle: job.title,
    companyName,
    location,
    category,
    status: "applied",
    appliedAt: serverTimestamp(),
  });
}

/**
 * Return a Set of jobIds the user has already applied to.
 * Used on /jobs page to mark "Applied" and disable the button.
 */
export async function getUserAppliedJobIds(
  userId: string
): Promise<Set<string>> {
  const q = query(
    collection(db, "applications"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);
  const jobIds = new Set<string>();

  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as { jobId?: string };
    if (data.jobId) {
      jobIds.add(data.jobId);
    }
  });

  return jobIds;
}

/**
 * Get all applications for the current user, including the job summary
 * (title, company, location, category) that we stored in the application doc.
 *
 * This is what /my-jobs uses: ONE query, no extra job reads.
 */
export async function getUserApplications(
  userId: string
): Promise<JobApplication[]> {
  const q = query(
    collection(db, "applications"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  const apps: JobApplication[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as any;

    apps.push({
      id: docSnap.id,
      userId: data.userId,
      jobId: data.jobId,
      jobTitle: data.jobTitle,
      companyName: data.companyName,
      location: data.location,
      category: data.category,
      status: data.status ?? "applied",
      appliedAt: data.appliedAt ? data.appliedAt.toDate() : null,
    });
  });

  // If you want most recent first:
  apps.sort((a, b) => {
    const aTime = a.appliedAt?.getTime() ?? 0;
    const bTime = b.appliedAt?.getTime() ?? 0;
    return bTime - aTime;
  });

  return apps;
}
