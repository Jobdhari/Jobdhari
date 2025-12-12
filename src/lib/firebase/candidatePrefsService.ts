// src/lib/firebase/candidatePrefsService.ts
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./db";

export type CandidateQuickPrefs = {
  preferredRole: string;
  preferredLocations: string[];
  experienceLevel: string;
  preferredIndustry: string;
  updatedAt?: Date | null;
};

/**
 * One document per user:
 *   /candidatePrefs/{userId}
 *
 * This keeps writes & reads minimal and easy to cache.
 */
export async function saveCandidateQuickPrefs(
  userId: string,
  prefs: Omit<CandidateQuickPrefs, "updatedAt">
): Promise<void> {
  const ref = doc(db, "candidatePrefs", userId);

  await setDoc(
    ref,
    {
      preferredRole: prefs.preferredRole,
      preferredLocations: prefs.preferredLocations,
      experienceLevel: prefs.experienceLevel,
      preferredIndustry: prefs.preferredIndustry,
      updatedAt: serverTimestamp(),
    },
    { merge: true } // merge so we don't overwrite future fields
  );
}

/**
 * Load existing quick prefs for a user (if any).
 */
export async function getCandidateQuickPrefs(
  userId: string
): Promise<CandidateQuickPrefs | null> {
  const ref = doc(db, "candidatePrefs", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data() as any;

  return {
    preferredRole: data.preferredRole ?? "",
    preferredLocations: data.preferredLocations ?? [],
    experienceLevel: data.experienceLevel ?? "",
    preferredIndustry: data.preferredIndustry ?? "",
    updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
  };
}
