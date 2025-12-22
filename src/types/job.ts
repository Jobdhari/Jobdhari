// src/types/job.ts

import type { Timestamp } from "firebase/firestore";

/* =====================
 * Domain Enums / Unions
 * ===================== */
export type WorkMode = "onsite" | "remote" | "hybrid";

export type JobStatus =
  | "draft"
  | "published"
  | "paused"
  | "closed";

/* =====================
 * Job Entity
 * ===================== */
export interface Job {
  id: string;

  title: string;
  company: string;
  category: string;

  city: string;
  pincode: string;

  workType: WorkMode;

  minSalary: number;
  maxSalary: number;
  currency: string;

  minExperience: number;
  maxExperience: number;

  skills: string[];
  description: string;

  employmentType: "full-time" | "part-time" | "contract";
  shiftType: "day" | "night" | "rotational";

  relocationPolicy: "local-only" | "within-state" | "open-anywhere";

  status: JobStatus;

  employerId: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
