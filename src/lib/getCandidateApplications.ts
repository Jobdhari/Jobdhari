// src/lib/getCandidateApplications.ts
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export async function getCandidateApplications(candidateId: string) {
  const ref = collection(db, "applications");

  const q = query(
    ref,
    where("candidateId", "==", candidateId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
