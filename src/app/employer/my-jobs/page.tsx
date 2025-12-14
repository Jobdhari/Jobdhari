"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { auth } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase";

type EmployerJob = {
  id: string;
  title: string;
  companyName: string;
  location: string;
  status: string;
  createdAt: Date | null;
};

function toDateSafe(v: any): Date | null {
  if (!v) return null;
  if (v instanceof Timestamp) return v.toDate();
  // sometimes serverTimestamp comes back as plain object in some states
  try {
    if (typeof v?.toDate === "function") return v.toDate();
  } catch {}
  return null;
}

export default function EmployerMyJobsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  // 2) Load jobs (supports BOTH createdByUid + postedByUid)
  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;

      setLoadingJobs(true);
      setError(null);

      try {
        const jobsRef = collection(db, "jobs");

        // Query A: jobs created with createdByUid
        const qCreated = query(
          jobsRef,
          where("createdByUid", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        // Query B: jobs created with postedByUid
        const qPosted = query(
          jobsRef,
          where("postedByUid", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const [snapCreated, snapPosted] = await Promise.all([
          getDocs(qCreated),
          getDocs(qPosted),
        ]);

        // Merge + de-dupe by doc id
        const byId = new Map<string, EmployerJob>();

        const addFromSnap = (snap: any) => {
          snap.docs.forEach((d: any) => {
            const data = d.data() as DocumentData;

            byId.set(d.id, {
              id: d.id,
              title: data.title ?? "Untitled job",
              companyName: data.companyName ?? "Company not specified",
              location: data.location ?? data.city ?? "",
              status: data.status ?? "open",
              createdAt: toDateSafe(data.createdAt),
            });
          });
        };

        addFromSnap(snapCreated);
        addFromSnap(snapPosted);

        // Sort newest first
        const merged = Array.from(byId.values()).sort((a, b) => {
          const at = a.createdAt?.getTime() ?? 0;
          const bt = b.createdAt?.getTime() ?? 0;
          return bt - at;
        });

        setJobs(merged);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Failed to load jobs");
      } finally {
        setLoadingJobs(false);
      }
    };

    load();
  }, [user?.uid]);

  // UI states
  if (loadingAuth) {
    return (
      <main className="p-6">
        <p className="text-sm text-gray-500">Checking login…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6">
        <div className="max-w-md rounded-xl border bg-white p-5">
          <h1 className="text-lg font-semibold">Login required</h1>
          <p className="mt-1 text-sm text-gray-600">
            Please login to view your jobs.
          </p>
          <a
            href="/login/employer"
            className="mt-4 inline-flex rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Go to Employer Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10">
      <h1 className="text-2xl font-bold">My Jobs</h1>
      <p className="mt-1 text-sm text-gray-600">
        Showing jobs created by you (supports older + newer job records).
      </p>

      <section className="mt-6 rounded-2xl border bg-white p-5">
        {loadingJobs ? (
          <p className="text-sm text-gray-500">Loading jobs…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-600">
            No jobs found for your account.
          </p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border px-4 py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-medium">{job.title}</div>
                  <div className="text-xs text-gray-600">
                    {job.companyName}
                    {job.location ? ` · ${job.location}` : ""}
                    {job.createdAt ? ` · ${job.createdAt.toLocaleString()}` : ""}
                  </div>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
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
