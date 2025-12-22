"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { hasAppliedToJob } from "@/lib/firebase/applicationService";
import { Button } from "@/components/ui/button";

type ApplyJobButtonProps = {
  jobId: string;
};

export default function ApplyJobButton({ jobId }: ApplyJobButtonProps) {
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        if (!cancelled) {
          setAlreadyApplied(false);
          setChecking(false);
        }
        return;
      }

      setChecking(true);
      try {
        const ok = await hasAppliedToJob({ jobId, userId: user.uid });
        if (!cancelled) setAlreadyApplied(ok);
      } catch (e) {
        console.error("Error checking applied status", e);
        if (!cancelled) setAlreadyApplied(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [jobId]);

  if (checking) {
    return (
      <Button size="sm" disabled>
        Checking…
      </Button>
    );
  }

  if (alreadyApplied) {
    return (
      <Button
        size="sm"
        disabled
        className="bg-green-600 text-white hover:bg-green-600"
      >
        Applied
      </Button>
    );
  }

  return (
    <Button size="sm" asChild>
      <Link href={`/apply/${jobId}`}>Apply</Link>
    </Button>
  );
}
