"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { generateJobDhariId } from "@/lib/services/jobIdService";

type JobFormState = {
  title: string;
  companyName: string;
  location: string;
  category: string;
  description: string;
};

const initialForm: JobFormState = {
  title: "",
  companyName: "",
  location: "",
  category: "",
  description: "",
};

export default function PostJobPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<JobFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login/employer");
        return;
      }
      setUser(firebaseUser);
    });

    return () => unsub();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login/employer");
      return;
    }

    if (!form.title.trim()) {
      alert("Job title is required");
      return;
    }

    try {
      setSubmitting(true);

      const jobDhariId = await generateJobDhariId();

      await addDoc(collection(db, "jobs"), {
        jobDhariId,
        title: form.title.trim(),
        companyName: form.companyName.trim() || "Company not specified",
        location: form.location.trim() || "Location not specified",
        category: form.category.trim() || "Others",
        description: form.description.trim(),

        // link to employer
        postedByUid: user.uid,
        postedByRole: "employer",

        isPublished: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/employer/dashboard");
    } catch (err) {
      console.error("Error posting job", err);
      alert("Could not post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 px-4 py-8 md:px-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Post a New Job</h1>
        <p className="text-gray-600 mb-6">
          Create a job opening that will appear to candidates on JobDhari.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white border border-gray-200 rounded-xl p-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Job Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Senior IT Recruiter"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. ABC Staffing Pvt Ltd"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Hyderabad, Telangana"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Category / Function
            </label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Recruitment, Sales, BPO"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Job Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[120px]"
              placeholder="Short description, key requirements, etc."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/employer/dashboard")}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {submitting ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
