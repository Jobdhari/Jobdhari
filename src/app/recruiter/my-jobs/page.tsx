"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Job = {
  id: string;
  title: string;
  location: string;
  status: string;
  createdAt: string;
};

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!auth.currentUser) return;

      setLoading(true);
      try {
        const q = query(
          collection(db, "jobs"),
          where("employerId", "==", auth.currentUser.uid)
        );

        const snapshot = await getDocs(q);

        const jobList: Job[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Omit<Job, "id">),
          id: docSnap.id, // ✅ assign id last
        }));

        setJobs(jobList);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">My Jobs</h1>

      {jobs.length === 0 ? (
        <p className="text-muted-foreground">No jobs posted yet.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-lg border p-4">
              <div className="font-semibold">{job.title}</div>
              <div className="text-sm text-muted-foreground">
                {job.location} • {job.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
