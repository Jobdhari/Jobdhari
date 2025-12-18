/**
 * @feature Job Application
 * @responsibility Apply gate (auth check → profile check → read-only confirmation)
 * @routes /apply/[id]
 * @files src/app/apply/[id]/page.tsx
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { getPublicJobById } from "@/lib/firebase/publicJobById";
import type { PublicJob } from "@/lib/firebase/publicJobsService";
import { getCandidateProfile } from "@/lib/firebase/candidateProfileService";
import { hasAppliedToJob } from "@/lib/firebase/applicationService";

export default function ApplyGatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const auth = getAuth();

  const jobId = params?.id as string;

  const [job, setJob] = useState<PublicJob | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  /* -------------------------
     Auth listener
  -------------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, [auth]);

  /* -------------------------
     Load job + profile
  -------------------------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!jobId) return;

      setLoading(true);
      try {
        const j = await getPublicJobById(jobId);
        if (cancelled) return;
        setJob(j);

        const u = auth.currentUser;
        if (!u) return;

        const profile = await getCandidateProfile(u.uid);
        if (cancelled) return;
        setHasProfile(!!profile);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [jobId, auth]);

  /* -------------------------
     Loading
  -------------------------- */
  if (loading) {
    return (
      <div className="p-8 text-muted-foreground">
        Checking application…
      </div>
    );
  }

  /* -------------------------
     Job missing
  -------------------------- */
  if (!job) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">Job not available</h1>
        <p className="mt-2 text-muted-foreground">
          This job may be closed or unpublished.
        </p>
        <Button className="mt-4" onClick={() => router.push("/jobs")}>
          Browse jobs
        </Button>
      </div>
    );
  }

  /* -------------------------
     Not logged in
  -------------------------- */
  if (!user) {
    router.replace(`/login?redirect=/apply/${jobId}`);
    return null;
  }

  /* -------------------------
     No profile
  -------------------------- */
  if (!hasProfile) {
    router.replace(`/candidate/profile?redirect=/apply/${jobId}`);
    return null;
  }

  /* -------------------------
     READ-ONLY confirmation
  -------------------------- */
  return (
    <div className="p-8 max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Application submitted</h1>

      <p className="text-muted-foreground">
        You have already applied to{" "}
        <span className="font-medium text-foreground">
          {job.title}
        </span>.
      </p>

      <Button onClick={() => router.push(`/jobs/${jobId}`)}>
        Back to job
      </Button>
    </div>
  );
}
