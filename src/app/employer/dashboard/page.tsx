"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAuth } from "firebase/auth";
import { EmployerJob, JobStatus, listEmployerJobs } from "@/lib/firebase/employerJobsService";

export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<JobStatus | "all">("all");
  const [search, setSearch] = useState("");

  const employerId = getAuth().currentUser?.uid;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!employerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await listEmployerJobs({
          employerId,
          status: status === "all" ? undefined : status,
        });
        if (!cancelled) setJobs(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setJobs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [employerId, status]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return jobs;

    return jobs.filter((j) => {
      return (
        j.title.toLowerCase().includes(s) ||
        j.companyName.toLowerCase().includes(s) ||
        j.location.toLowerCase().includes(s) ||
        j.category.toLowerCase().includes(s)
      );
    });
  }, [jobs, search]);

  if (!employerId) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Employer Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Please login as employer to manage jobs.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Filters sidebar */}
      <aside className="w-[280px] border-r bg-white p-6">
        <div className="text-xs font-semibold tracking-wide text-gray-500">
          FILTERS
        </div>

        <div className="mt-6">
          <div className="font-semibold">Job status</div>

          <div className="mt-3 space-y-3 text-sm">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active jobs" },
              { key: "closed", label: "Closed jobs" },
              { key: "draft", label: "Drafts" },
            ].map((x) => (
              <label key={x.key} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="status"
                  checked={status === (x.key as any)}
                  onChange={() => setStatus(x.key as any)}
                />
                {x.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="font-semibold">Search</div>
          <input
            className="mt-3 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Search by title / company / location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Jobs & Responses</h1>
            <p className="mt-2 text-gray-600">
              Manage your posted jobs and view responses.
            </p>
          </div>

          <Link
            href="/employer/post-job"
            className="inline-flex items-center rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
          >
            + Post New Job
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-6">
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-lg text-gray-700">
                You haven&apos;t posted any jobs yet.
              </div>
              <Link
                href="/employer/post-job"
                className="mt-6 inline-flex rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
              >
                Post your first job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-semibold">{job.title}</div>
                    <div className="text-sm text-gray-600">
                      {job.companyName} • {job.location} • {job.category}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Status: <span className="font-medium">{job.status}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Responses: <span className="font-semibold">0</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
