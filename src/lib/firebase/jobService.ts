// src/lib/firebase/jobService.ts

import { db } import { auth, db } from "@/lib/firebase";;
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
// Basic job helpers
// (These are “generic”; if your app doesn’t use some of them,
// that’s totally fine – they just sit here ready for later.)
// ─────────────────────────────────────────────────────────────

/**
 * Create a new job in Firestore (for employers).
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
 * Get a single job by id.
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
 * Get all published jobs (for the /jobs page).
 */
export async function getAllPublishedJobs(): Promise<JobWithId[]> {
  const jobsRef = collection(db, "jobs");

  const q = query(
    jobsRef,
    where("isPublished", "==", true),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  const jobs: JobWithId[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data() as Job;
    jobs.push({
      id: docSnap.id,
      ...data,
    });
  });

  return jobs;
}

/**
 * Get jobs posted by a specific employer.
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
  const jobs: JobWithId[] = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data() as Job;
    jobs.push({
      id: docSnap.id,
      ...data,
    });
  });

  return jobs;
}

/**
 * Update a job (for employer editing).
 */
export async function updateJob(jobId: string, partial: Partial<Job>) {
  const jobRef = doc(db, "jobs", jobId);
  await updateDoc(jobRef, {
    ...partial,
    updatedAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────────────────────
// Applications (candidate ↔ job)
// ─────────────────────────────────────────────────────────────

/**
 * Create an application when a candidate applies to a job.
 * Collection: "applications"
 */
export async function applyToJob(
  jobId: string,
  candidateUid: string,
  extra: {
    candidateEmail?: string;
    candidateName?: string;
  } = {}
) {
  if (!jobId || !candidateUid) {
    throw new Error("jobId and candidateUid are required");
  }

  const applicationsRef = collection(db, "applications");

  const payload = {
    jobId,
    candidateUid,
    candidateEmail: extra.candidateEmail ?? null,
    candidateName: extra.candidateName ?? null,
    status: "applied", // applied | shortlisted | rejected | hired etc.
    createdAt: Timestamp.now(),
  };

  await addDoc(applicationsRef, payload);
}

/**
 * Check if candidate already applied to a job
 * (useful if you want to disable the "Apply" button).
 */
export async function hasCandidateAppliedToJob(
  jobId: string,
  candidateUid: string
): Promise<boolean> {
  if (!jobId || !candidateUid) return false;

  const applicationsRef = collection(db, "applications");

  const q = query(
    applicationsRef,
    where("jobId", "==", jobId),
    where("candidateUid", "==", candidateUid)
  );

  const snap = await getDocs(q);
  return !snap.empty;
}

// ─────────────────────────────────────────────────────────────
// My Jobs helper (this is what we need for the /my-jobs page)
// ─────────────────────────────────────────────────────────────

export type CandidateJobApplication = {
  id: string; // application document id
  status: string;
  appliedAt?: Date;
  jobId?: string;
  job?: {
    id: string;
    title: string;
    companyName?: string;
    location?: string;
    employmentType?: string;
  } | null;
};

/**
 * Get all applications for a specific candidate,
 * and include the related job data.
 */
export async function getCandidateApplications(
  candidateUid: string
): Promise<CandidateJobApplication[]> {
  if (!candidateUid) return [];

  try {
    const applicationsRef = collection(db, "applications");

    // applications where this user is the candidate
    const q = query(
      applicationsRef,
      where("candidateUid", "==", candidateUid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    const apps: CandidateJobApplication[] = [];
    const jobPromises: Promise<void>[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as any;

      const base: CandidateJobApplication = {
        id: docSnap.id,
        status: data.status ?? "applied",
        appliedAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : undefined,
        jobId: data.jobId,
        job: null,
      };

      apps.push(base);

      if (data.jobId) {
        jobPromises.push(
          (async () => {
            try {
              const jobRef = doc(db, "jobs", data.jobId);
              const jobSnap = await getDoc(jobRef);

              if (jobSnap.exists()) {
                const jobData = jobSnap.data() as any;
                base.job = {
                  id: jobSnap.id,
                  title: jobData.title ?? "Untitled job",
                  companyName: jobData.companyName ?? "Company not specified",
                  location: jobData.location ?? jobData.city ?? "",
                  employmentType: jobData.employmentType ?? jobData.workType,
                };
              }
            } catch (err) {
              console.error("Error loading job for application", err);
            }
          })()
        );
      }
    });

    await Promise.all(jobPromises);

    return apps;
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    return [];
  }
}
