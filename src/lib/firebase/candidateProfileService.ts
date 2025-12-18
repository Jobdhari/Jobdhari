import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export type CandidateProfile = {
  fullName: string;
  phone?: string;
  currentLocation: string;
  preferredRoles: string[]; // keep simple for MVP
  experienceLevel: "fresher" | "1-3" | "3-5" | "5+";
  updatedAt?: any;
};

export async function getCandidateProfile(uid: string): Promise<CandidateProfile | null> {
  if (!uid) return null;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data();
  return (data.candidateProfile as CandidateProfile) ?? null;
}

export async function upsertCandidateProfile(uid: string, profile: CandidateProfile) {
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
