// src/lib/firebase/candidatePrefsService.ts

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface CandidateQuickPrefs {
  autoApply: boolean;
  notifyOnMatch: boolean;
  allowRecruiterContact: boolean;
}

/**
 * Save candidate quick-apply preferences
 */
export async function saveCandidateQuickPrefs(
  uid: string,
  prefs: CandidateQuickPrefs
): Promise<void> {
  const ref = doc(db, "candidateQuickPrefs", uid);

  await setDoc(
    ref,
    {
      ...prefs,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
