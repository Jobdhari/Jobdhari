/**
 * @feature Candidate Dashboard
 * @responsibility Candidate home: profile summary + applied jobs list (MVP) with upgrade-ready tabs
 * @routes /candidate/dashboard
 * @files src/app/candidate/dashboard/page.tsx
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, Timestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// ✅ we’ll create this helper in step 4 below
import {
  listCandidateApplicationsWithJobs,
  CandidateApplicationWithJob,
} from "@/lib/firebase/candidateDashboardService";

type CandidateProfile = {
  name?: string;
  phone?: string;
  location?: string;
};

const TABS = [
  { key: "applied", label: "Applied" },
  { key: "saved", label: "Saved (soon)" },
  { key: "following", label: "Following (soon)" },
  { key: "recommended", label: "Recommended (soon)" },
] as const;

export default function CandidateDashboardPage() {
  const auth = getAuth();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("applied");

  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<CandidateApplicationWithJob[]>([]);

  // -------------------------
  // Auth listener
  // -------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, [auth]);

  // -------------------------
  // Load profile + applied jobs
  // -------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        const u = auth.currentUser;
        if (!u) return;

        // profile (best-effort)
        const pSnap = await getDoc(doc(db, "candidateProfiles", u.uid));
        if (!cancelled) {
          setProfile(pSnap.exists() ? (pSnap.data() as CandidateProfile) : null);
        }

        // applied jobs list (MVP)
        const rows = await listCandidateApplicationsWithJobs(u.uid);
        if (!cancelled) setApps(rows);
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || "Failed to load candidate dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auth]);

  const appliedCount = apps.length;

  const appliedSorted = useMemo(() => {
    return [...apps].sort((a, b) => {
      const atA = a.appliedAt?.toMillis?.() ?? 0;
      const atB = b.appliedAt?.toMillis?.() ?? 0;
      return atB - atA;
    });
  }, [apps]);

  // -------------------------
  // Not logged in
  // -------------------------
  if (!user) {
    return (
      <div className="mx-auto max-w-5xl p-6 space-y-4">
        <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
        <p className="text-muted-foreground">Please login to continue.</p>
        <Button asChild>
          <Link href="/login?redirect=/candidate/dashboard">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            Track your applications and manage your profile.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/jobs">Browse jobs</Link>
          </Button>
          <Button asChild>
            <Link href="/candidate/profile">Edit profile</Link>
          </Button>
        </div>
      </div>

      {/* Profile summary */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Profile</div>
            <div className="mt-1 font-semibold text-lg">
              {profile?.name || user.email || "Candidate"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Phone: {profile?.phone || "—"} • Location:{" "}
              {profile?.location || "—"}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-muted-foreground">Applied</div>
            <div className="text-2xl font-bold">{appliedCount}</div>
          </div>
        </div>
      </Card>

      {/* Tabs (upgrade-ready) */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "rounded-full border px-4 py-2 text-sm",
                active
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white hover:bg-gray-50",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <Card className="p-5">
        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : tab !== "applied" ? (
          <div className="py-10 text-center text-muted-foreground">
            This section will be added after MVP.
          </div>
        ) : appliedSorted.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            You haven’t applied to any jobs yet.
            <div className="mt-4">
              <Button asChild>
                <Link href="/jobs">Explore jobs</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {appliedSorted.map((row) => (
              <div
                key={row.applicationId}
                className="rounded-xl border p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="font-semibold">{row.jobTitle || "Job"}</div>
                  <div className="text-sm text-muted-foreground">
                    {(row.companyName || "—") + " • " + (row.location || "—")}
                  </div>

                  <div className="mt-2 text-sm">
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      Status: {row.status}
                    </span>
                    {row.appliedAt ? (
                      <span className="ml-2 text-muted-foreground">
                        Applied: {formatTs(row.appliedAt)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/jobs/${row.jobId}`}>View job</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function formatTs(ts: Timestamp) {
  try {
    const d = ts.toDate();
    return d.toLocaleString();
  } catch {
    return "—";
  }
}
