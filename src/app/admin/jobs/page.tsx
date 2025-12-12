"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/auth";
import { useRoleGuard } from "@/hooks/useRoleGuard";

interface Job {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  status?: string;
}

export default function AdminJobsPage() {
  const { loading } = useRoleGuard(["admin"]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const snap = await getDocs(collection(db, "jobs"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Job[];
      setJobs(data);
      setLoadingJobs(false);
    };
    fetchJobs();
  }, []);

  const toggleApproval = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === "approved" ? "pending" : "approved";
    await updateDoc(doc(db, "jobs", jobId), { status: newStatus });
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
  };

  if (loading || loadingJobs) return <p className="p-8 text-center">Loading jobs...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-blue-900 mb-4">Moderate Job Posts</h1>
      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-green-50 text-green-900">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{job.title}</td>
                <td className="p-3">{job.company}</td>
                <td className="p-3">{job.location}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      job.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {job.status || "pending"}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleApproval(job.id, job.status || "pending")}
                    className="text-sm px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    {job.status === "approved" ? "Unapprove" : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
