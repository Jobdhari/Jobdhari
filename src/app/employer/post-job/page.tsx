"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

import EmployerGate from "@/components/auth/EmployerGate";
import { createEmployerJob } from "@/lib/firebase/employerJobsService";

export default function EmployerPostJobPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  if (authLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Post a New Job</h1>
        <p className="mt-2 text-gray-600">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Post a New Job</h1>
        <p className="mt-2 text-gray-600">
          Please login as an employer to post a job.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Job Title is required.");
      return;
    }

    if (!user?.uid) {
      setError("Not authenticated.");
      return;
    }

    setSaving(true);

    try {
      await createEmployerJob({
        employerUid: user.uid,
        title: title.trim(),
        companyName: companyName.trim(),
        location: location.trim(),
        category: category.trim(),
        description: description.trim(),
        status: "open",
        isPublished: true,
      });

      router.push("/employer/dashboard");
    } catch (err: any) {
      console.error("Post job failed:", err);

      const code = err?.code ?? "unknown";
      const message =
        err?.message ?? "Unknown error. Check console for details.";

      setError(`Failed to post job (${code}). ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <EmployerGate>
      <div className="p-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold">Post a New Job</h1>
          <p className="mt-2 text-gray-600">
            Create a job opening that will appear to candidates on JobDhari.
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-8 space-y-5 rounded-2xl border bg-white p-6"
          >
            {error && (
              <div className="whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="font-semibold">Job Title *</label>
              <input
                className="mt-2 w-full rounded-md border px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold">Company Name</label>
              <input
                className="mt-2 w-full rounded-md border px-3 py-2"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold">Location</label>
              <input
                className="mt-2 w-full rounded-md border px-3 py-2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold">Category / Function</label>
              <input
                className="mt-2 w-full rounded-md border px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold">Job Description</label>
              <textarea
                className="mt-2 w-full min-h-[140px] rounded-md border px-3 py-2"
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
    </EmployerGate>
  );
}
