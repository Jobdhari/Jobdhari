// src/lib/validation/jobSchema.ts
import { z } from "zod";

export const jobFormSchema = z.object({
  // Basic details
  title: z.string().min(3, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  category: z.string().optional().default("Others"),

  // Location
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(4, "PIN code is required"),

  // Work type
  workType: z.enum(["onsite", "remote", "hybrid"], {
    required_error: "Please select a work type",
  }),

  // Salary
  minSalary: z.coerce.number().nonnegative("Min salary must be ≥ 0"),
  maxSalary: z.coerce.number().nonnegative("Max salary must be ≥ 0"),
  currency: z.string().min(1).default("INR"),

  // Experience
  minExperience: z.coerce.number().min(0, "Min experience must be ≥ 0"),
  maxExperience: z.coerce.number().min(0, "Max experience must be ≥ 0"),

  // Skills text (we’ll store as string, can split into array later)
  skills: z
    .string()
    .min(1, "Please enter at least one skill")
    .max(500, "Skills description is too long")
    .transform((value) => value.trim()),

  // Description
  description: z
    .string()
    .min(20, "Please enter at least 20 characters")
    .max(4000, "Job description is too long"),

  // 🔥 NEW FIELDS

  // Show this job as highlighted / special
  isFeatured: z.boolean().default(false),

  // How rare / special the talent is
  talentType: z
    .enum(["general", "niche", "volume"], {
      required_error: "Please choose the talent type",
    })
    .default("general"),

  // Candidate location preference / relocation
  relocationPolicy: z
    .enum(["local-only", "relocation-open", "open-anywhere"], {
      required_error: "Please choose the relocation policy",
    })
    .default("local-only"),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;
