import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { CandidateProfile } from "@/lib/firebase/candidateProfileService";

/**
 * Upsert candidate profile (partial updates allowed)
 * - Safe incremental writes
 * - Merge-enabled
 * - Timestamp enforced
 */
export async function upsertCandidateProfile(
  uid: string,
  data: Partial<CandidateProfile>
) {
  if (!uid) {
    throw new Error("Missing uid");
  }

  const ref = doc(db, "candidateProfiles", uid);

  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
