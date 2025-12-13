"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { createEmployerJob } from "@/lib/firebase/employerJobsService";

export default function EmployerPostJobPage() {
  const router = useRouter();
  const employerId = getAuth().currentUser?.uid;

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!employerId) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Post a New Job</h1>
        <p className="mt-2 text-gray-600">Please login as employer to post a job.</p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Job Title is required.");

    setSaving(true);
    try {
      await createEmployerJob({
        employerId,
        title: title.trim(),
        companyName: companyName.trim(),
        location: location.trim(),
        category: category.trim(),
        description: description.trim(),
        status: "active",
      });

      router.push("/employer/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to post job. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold">Post a New Job</h1>
        <p className="mt-2 text-gray-600">
          Create a job opening that will appear to candidates on JobDhari.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl border bg-white p-6 space-y-5"
        >
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div>
            <label className="font-semibold">Job Title *</label>
            <input
              className="mt-2 w-full rounded-md border px-3 py-2"
              placeholder="e.g. Senior IT Recruiter"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Company Name</label>
            <input
              className="mt-2 w-full rounded-md border px-3 py-2"
              placeholder="e.g. ABC Staffing Pvt Ltd"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Location</label>
            <input
              className="mt-2 w-full rounded-md border px-3 py-2"
              placeholder="e.g. Hyderabad, Telangana"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Category / Function</label>
            <input
              className="mt-2 w-full rounded-md border px-3 py-2"
              placeholder="e.g. Recruitment, Sales, BPO"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Job Description</label>
            <textarea
              className="mt-2 w-full rounded-md border px-3 py-2 min-h-[140px]"
              placeholder="Short description, key requirements, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-lg border px-5 py-2"
              onClick={() => router.push("/employer/dashboard")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
