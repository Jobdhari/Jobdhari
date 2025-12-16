import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export async function getApplicationCountsByJobIds(jobIds: string[]) {
  const counts: Record<string, number> = {};
  if (!jobIds || jobIds.length === 0) return counts;

  // Firestore "in" supports max 10 elements
  const chunks: string[][] = [];
  for (let i = 0; i < jobIds.length; i += 10) {
    chunks.push(jobIds.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    const q = query(
      collection(db, "applications"),
      where("jobId", "in", chunk)
    );

    const snap = await getDocs(q);

    for (const d of snap.docs) {
      const jobId = d.data()?.jobId;
      if (!jobId) continue;
      counts[jobId] = (counts[jobId] || 0) + 1;
    }
  }

  return counts;
}
