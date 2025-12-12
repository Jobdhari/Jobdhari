// src/lib/firebase/userPreferences.ts
import { doc, getDoc } from "firebase/firestore";
import { db } import { auth, db } from "@/lib/firebase";;

// 🔴 IMPORTANT:
// Check in Firestore which collection holds the candidate documents
// (where name, headline etc are stored).
// If it is "users", change this to "users".
export const CANDIDATE_COLLECTION = "candidates";

export async function hasJobPreferences(userId: string): Promise<boolean> {
  const ref = doc(db, CANDIDATE_COLLECTION, userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return false;

  const data = snap.data() as any;
  return !!data.jobPreferences;
}
