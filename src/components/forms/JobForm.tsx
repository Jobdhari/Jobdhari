"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/* ======================================================
 * ZOD SCHEMA — SINGLE SOURCE OF TRUTH
 * ====================================================== */
const jobFormSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  category: z.string().min(1),

  city: z.string().min(1),
  pincode: z.string().min(1),

  workType: z.enum(["remote", "onsite", "hybrid"]),

  minSalary: z.number().nonnegative(),
  maxSalary: z.number().nonnegative(),
  currency: z.string().min(1),

  minExperience: z.number().nonnegative(),
  maxExperience: z.number().nonnegative(),

  skills: z.string().min(1),
  description: z.string().min(1),

  employmentType: z.enum(["full-time", "part-time", "contract"]),
  shiftType: z.enum(["day", "night", "rotational"]),

  relocationPolicy: z.enum([
    "local-only",
    "within-state",
    "open-anywhere",
  ]),
});

/* ======================================================
 * TYPE DERIVED FROM SCHEMA (CRITICAL)
 * ====================================================== */
export type JobFormValues = z.infer<typeof jobFormSchema>;

type JobFormProps = {
  loading?: boolean;
  onSubmit: (data: JobFormValues) => Promise<void> | void;
};

export default function JobForm({ onSubmit, loading }: JobFormProps) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      company: "",
      category: "",

      city: "",
      pincode: "",

      workType: "onsite",

      minSalary: 0,
      maxSalary: 0,
      currency: "INR",

      minExperience: 0,
      maxExperience: 0,

      skills: "",
      description: "",

      employmentType: "full-time",
      shiftType: "day",
      relocationPolicy: "local-only",
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <Input placeholder="Job title" {...form.register("title")} />
      <Input placeholder="Company name" {...form.register("company")} />
      <Input placeholder="Category" {...form.register("category")} />

      <Input placeholder="City" {...form.register("city")} />
      <Input placeholder="Pincode" {...form.register("pincode")} />

      <Input
        type="number"
        placeholder="Min salary"
        {...form.register("minSalary", { valueAsNumber: true })}
      />
      <Input
        type="number"
        placeholder="Max salary"
        {...form.register("maxSalary", { valueAsNumber: true })}
      />

      <Input
        type="number"
        placeholder="Min experience"
        {...form.register("minExperience", { valueAsNumber: true })}
      />
      <Input
        type="number"
        placeholder="Max experience"
        {...form.register("maxExperience", { valueAsNumber: true })}
      />

      <Input
        placeholder="Skills (comma separated)"
        {...form.register("skills")}
      />

      <Input
        placeholder="Job description"
        {...form.register("description")}
      />

      <Button
        type="submit"
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-600"
      >
        {loading ? "Saving…" : "Submit Job"}
      </Button>
    </form>
  );
}
