"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  category: string;
  status: "applied";
  appliedAt: Date | null;
};

export default function MyJobsPage() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Watch auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  // Load applications for this user (candidate)
  useEffect(() => {
    const loadApps = async () => {
      if (!firebaseUser) {
        setApps([]);
        setLoadingApps(false);
        return;
      }

      try {
        setLoadingApps(true);
        setError(null);

        const qRef = query(
          collection(db, "applications"),
          where("userId", "==", firebaseUser.uid)
        );

        const snap = await getDocs(qRef);
        const list: JobApplication[] = [];

        snap.forEach((docSnap) => {
          const d = docSnap.data() as any;
          list.push({
            id: docSnap.id,
            jobId: d.jobId,
            jobTitle: d.jobTitle ?? "Untitled job",
            companyName: d.companyName ?? "Company not specified",
            location: d.location ?? "Location not specified",
            category: d.category ?? "Others",
            status: d.status ?? "applied",
            appliedAt: d.appliedAt ? d.appliedAt.toDate() : null,
          });
        });

        // latest first
        list.sort((a, b) => {
          const at = a.appliedAt?.getTime() ?? 0;
          const bt = b.appliedAt?.getTime() ?? 0;
          return bt - at;
        });

        setApps(list);
      } catch (err: any) {
        console.error("Error loading applications:", err);
        setError(err.message ?? "Could not load your applications.");
        setApps([]);
      } finally {
        setLoadingApps(false);
      }
    };

    loadApps();
  }, [firebaseUser]);

  // ---------- UI states ----------

  if (loadingAuth || loadingApps) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading your jobs…</p>
      </main>
    );
  }

  if (!firebaseUser) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <h1 className="text-lg font-semibold mb-2">Login required</h1>
          <p className="text-gray-500 text-sm mb-4">
            Please log in as a candidate to view jobs you&apos;ve applied for.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 md:px-12">
      <h1 className="text-2xl font-semibold mb-2">My Jobs</h1>
      <p className="text-gray-500 text-sm mb-4">
        Jobs you&apos;ve applied for on JobDhari (candidate view). Employers
        can see jobs they posted on the{" "}
        <a href="/employer/dashboard" className="text-orange-600 underline">
          Employer Dashboard
        </a>
        .
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {apps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
          You haven&apos;t applied to any jobs yet.
          <br />
          Go to{" "}
          <a href="/jobs" className="text-orange-600 underline">
            Jobs
          </a>{" "}
          to start applying.
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <h2 className="text-sm font-semibold">{app.jobTitle}</h2>
                <p className="text-xs text-gray-500">
                  {app.companyName} • {app.location} • {app.category}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {app.status === "applied" ? "Applied" : app.status}
                </span>
                {app.appliedAt && (
                  <p className="text-[11px] text-gray-400">
                    Applied on {app.appliedAt.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
