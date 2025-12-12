import { db } from "@/lib/firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";

export async function updateResumeUrl(userId: string, url: string | null) {
  const ref = doc(db, "candidates", userId);

  // Firestore requires doc to exist before update
  await setDoc(
    ref,
    {
      resumeUrl: url,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}
