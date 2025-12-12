"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  DocumentData,
} from "firebase/firestore";

type Job = {
  id: string;
  title?: string;
  companyName?: string;
  location?: string;
  status?: string;
  postedByUid?: string;
};

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // 1) Watch auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  const uid = useMemo(() => firebaseUser?.uid ?? null, [firebaseUser]);

  // 2) Load ONLY this employer's jobs
  useEffect(() => {
    if (!uid) return;

    const loadJobs = async () => {
      setLoadingJobs(true);
      try {
        const jobsRef = collection(db, "jobs");
        const q = query(
          jobsRef,
          where("postedByUid", "==", uid),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const nextJobs: Job[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as DocumentData;
          return {
            id: docSnap.id,
            title: data.title ?? "Untitled job",
            companyName: data.companyName ?? "Company not specified",
            location: data.location ?? data.city ?? "",
            status: data.status ?? "published",
            postedByUid: data.postedByUid,
          };
        });

        setJobs(nextJobs);
      } catch (err) {
        console.error("Error loading employer jobs", err);
      } finally {
        setLoadingJobs(false);
      }
    };

    loadJobs();
  }, [uid]);

  const handlePostNewJob = () => {
    router.push("/employer/post-job");
  };

  // ⏳ Still checking auth
  if (loadingAuth) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Checking your account…</p>
      </main>
    );
  }

  // ❌ Not logged in
  if (!firebaseUser) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full border rounded-xl p-6 shadow-sm bg-white">
          <h1 className="text-xl font-semibold mb-2">Login required</h1>
          <p className="text-sm text-gray-600 mb-4">
            Please log in as an employer to view your dashboard and manage job
            posts.
          </p>
          <button
            onClick={() => router.push("/login?mode=employer")}
            className="w-full rounded-lg bg-orange-500 text-white py-2.5 text-sm font-medium hover:bg-orange-600"
          >
            Go to Employer Login
          </button>
        </div>
      </main>
    );
  }

  // ✅ Logged in employer – show dashboard
  return (
    <main className="flex-1 px-4 py-8 md:px-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Employer Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Jobs you posted from this account.
          </p>
        </div>

        <button
          onClick={handlePostNewJob}
          className="rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-medium hover:bg-orange-600"
        >
          + Post New Job
        </button>
      </div>

      <section className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6">
        {loadingJobs ? (
          <p className="text-sm text-gray-500">Loading your jobs…</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-600">
            You haven&apos;t posted any jobs yet from this account. Click{" "}
            <button
              type="button"
              onClick={handlePostNewJob}
              className="text-orange-600 font-medium underline underline-offset-2"
            >
              Post New Job
            </button>{" "}
            to create one.
          </p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <h2 className="font-medium text-sm md:text-base">
                    {job.title}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {job.companyName}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 text-xs px-3 py-1">
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
