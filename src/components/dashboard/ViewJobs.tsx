"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/auth";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Pencil } from "lucide-react";
import EditJob from "@/components/dashboard/EditJob";

interface Job {
  id: string;
  title: string;
  skills: string;
  location: string;
  salary?: string;
  mode?: string;
}

export default function ViewJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    try {
      const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Job[];
      setJobs(data);
    } catch (err) {
      console.error(err);
      toast.error("Error loading jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteDoc(doc(db, "jobs", id));
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast.success("Job deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting job");
    }
  };

  if (loading) return <p className="text-gray-500 text-sm">Loading jobs...</p>;

  if (!jobs.length)
    return (
      <Card className="p-6 text-center text-gray-500">
        No jobs posted yet.
      </Card>
    );

  return (
    <>
      <Card className="overflow-x-auto p-4">
        <h2 className="text-xl font-heading text-primary mb-4">Your Posted Jobs</h2>
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-2 px-3 text-left font-medium text-gray-600">Title</th>
              <th className="py-2 px-3 text-left font-medium text-gray-600">Skills</th>
              <th className="py-2 px-3 text-left font-medium text-gray-600">Location</th>
              <th className="py-2 px-3 text-left font-medium text-gray-600">Mode</th>
              <th className="py-2 px-3 text-left font-medium text-gray-600">Salary</th>
              <th className="py-2 px-3 text-center font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-2 px-3">{job.title}</td>
                <td className="py-2 px-3">{job.skills}</td>
                <td className="py-2 px-3">{job.location}</td>
                <td className="py-2 px-3">{job.mode || "—"}</td>
                <td className="py-2 px-3">{job.salary || "—"}</td>
                <td className="py-2 px-3 text-center flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedJob(job);
                      setEditOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(job.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selectedJob && (
        <EditJob
          open={editOpen}
          onOpenChange={setEditOpen}
          job={selectedJob}
          onUpdate={fetchJobs}
        />
      )}
    </>
  );
}
