"use client";
import { useEffect, useState } from "react";
import { getPublicJobs } from "@/lib/firestoreQueries";

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      const data = await getPublicJobs();
      setJobs(data);
      setLoading(false);
    }
    loadJobs();
  }, []);

  if (loading) return <p>Loading jobs...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Public Job Listings</h2>
      {jobs.length === 0 ? (
        <p>No public jobs available.</p>
      ) : (
        <ul>
          {jobs.map(job => (
            <li key={job.id}>
              <strong>{job.jobTitle}</strong> — {job.city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
