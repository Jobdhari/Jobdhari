"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase/auth";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  jobId: string;
  appliedAt: string;
  status?: string;
}

interface Job {
  title: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  company?: string;
}

export default function MyApplications() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!userId) return;
      try {
        const q = query(collection(db, "applications"), where("candidateId", "==", userId));
        const snap = await getDocs(q);
        const apps = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Application[];
        setApplications(apps);

        // fetch jobs for these applications
        const jobData: Record<string, Job> = {};
        for (const app of apps) {
          const jobSnap = await getDoc(doc(db, "jobs", app.jobId));
          if (jobSnap.exists()) {
            jobData[app.jobId] = jobSnap.data() as Job;
          }
        }
        setJobs(jobData);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [userId]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading your applications...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-blue-900">My Applications</h1>
        <Button variant="outline" onClick={() => router.push("/candidate")}>
          ← Back to Jobs
        </Button>
      </div>

      {applications.length === 0 ? (
        <p className="text-gray-500">You haven’t applied to any jobs yet.</p>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => {
            const job = jobs[app.jobId];
            return (
              <Card key={app.id} className="shadow-sm border rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-lg font-medium">
                        {job?.title || "Job removed"}
                      </h2>
                      <p className="text-gray-600">
                        {job?.company || "Confidential"} • {job?.location || "—"}
                      </p>
                      {job?.salaryMin && (
                        <p className="text-sm text-gray-500 mt-1">
                          ₹{job.salaryMin} – ₹{job.salaryMax || job.salaryMin}/mo
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        app.status === "shortlisted"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {app.status || "Submitted"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
