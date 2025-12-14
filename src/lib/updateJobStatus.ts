import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type JobStatus = "open" | "closed" | "draft";

export async function updateJobStatus(
  jobId: string,
  newStatus: JobStatus
) {
  if (!jobId) {
    throw new Error("updateJobStatus: missing jobId");
  }

  const jobRef = doc(db, "jobs", jobId);

  await updateDoc(jobRef, {
    status: newStatus,
    updatedAt: serverTimestamp(), // 🔑 REQUIRED by rules
  });
}
