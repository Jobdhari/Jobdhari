// src/lib/firebase/employerJobsService.ts

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
  status: JobStatus | string;
  isPublished: boolean;
  createdByUid: string;
  postedByUid: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * ✅ Employer dashboard job list
 * Owner-only fetch (rules-compliant)
 */
export async function listEmployerJobs(params: {
  employerId: string;
}) {
  const { employerId } = params;
  if (!employerId) return [];

  const q = query(
    collection(db, "jobs"),
    where("postedByUid", "==", employerId),
    orderBy("updatedAt", "desc")
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
      status: data.status,
      isPublished: data.isPublished,
      createdByUid: data.createdByUid,
      postedByUid: data.postedByUid,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as EmployerJob;
  });
}

/**
 * ✅ RULES-COMPLIANT JOB CREATION
 * This FIXES your posting error
 */
export async function createEmployerJob(input: {
  title: string;
  companyName: string;
  location: string;
  category: string;
  employerId: string;
}) {
  if (!input.employerId) {
    throw new Error("Missing employerId");
  }

  const jobDhariId = await generateJobDhariId();

  const ref = await addDoc(collection(db, "jobs"), {
    jobDhariId,

    title: input.title.trim(),
    companyName: input.companyName.trim(),
    location: input.location.trim(),
    category: input.category.trim(),

    // 🔒 REQUIRED BY RULES
    status: "draft",
    isPublished: false,

    createdByUid: input.employerId,
    postedByUid: input.employerId,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}
