import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Bumps a job to the top by updating lastBumpedAt.
 * Keeps same job id + same responses.
 */
export async function bumpJob(jobId: string) {
  const ref = doc(db, "jobs", jobId);
  await updateDoc(ref, {
    lastBumpedAt: serverTimestamp(),
  });
}
