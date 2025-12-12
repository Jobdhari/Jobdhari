import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getCandidateProfile(candidateId: string) {
  const ref = doc(db, "candidates", candidateId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data();
}
