// src/lib/types/candidate.ts

import { Timestamp } from "firebase/firestore";

export interface CandidateProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;

  headline?: string;              // “Senior IT Recruiter”
  experience?: number;            // years
  location?: string;              // city or PIN
  preferredWorkType?: string;     // remote / onsite / hybrid
  skills?: string[];              // ["sourcing", "C2C", "LinkedIn"]
  summary?: string;               // about me

  industries?: string[];          // ["IT Services", "BPO"]
  jobRoles?: string[];            // ["US IT Recruiter", "HRBP"]
  dreamCompanies?: string[];      // ["Amazon", "Iplace"]
  jobAlerts?: boolean;            // wants alerts?

  resumeUrl?: string;             // storage URL
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
