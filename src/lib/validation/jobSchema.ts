// src/lib/validation/jobSchema.ts

import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  category: z.string().min(1, "Category is required"),

  city: z.string().min(1, "City is required"),
  pincode: z.string().min(1, "Pincode is required"),

  // ✅ Correct enum usage
  workType: z
    .enum(["onsite", "remote", "hybrid"])
    .refine((v) => !!v, {
      message: "Please select a work type",
    }),

  minSalary: z.number().nonnegative(),
  maxSalary: z.number().nonnegative(),
  currency: z.string().min(1),

  minExperience: z.number().nonnegative(),
  maxExperience: z.number().nonnegative(),

  skills: z.string().min(1, "Skills are required"),
  description: z.string().min(1, "Description is required"),

  employmentType: z.enum(["full-time", "part-time", "contract"]),
  shiftType: z.enum(["day", "night", "rotational"]),

  relocationPolicy: z.enum([
    "local-only",
    "within-state",
    "open-anywhere",
  ]),
});

export type JobSchemaValues = z.infer<typeof jobSchema>;
