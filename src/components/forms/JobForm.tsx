// src/components/forms/JobForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  jobFormSchema,
  JobFormValues,
} from "@/lib/validation/jobSchema";

interface JobFormProps {
  onSubmit: (data: JobFormValues) => Promise<void>;
  loading?: boolean;
}

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

      // NEW FIELDS
      isFeatured: false,
      talentType: "general",
      relocationPolicy: "local-only",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* -------------------- BASIC DETAILS -------------------- */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="Senior Recruiter" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="Company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* -------------------- LOCATION -------------------- */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (City)</FormLabel>
                <FormControl>
                  <Input placeholder="Hyderabad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIN Code</FormLabel>
                <FormControl>
                  <Input placeholder="500081" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* -------------------- SALARY -------------------- */}
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="minSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Salary (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="15000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Salary (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="25000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input placeholder="INR" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* -------------------- EXPERIENCE -------------------- */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="minExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Experience (years)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Experience (years)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* -------------------- SKILLS -------------------- */}
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills (comma separated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Recruitment, Sourcing, Excel"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Example: Recruitment, Sourcing, Excel
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* -------------------- DESCRIPTION -------------------- */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the role, responsibilities, and required skills..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ------------------------------------------------------------- */}
        {/* -------------------- NEW SPECIAL FIELDS -------------------- */}
        {/* ------------------------------------------------------------- */}

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">
            Job Market Tags & Visibility
          </h3>

          <div className="grid gap-6 md:grid-cols-3">
            {/* isFeatured */}
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="mt-0">
                    Highlight this job (Featured)
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* talentType */}
            <FormField
              control={form.control}
              name="talentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Talent Type</FormLabel>
                  <FormControl>
                    <select
                      className="w-full border rounded-md p-2"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="general">General Role</option>
                      <option value="niche">Niche / Rare Talent</option>
                      <option value="volume">Volume Hiring</option>
                    </select>
                  </FormControl>
                  <FormDescription>
                    Classify how rare or common this skill set is.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* relocationPolicy */}
            <FormField
              control={form.control}
              name="relocationPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Candidate Location Preference</FormLabel>
                  <FormControl>
                    <select
                      className="w-full border rounded-md p-2"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="local-only">
                        Local candidates only
                      </option>
                      <option value="relocation-open">
                        Local + relocation allowed
                      </option>
                      <option value="open-anywhere">
                        Open to candidates anywhere
                      </option>
                    </select>
                  </FormControl>
                  <FormDescription>
                    Controls whether non-local talent can apply.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* -------------------- SUBMIT -------------------- */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? "Posting..." : "Post Job"}
        </Button>
      </form>
    </Form>
  );
}
