"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";

type EmployerJob = {
  id: string;
  jobDhariId?: string;
  title: string;
  companyName?: string;
  location?: string;
  pincode?: string;
  status?: string;
  createdAt?: Timestamp | null;
};

const EmployerMyJobsPage: React.FC = () => {
  const router = useRouter();

  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setError(null);
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in as an employer to view your jobs.");
        setLoading(false);
        return;
      }

      try {
        const jobsRef = collection(db, "jobs");

        // Only jobs created by this user
        const q = query(
          jobsRef,
          where("createdByUid", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const list: EmployerJob[] = [];

        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          list.push({
            id: docSnap.id,
            jobDhariId: data.jobDhariId,
            title: data.title ?? "Untitled Job",
            companyName: data.companyName ?? "",
            location: data.location ?? "",
            pincode: data.pincode ?? "",
            status: data.status ?? "open",
            createdAt: data.createdAt ?? null,
          });
        });

        setJobs(list);
      } catch (err: any) {
        console.error("Error loading employer jobs:", err);
        setError(err?.message || "Failed to load your jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handlePostJob = () => {
    router.push("/employer/post-job");
  };

  const formatDate = (ts?: Timestamp | null) => {
    if (!ts) return "";
    const d = ts.toDate();
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading your jobs...</p>
      </div>
    );
  }

  const user = auth.currentUser;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h1 className="text-xl font-semibold mb-2">Login required</h1>
          <p className="text-gray-600 text-sm mb-4">
            Please log in as an employer to view your posted jobs.
          </p>
          <button
            onClick={() => router.push("/signup?role=employer")}
            className="w-full inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            Go to Employer Signup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">My Jobs</h1>
            <p className="text-sm text-gray-600">
              Jobs you have posted on JobDhari.
            </p>
          </div>
          <button
            onClick={handlePostJob}
            className="inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium bg-orange-500 text-white hover:bg-orange-600"
          >
            + Post New Job
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
            <p className="text-sm text-gray-700 mb-2">
              You haven&apos;t posted any jobs yet.
            </p>
            <button
              onClick={handlePostJob}
              className="inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Post your first job
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-gray-200 px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-gray-900">
                      {job.title}
                    </h2>
                    {job.jobDhariId && (
                      <span className="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-600 bg-gray-50">
                        {job.jobDhariId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {job.companyName || "Company not specified"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {job.location}
                    {job.pincode ? ` • ${job.pincode}` : ""}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Posted on {formatDate(job.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col items-stretch gap-2 md:items-end">
                  <span className="inline-flex rounded-full bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide self-start md:self-end">
                    {job.status || "open"}
                  </span>
                  <button
                    onClick={() => router.push(`/employer/jobs/${job.id}`)}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
                  >
                    View applicants
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerMyJobsPage;
