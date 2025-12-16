import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { JobStatus } from "@/lib/firebase/employerJobsService";

export async function updateJobFields(
  jobId: string,
  updates: Partial<{
    title: string;
    companyName: string;
    location: string;
    pincode: string;
    category: string;
    description: string;
    status: JobStatus;
    isPublished: boolean;
  }>
) {
  const ref = doc(db, "jobs", jobId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
