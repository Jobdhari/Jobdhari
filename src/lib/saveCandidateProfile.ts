import { db } from "@/lib/firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export async function saveCandidateProfile(candidateId: string, data: any) {
  const ref = doc(db, "candidates", candidateId);

  await setDoc(
    ref,
    {
      ...data,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}
