import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export type CandidateProfile = {
  fullName: string;
  phone?: string;
  currentLocation: string;
  preferredRoles: string[];
  experienceLevel: "fresher" | "1-3" | "3-5" | "5+";
  updatedAt?: any;
};

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
 * IMPORTANT:
 * - This MUST only modify the top-level key: "candidateProfile"
 * - Do NOT write root-level fields like updatedAt, role, email, etc.
 * - Timestamp goes INSIDE candidateProfile.updatedAt
 */
export async function upsertCandidateProfile(
  uid: string,
  patch: Partial<CandidateProfile>
) {
  if (!uid) throw new Error("Missing uid");

  const ref = doc(db, "users", uid);

  // Read existing profile so partial edits don't wipe other fields
  const existing = await getCandidateProfile(uid);

  const nextProfile = {
    ...(existing ?? {}),
    ...patch,
    updatedAt: serverTimestamp(),
  };

  // ✅ Only writes "candidateProfile" at root → matches your Firestore rule
  await setDoc(ref, { candidateProfile: nextProfile }, { merge: true });
}
