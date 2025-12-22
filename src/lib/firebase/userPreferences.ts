// src/lib/firebase/userPreferences.ts
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserPreferences = {
  language?: "en" | "hi" | "te";
  city?: string;
  pincode?: string;
  updatedAt?: any;
};

const COL = "userPreferences";

/**
 * Read current user's preferences (or specific uid if passed).
 */
export async function getUserPreferences(uid?: string) {
  const userId = uid || auth.currentUser?.uid;
  if (!userId) return null;

  const ref = doc(db, COL, userId);
  const snap = await getDoc(ref);

  return snap.exists() ? (snap.data() as UserPreferences) : null;
}

/**
 * Save preferences (merge).
 */
export async function saveUserPreferences(
  prefs: Partial<UserPreferences>,
  uid?: string
) {
  const userId = uid || auth.currentUser?.uid;
  if (!userId) throw new Error("Not authenticated");

  const ref = doc(db, COL, userId);

  await setDoc(
    ref,
    { ...prefs, updatedAt: serverTimestamp() },
    { merge: true }
  );

  return true;
}
