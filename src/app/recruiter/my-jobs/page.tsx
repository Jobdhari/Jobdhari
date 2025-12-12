"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getCountFromServer,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  location: string;
  postedAt: string;
  status?: string;
}

export default function MyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const recruiterId = "sample-recruiter-uid"; // TODO: Replace with actual logged-in user uid (from Firebase Auth)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, "jobs"), where("postedBy", "==", recruiterId));
        const snapshot = await getDocs(q);
        const jobList: Job[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Job),
        }));
        setJobs(jobList);

        // Fetch applicant counts for each job
        const counts: Record<string, number> = {};
        for (const job of jobList) {
          const appQuery = query(
            collection(db, "applications"),
            where("jobId", "==", job.id)
          );
          const appSnap = await getCountFromServer(appQuery);
          counts[job.id] = appSnap.data().count || 0;
        }
        setApplicantCounts(counts);
      } catch (err) {
        console.error("Error loading jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading your jobs...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-blue-900">My Posted Jobs</h1>
        <Button onClick={() => router.push("/recruiter/post-job")}>
          + Post New Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center">You haven’t posted any jobs yet.</p>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="hover:shadow-md transition-all border rounded-2xl cursor-pointer"
              onClick={() => router.push(`/recruiter/jobs/${job.id}`)}
            >
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                  <p className="text-gray-600 text-sm">{job.location || "Not specified"}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Posted on {new Date(job.postedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">
                    Applicants:{" "}
                    <span className="font-semibold text-blue-700">
                      {applicantCounts[job.id] ?? 0}
                    </span>
                  </p>
                  <p
                    className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                      job.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {job.status || "Active"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
