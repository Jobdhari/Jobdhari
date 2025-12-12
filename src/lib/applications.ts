// src/lib/applications.ts
import { db } from "@/lib/firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type ApplicationPayload = {
  jobId: string;
  jobTitle: string;
  employerId?: string | null;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeUrl: string;
  expectedSalary?: string;
  experienceYears?: string;
  note?: string;
};

export async function createApplication(payload: ApplicationPayload) {
  const applicationsRef = collection(db, "applications");

  const docRef = await addDoc(applicationsRef, {
    ...payload,
    status: "Submitted",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}
