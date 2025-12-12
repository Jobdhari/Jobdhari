"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

type PageProps = {
  params: {
    id: string; // job document id
  };
};

type JobDetails = {
  id: string;
  jobDhariId?: string;
  title: string;
  companyName?: string;
  location?: string;
  pincode?: string;
  status?: string;
  createdAt?: Timestamp | null;
};

type JobApplicationRow = {
  id: string;
  userId: string;
  email?: string | null;
  appliedAt?: Date | null;
  status: string;
};

const EmployerJobApplicationsPage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const jobId = params.id;

  const [job, setJob] = useState<JobDetails | null>(null);
  const [applications, setApplications] = useState<JobApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in as an employer to view applicants.");
        setLoading(false);
        return;
      }

      try {
        // 1) Load the job document
        const jobRef = doc(db, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          setError("Job not found.");
          setLoading(false);
          return;
        }

        const jobData = jobSnap.data() as any;
        setJob({
          id: jobSnap.id,
          jobDhariId: jobData.jobDhariId,
          title: jobData.title ?? "Untitled Job",
          companyName: jobData.companyName ?? "",
          location: jobData.location ?? "",
          pincode: jobData.pincode ?? "",
          status: jobData.status ?? "open",
          createdAt: jobData.createdAt ?? null,
        });

        // 2) Load all applications for this job
        const appsRef = collection(db, "applications");
        const q = query(
          appsRef,
          where("jobId", "==", jobId),
          orderBy("appliedAt", "desc")
        );

        const appsSnap = await getDocs(q);
        const rows: JobApplicationRow[] = [];

        appsSnap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          rows.push({
            id: docSnap.id,
            userId: data.userId,
            email: data.email ?? null, // if you start storing email later
            appliedAt: data.appliedAt
              ? (data.appliedAt as Timestamp).toDate()
              : null,
            status: data.status ?? "applied",
          });
        });

        setApplications(rows);
      } catch (err: any) {
        console.error("Error loading job/applications:", err);
        setError(err?.message || "Failed to load job applications.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      loadData();
    }
  }, [jobId]);

  const formatDate = (d?: Date | null) => {
    if (!d) return "";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading job and applicants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h1 className="text-xl font-semibold mb-2">Unable to load job</h1>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-600">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8">
        {/* Job header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-semibold text-gray-900">
                {job.title}
              </h1>
              {job.jobDhariId && (
                <span className="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-600 bg-gray-50">
                  {job.jobDhariId}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-700">
              {job.companyName || "Company not specified"}
            </p>
            <p className="text-xs text-gray-500">
              {job.location}
              {job.pincode ? ` • ${job.pincode}` : ""}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Status:{" "}
              <span className="font-medium uppercase">
                {job.status || "open"}
              </span>
              {job.createdAt && (
                <>
                  {" "}
                  • Posted on{" "}
                  {job.createdAt
                    ? formatDate(job.createdAt.toDate())
                    : ""}
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => router.push("/employer/my-jobs")}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
          >
            Back to My Jobs
          </button>
        </div>

        <hr className="my-4" />

        <h2 className="text-sm font-semibold text-gray-900 mb-2">
          Applicants ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <p className="text-sm text-gray-600">
            No one has applied to this job yet.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {app.email || "Candidate"}
                  </span>
                  <span className="text-xs text-gray-600">
                    User ID: {app.userId}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Applied: {formatDate(app.appliedAt)}
                  </span>
                </div>
                <span className="inline-flex rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerJobApplicationsPage;
