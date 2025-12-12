import { db } from "@/lib/firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export async function updateJobStatus(jobId: string, newStatus: "Open" | "Closed") {
  const jobRef = doc(db, "jobs", jobId);

  await updateDoc(jobRef, {
    status: newStatus,
    updatedAt: Date.now(),
  });
}
