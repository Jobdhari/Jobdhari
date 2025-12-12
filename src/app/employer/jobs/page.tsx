"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateJobStatus } from "@/lib/updateJobStatus";

type Job = {
  id: string;
  title: string;
  company?: string;
  location?: string;
  workMode?: string;
  experience?: string;
  salary?: string;
  status?: string;
  createdAt?: any;
};

export default function EmployerJobsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // 1) Watch auth and get employer UID
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.error("Please log in as an employer.");
        router.replace("/login?role=employer");
        return;
      }
      setUserId(user.uid);
    });

    return () => unsub();
  }, [router]);

  // 2) Load jobs created by this employer
  useEffect(() => {
    if (!userId) return;

    const loadJobs = async () => {
      try {
        const jobsRef = collection(db, "jobs");
        const q = query(
          jobsRef,
          where("employerId", "==", userId),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const list: Job[] = snap.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            title: data.title || "Untitled Role",
            company: data.company || "Company Confidential",
            location: data.location || "Not specified",
            workMode: data.workMode || data.mode || "Not specified",
            experience: data.experience || "Not specified",
            salary: data.salary || "Not specified",
            status: data.status || "Open",
            createdAt: data.createdAt,
          };
        });

        setJobs(list);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your jobs.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-gray-500">
        Loading your jobs…
      </div>
    );
  }

  // Status badge style
  function statusBadge(status: string) {
    return (
      <span
        className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium 
          ${
            status === "Closed"
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-green-100 text-green-700 border border-green-300"
          }`}
      >
        {status}
      </span>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
        <Button onClick={() => router.push("/employer/post-job")}>
          + Post New Job
        </Button>
      </div>

      {jobs.length === 0 && (
        <p className="text-gray-500">You haven’t posted any jobs yet.</p>
      )}

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card
            key={job.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 
                   border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
              <p className="text-sm text-gray-500">
                {job.company} • {job.location}
              </p>
              <p className="text-xs text-gray-400">
                Mode: {job.workMode} • Experience: {job.experience} • Salary: {job.salary}
              </p>

              {statusBadge(job.status || "Open")}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                View Job
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/employer/jobs/${job.id}/applications`)}
              >
                View Applications
              </Button>

              {/* STATUS TOGGLE BUTTON */}
              <Button
                size="sm"
                variant={job.status === "Closed" ? "default" : "destructive"}
                onClick={async () => {
                  const newStatus = job.status === "Closed" ? "Open" : "Closed";

                  await updateJobStatus(job.id, newStatus);

                  // Update UI instantly
                  setJobs((prev) =>
                    prev.map((j) =>
                      j.id === job.id ? { ...j, status: newStatus } : j
                    )
                  );

                  toast.success(`Job marked as ${newStatus}`);
                }}
              >
                {job.status === "Closed" ? "Reopen Job" : "Close Job"}
              </Button>

            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
