import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { PublicJob } from "@/lib/firebase/publicJobsService";

export async function getPublicJobById(jobId: string): Promise<PublicJob | null> {
  if (!jobId) return null;

  const ref = doc(db, "jobs", jobId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const d = snap.data();

  // Public visibility rule (match your rules + product)
  if (!(d.isPublished === true && d.status === "open")) return null;

  return {
    id: snap.id,
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
}
