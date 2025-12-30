"use client";

/**
 * @feature Candidate Dashboard
 * @responsibility Show candidate applications in one place
 * @routes /candidate/dashboard
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  CandidateApplication,
  getJobsLiteByIds,
  listMyApplications,
} from "@/lib/firebase/candidateApplicationsService";

import {
  getCandidateProfile,
  type CandidateProfile,
} from "@/lib/firebase/candidateProfileService";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

/* ---------------- Utils ---------------- */

function formatAppliedAt(appliedAt: any): string {
  try {
    const d: Date | undefined = appliedAt?.toDate?.();
    if (!d) return "";
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

/**
 * Minimal completeness gate
 * (can expand later when resume parsing is added)
 */
function isProfileComplete(p: CandidateProfile | null): boolean {
  if (!p) return false;

  const hasName = typeof p.fullName === "string" && p.fullName.trim().length > 0;
  const hasPhone = typeof p.phone === "string" && p.phone.trim().length >= 8;
  const hasLocation =
    typeof p.currentLocation === "string" &&
    p.currentLocation.trim().length > 0;

  const hasPreferredRoles =
    Array.isArray(p.preferredRoles) && p.preferredRoles.length > 0;

  const hasExp =
    p.experienceLevel === "fresher" ||
    p.experienceLevel === "1-3" ||
    p.experienceLevel === "3-5" ||
    p.experienceLevel === "5+";

  return hasName && hasPhone && hasLocation && hasPreferredRoles && hasExp;
}

/* ---------------- Component ---------------- */

export default function DashboardClient() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [gateReady, setGateReady] = useState(false);

  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<CandidateApplication[]>([]);
  const [jobsMap, setJobsMap] = useState<Map<string, any>>(new Map());
  const [error, setError] = useState<string | null>(null);

  /* ---------- Auth listener ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  /* ---------- Auth + Profile gate ---------- */
  useEffect(() => {
    const runGate = async () => {
      if (!authReady) return;

      if (!user) {
        router.replace(
          "/login?role=candidate&redirect=/candidate/dashboard"
        );
        return;
      }

      try {
        const profile = await getCandidateProfile(user.uid);

        if (!isProfileComplete(profile)) {
          router.replace(
            "/candidate/profile/edit?redirect=/candidate/dashboard"
          );
          return;
        }

        setGateReady(true);
      } catch {
        router.replace(
          "/candidate/profile/edit?redirect=/candidate/dashboard"
        );
      }
    };

    runGate();
  }, [authReady, user, router]);

  /* ---------- Load applications ---------- */
  useEffect(() => {
    const run = async () => {
      if (!authReady || !user || !gateReady) return;

      setError(null);
      setLoading(true);

      try {
        const myApps = await listMyApplications(user.uid);
        setApps(myApps);

        const ids = myApps.map((a) => a.jobId);
        const map = await getJobsLiteByIds(ids);
        setJobsMap(map);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load your applications.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [authReady, user, gateReady]);

  const rows = useMemo(() => {
    return apps.map((a) => {
      const job = jobsMap.get(a.jobId);
      return { app: a, job };
    });
  }, [apps, jobsMap]);

  /* ---------- Logout ---------- */
  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/login?role=candidate");
    } catch {
      // no-op
    }
  }

  /* ---------- Render ---------- */

  if (!authReady || !gateReady) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">My Applications</h1>
          <p className="text-sm text-muted-foreground">
            Jobs you have applied to.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/jobs">Browse jobs</Link>
          </Button>

          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 border-destructive">
          <div className="text-sm">
            <div className="font-medium">Something went wrong</div>
            <div className="text-muted-foreground mt-1">{error}</div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">
          Loading applications…
        </div>
      ) : rows.length === 0 ? (
        <Card className="p-6">
          <div className="space-y-2">
            <div className="font-medium">No applications yet</div>
            <div className="text-sm text-muted-foreground">
              Start applying to jobs and they’ll appear here.
            </div>
            <div className="pt-2">
              <Button asChild>
                <Link href="/jobs">Find jobs</Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map(({ app, job }) => (
            <Card key={app.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-medium">
                    {job?.title ?? "Job"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(job?.companyName ?? "Company") +
                      (job?.location ? ` • ${job.location}` : "") +
                      (job?.pincode ? ` • ${job.pincode}` : "")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatAppliedAt(app.appliedAt)
                      ? `Applied on ${formatAppliedAt(app.appliedAt)}`
                      : "Applied"}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary">Applied</Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/jobs/${app.jobId}`}>View job</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
