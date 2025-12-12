// src/lib/firebase/candidateService.ts
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/auth";
import type { CandidateProfile } from "@/lib/types/candidate";

// Helper to map Firestore data to our type
function mapCandidateProfile(
  uid: string,
  data: any
): CandidateProfile {
  return {
    uid,
    email: data.email ?? "",
    fullName: data.fullName,
    headline: data.headline,
    experience: data.experience,
    location: data.location,
    preferredWorkType: data.preferredWorkType,
    skills: data.skills ?? [],
    summary: data.summary,
    targetIndustries: data.targetIndustries ?? [],
    targetRoles: data.targetRoles ?? [],
    targetCompanies: data.targetCompanies ?? [],
    targetLocations: data.targetLocations ?? [],
    jobSearchStatus: data.jobSearchStatus,
    jobAlerts: data.jobAlerts,
    resumeUrl: data.resumeUrl ?? null,
    createdAt: data.createdAt?.toDate?.(),
    updatedAt: data.updatedAt?.toDate?.(),
  };
}

export async function getCandidateProfile(
  uid: string
): Promise<CandidateProfile | null> {
  const ref = doc(db, "candidateProfiles", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return mapCandidateProfile(uid, snap.data());
}

export async function saveCandidateProfile(
  uid: string,
  data: Partial<CandidateProfile>
): Promise<void> {
  const ref = doc(db, "candidateProfiles", uid);
  const snap = await getDoc(ref);

  const base = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (snap.exists()) {
    await updateDoc(ref, base);
  } else {
    await setDoc(ref, {
      ...base,
      createdAt: serverTimestamp(),
    });
  }
}
