// src/types/job.ts
import type { Timestamp } from "firebase/firestore";
import type { JobStatus, WorkMode } from "@/lib/validation/jobSchema";

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  workMode: WorkMode;
  salary: number;
  skills: string; // comma-separated for now
  recruiterId: string;
  employerId: string;
  status: JobStatus;
  isPublic: boolean;
  applicationsCount: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}
