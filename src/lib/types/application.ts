// src/lib/types/application.ts

export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "rejected"
  | "hired";

export interface JobApplication {
  id: string; // Firestore doc id

  candidateUid: string;
  jobId: string;

  jobTitle: string;
  companyName: string;
  location: string;
  workType: "remote" | "onsite" | "hybrid";
  postedAt?: string; // optional – some jobs may not have it

  appliedAt: string;
  status: ApplicationStatus;
}
