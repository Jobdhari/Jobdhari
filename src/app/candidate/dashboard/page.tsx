"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

type Job = {
  id: string;
  title: string;
  companyName?: string;
  location?: string;
  category?: string;
};

export default function CandidateDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const jobsRef = collection(db, "jobs");
        const q = query(
          jobsRef,
          where("status", "==", "approved"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const data: Job[] = snap.docs.map((docSnap) => {
          const d = docSnap.data() as any;
          return {
            id: docSnap.id,
            title: d.title ?? "Untitled job",
            companyName: d.companyName ?? "Company not specified",
            location: d.location ?? "Location not specified",
            category: d.category ?? "Others",
          };
        });
        setJobs(data);
      } catch (err) {
        console.error("Error loading candidate dashboard jobs:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading jobs for you…</p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 md:px-12">
      <h1 className="text-2xl font-semibold mb-2">Recommended Jobs</h1>
      <p className="text-gray-500 text-sm mb-6">
        Showing approved jobs posted by employers on JobDhari.
      </p>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
          No approved jobs are available right now. Please check back later.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <h2 className="text-sm font-semibold">{job.title}</h2>
                <p className="text-xs text-gray-500">
                  {job.companyName} • {job.location}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Category: {job.category}
                </p>
              </div>
              <a
                href={`/jobs/${job.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 text-white text-xs font-medium px-4 py-2 hover:bg-orange-600"
              >
                View &amp; Apply
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
