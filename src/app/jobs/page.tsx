"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import ApplyJobButton from "@/components/jobs/ApplyJobButton";

type Job = {
  id: string;
  title?: string;
  companyName?: string;
  location?: string;
  category?: string;
  description?: string;
  jobDhariId?: string;
};

const JobsPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loadingApplications, setLoadingApplications] = useState(true);

  // 🔹 Watch auth state once
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoaded(true);
    });
    return () => unsub();
  }, []);

  // 🔹 Load jobs list
  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const jobsRef = collection(db, "jobs");
        const q = query(jobsRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const list: Job[] = snap.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            title: data.title,
            companyName: data.companyName,
            location: data.location,
            category: data.category,
            description: data.description,
            jobDhariId: data.jobDhariId,
          };
        });

        setJobs(list);
      } catch (err) {
        console.error("Error loading jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  // 🔹 Load applications for current user and build set of applied jobIds
  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser) {
        setAppliedJobIds(new Set());
        setLoadingApplications(false);
        return;
      }

      setLoadingApplications(true);
      try {
        const appsRef = collection(db, "applications");
        const q = query(appsRef, where("userId", "==", currentUser.uid));
        const snap = await getDocs(q);

        const ids: string[] = [];
        snap.forEach((doc) => {
          const data = doc.data() as any;
          if (data.jobId && typeof data.jobId === "string") {
            ids.push(data.jobId);
          }
        });

        setAppliedJobIds(new Set(ids));
      } catch (err) {
        console.error("Error loading applications:", err);
        setAppliedJobIds(new Set());
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [currentUser]);

  const isLoading = !authLoaded || loadingJobs || loadingApplications;

  return (
    <div className="min-h-screen flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-semibold mb-1">Available Jobs</h1>
        <p className="text-sm text-gray-600 mb-4">
          Jobs posted by verified employers on JobDhari.
        </p>

        {/* Optional quick preferences banner */}
        <div className="mb-6 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-gray-700 flex items-center justify-between gap-3">
          <span>
            Improve your matches by telling us your preferred locations, roles
            and industries.
          </span>
          <button className="shrink-0 inline-flex items-center justify-center rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100">
            Set job preferences
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-600">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-600">No jobs available right now.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const alreadyApplied = appliedJobIds.has(job.id);

              return (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-2xl px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold mb-0.5">
                        {job.title || "Untitled job"}
                      </h2>
                      <p className="text-xs text-orange-600 mb-1">
                        {job.companyName || "Company not specified"}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        {job.location || "Location not specified"}
                      </p>
                      {job.category && (
                        <p className="text-xs text-gray-700">
                          <span className="font-semibold">Category:</span>{" "}
                          {job.category}
                        </p>
                      )}
                      {job.description && (
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <ApplyJobButton
                        jobId={job.id}
                        title={job.title}
                        companyName={job.companyName}
                        location={job.location}
                        category={job.category}
                        alreadyApplied={alreadyApplied}
                        onApplied={async () => {
                          // After applying, update appliedJobIds set locally
                          setAppliedJobIds(
                            (prev) =>
                              new Set<string>([...Array.from(prev), job.id])
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
