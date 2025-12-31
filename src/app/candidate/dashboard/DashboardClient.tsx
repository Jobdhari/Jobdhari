"use client";

/**
 * @feature Candidate Dashboard
 * @responsibility Show candidate applications in one place
 * @routes /candidate/dashboard
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  CandidateApplication,
  getJobsLiteByIds,
  listMyApplications,
} from "@/lib/firebase/candidateApplicationsService";

import { getCandidateProfile } from "@/lib/firebase/candidateProfileService";

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
 * Profile completeness (CURRENT STAGE)
 * Only fields that actually exist today
 */
function isProfileComplete(p: any): boolean {
  const fullName = String(p?.fullName ?? p?.name ?? "").trim();
  const phone = String(p?.phone ?? "").trim();
  return fullName.length > 0 && phone.length >= 10;
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

        if (!profile || !isProfileComplete(profile)) {
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

  /* ---------- Render ---------- */

  if (!authReady || !gateReady) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Page title only – navigation comes from candidate/layout.tsx */}
      <div>
        <h1 className="text-xl font-semibold">My Applications</h1>
        <p className="text-sm text-muted-foreground">
          Jobs you have applied to.
        </p>
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

            {/* ✅ FIXED: Button + candidate jobs */}
            <div className="pt-2">
              <Button asChild>
                <Link href="/candidate/jobs">Find jobs</Link>
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

                <Badge variant="secondary">Applied</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
