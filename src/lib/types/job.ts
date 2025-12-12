// src/lib/types/job.ts

export type JobStatus = "open" | "closed";

export type WorkType = "remote" | "onsite" | "hybrid";

export interface Job {
  id: string;

  // Who posted it
  employerId: string;
  employerEmail?: string | null;

  // Main info
  title: string;
  companyName: string;

  // Location
  locationCity: string;
  locationRegion?: string; // state / region
  locationPin?: string;

  workType: WorkType;

  // Experience band
  experienceMin?: number; // in years
  experienceMax?: number;

  // Skills / tags for matching
  skills?: string[];          // normalized, lowercase
  industry?: string;          // e.g. "it-services", "bpo", "product"
  category?: string;          // e.g. "recruitment", "finance"

  // Search helpers (optional for now)
  searchRoles?: string[];     // ["it recruiter", "senior recruiter"]
  searchLocations?: string[]; // ["hyderabad", "telangana", "remote"]

  // Other optional info
  employmentType?: "full-time" | "part-time" | "contract" | "internship";
  salaryMin?: number;
  salaryMax?: number;
  description?: string;

  status: JobStatus;
  postedAt: Date;
}
