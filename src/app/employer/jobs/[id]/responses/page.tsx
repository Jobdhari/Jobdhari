"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { listApplicationsForJob, JobApplication } from "@/lib/firebase/applicationService";
import { getCandidateProfile } from "@/lib/firebase/candidateProfileService";

export default function EmployerJobResponsesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    const run = async () => {
      const user = getAuth().currentUser;
      if (!user) {
        router.push("/employer/login?redirect=" + encodeURIComponent(`/employer/jobs/${jobId}/responses`));
        return;
      }

      setLoading(true);
      try {
        const rows = await listApplicationsForJob(jobId);
        setApps(rows);

        // Best-effort profile fetch (MVP)
        const map: Record<string, any> = {};
        for (const a of rows) {
          try {
            map[a.userId] = await getCandidateProfile(a.userId);
          } catch {
            map[a.userId] = null;
          }
        }
        setProfiles(map);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) run();
  }, [jobId, router]);

  return (
    <div className="p-6 max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Responses</h1>
        <Button variant="outline" onClick={() => router.push("/employer/dashboard")}>
          Back to dashboard
        </Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : apps.length === 0 ? (
        <div className="text-muted-foreground">No applications yet.</div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => {
            const p = profiles[a.userId];
            return (
              <div key={a.id} className="rounded-xl border bg-white p-4">
                <div className="font-semibold">Candidate: {a.userId}</div>
                <div className="text-sm text-muted-foreground">Status: {a.status}</div>

                {p ? (
                  <div className="mt-2 text-sm">
                    <div><span className="font-medium">Name:</span> {p.fullName || p.name || "—"}</div>
                    <div><span className="font-medium">Phone:</span> {p.phone || "—"}</div>
                    <div><span className="font-medium">Location:</span> {p.location || "—"}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-muted-foreground">Profile not available.</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
