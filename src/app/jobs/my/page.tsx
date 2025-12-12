"use client";
import { useEffect, useState } from "react";
import { getEmployerJobs } from "@/lib/firestoreQueries";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const data = await getEmployerJobs();
        setJobs(data);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading your jobs...</p>;

  if (!user) return <p>Please log in as an employer to see your jobs.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Posted Jobs</h2>
      {jobs.length === 0 ? (
        <p>No jobs found for your account.</p>
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
