"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { getUserAppliedJobIds } from "@/lib/firebase/applicationService";
import { Button } from "@/components/ui/button";

type ApplyJobButtonProps = {
  jobId: string;
};

export default function ApplyJobButton({ jobId }: ApplyJobButtonProps) {
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checking, setChecking] = useState(true);

  /* =========================
     Auto-refresh applied state
     (fixes post-apply redirect)
  ========================= */
  useEffect(() => {
    let alive = true;

    async function refresh(userId: string) {
      setChecking(true);
      try {
        const appliedIds = await getUserAppliedJobIds(userId);

        // 🔍 TEMP DEBUG LOGS
        console.log("[ApplyJobButton] jobId prop =", jobId);
        console.log(
          "[ApplyJobButton] appliedIds =",
          Array.from(appliedIds)
        );

        if (!alive) return;
        setAlreadyApplied(appliedIds.has(jobId));
      } catch (e) {
        console.error("Error checking applied jobs", e);
      } finally {
        if (alive) setChecking(false);
      }
    }

    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) {
        setAlreadyApplied(false);
        setChecking(false);
        return;
      }

      // Initial check
      refresh(user.uid);

      // Re-check when user comes back to tab or after redirect
      const onFocus = () => refresh(user.uid);
      window.addEventListener("focus", onFocus);

      return () => {
        window.removeEventListener("focus", onFocus);
      };
    });

    return () => {
      alive = false;
      unsub();
    };
  }, [jobId]);

  /* =========================
     UI states
  ========================= */
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
