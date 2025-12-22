"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import EditJob from "./EditJob";

type Job = {
  id: string;
  title: string;
  location: string;
  status: string;
};

export default function ViewJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "jobs"));
      const list: Job[] = snap.docs.map((d) => ({
        ...(d.data() as Omit<Job, "id">),
        id: d.id,
      }));
      setJobs(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSave = async (data: {
    title: string;
    location: string;
  }) => {
    if (!selectedJob) return;

    await updateDoc(doc(db, "jobs", selectedJob.id), {
      title: data.title,
      location: data.location,
    });

    setEditOpen(false);
    setSelectedJob(null);
    await fetchJobs();
  };

  if (loading) {
    return <div className="p-6">Loading jobs…</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Jobs</h2>

      {jobs.length === 0 ? (
        <p className="text-muted-foreground">No jobs found.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <div className="font-medium">{job.title}</div>
                <div className="text-sm text-muted-foreground">
                  {job.location} • {job.status}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedJob(job);
                  setEditOpen(true);
                }}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Edit Job</h3>

            <EditJob
              initialTitle={selectedJob.title}
              initialLocation={selectedJob.location}
              onSave={handleSave}
              onCancel={() => {
                setEditOpen(false);
                setSelectedJob(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
