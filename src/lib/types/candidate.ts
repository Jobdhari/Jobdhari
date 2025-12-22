// src/lib/types/candidate.ts

import { Timestamp } from "firebase/firestore";

export type JobSearchStatus =
  | "actively-looking"
  | "open-to-opportunities"
  | "not-looking";

export interface CandidateProfile {
  uid: string;

  /* =====================
   * Basic Identity
   * ===================== */
  fullName: string;
  email: string;
  phone?: string;

  /* =====================
   * Professional Overview
   * ===================== */
  headline?: string;              // “Senior IT Recruiter”
  summary?: string;               // about me
  experience?: number;            // total years
  skills?: string[];              // ["sourcing", "C2C", "LinkedIn"]

  /* =====================
   * Location & Work Preferences
   * ===================== */
  location?: string;              // city or PIN
  preferredWorkType?: "remote" | "onsite" | "hybrid";

  /* =====================
   * 🎯 Targeting Preferences (USED BY UI)
   * ===================== */
  targetIndustries?: string[];
  targetRoles?: string[];
  targetCompanies?: string[];
  targetLocations?: string[];

  /* =====================
   * 🔍 Job Search State (USED BY UI)
   * ===================== */
  jobSearchStatus?: JobSearchStatus;
  jobAlerts?: boolean;

  /* =====================
   * Legacy / Backward-Compatible Fields
   * ===================== */
  industries?: string[];
  jobRoles?: string[];
  dreamCompanies?: string[];

  /* =====================
   * Assets
   * ===================== */
  resumeUrl?: string;

  /* =====================
   * Metadata
   * ===================== */
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
