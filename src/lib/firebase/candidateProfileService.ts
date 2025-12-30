import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

/**
 * Canonical Candidate Profile shape (stored in Firestore)
 */
export type CandidateProfile = {
  fullName: string;
  phone?: string;
  currentLocation: string;
  preferredRoles: string[]; // MVP simple array
  experienceLevel: "fresher" | "1-3" | "3-5" | "5+";
  updatedAt?: any;
};

/**
 * Fetch candidate profile
 */
export async function getCandidateProfile(
  uid: string
): Promise<CandidateProfile | null> {
  if (!uid) return null;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();
  return (data.candidateProfile as CandidateProfile) ?? null;
}

/**
 * Create or update candidate profile (PARTIAL updates allowed)
 *
 * IMPORTANT:
 * - Accepts Partial<CandidateProfile>
 * - Uses merge: true to avoid overwriting existing fields
 * - Always updates updatedAt timestamps
 */
export async function upsertCandidateProfile(
  uid: string,
  profile: Partial<CandidateProfile>
) {
  if (!uid) throw new Error("Missing uid");

  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      candidateProfile: {
        ...profile,
        updatedAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
