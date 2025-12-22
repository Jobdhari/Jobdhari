"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import RequireAdmin from "@/components/auth/RequireAdmin";

interface Job {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  status?: string;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const snap = await getDocs(collection(db, "jobs"));
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Job, "id">),
      }));
      setJobs(data);
      setLoading(false);
    };

    fetchJobs();
  }, []);

  const toggleApproval = async (jobId: string, status = "pending") => {
    const next = status === "approved" ? "pending" : "approved";
    await updateDoc(doc(db, "jobs", jobId), { status: next });
    setJobs((j) =>
      j.map((x) => (x.id === jobId ? { ...x, status: next } : x))
    );
  };

  if (loading) return <p className="p-6 text-center">Loading…</p>;

  return (
    <RequireAdmin>
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-semibold text-blue-900">
          Moderate Jobs
        </h1>

        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Company</th>
              <th className="p-2 text-left">Location</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t">
                <td className="p-2">{job.title}</td>
                <td className="p-2">{job.company}</td>
                <td className="p-2">{job.location}</td>
                <td className="p-2">{job.status ?? "pending"}</td>
                <td className="p-2 text-center">
                  <button
                    className="rounded bg-green-600 px-3 py-1 text-white"
                    onClick={() =>
                      toggleApproval(job.id, job.status)
                    }
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </RequireAdmin>
  );
}
