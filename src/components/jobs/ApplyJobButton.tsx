"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/auth";
import {
  createJobApplication,
  getUserAppliedJobIds,
} from "@/lib/firebase/applicationService";
import { Button } from "@/components/ui/button";

type ApplyJobButtonProps = {
  jobId: string;
  title: string;
  companyName?: string;
  location?: string;
  category?: string;
};

export default function ApplyJobButton({
  jobId,
  title,
  companyName,
  location,
  category,
}: ApplyJobButtonProps) {
  const router = useRouter();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Load whether the current user already applied
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setHasApplied(false);
        return;
      }

      try {
        const appliedIds = await getUserAppliedJobIds(user.uid);
        setHasApplied(appliedIds.has(jobId));
      } catch (e) {
        console.error("Error checking applications", e);
      }
    });

    return () => unsub();
  }, [jobId]);

  const handleClick = async () => {
    const user = auth.currentUser;

    // ───────────────────────────────────────
    // 1. Not logged in → send to signup
    // ───────────────────────────────────────
    if (!user) {
      const current =
        window.location.pathname + window.location.search;
      router.push(
        `/signup?role=candidate&redirect=${encodeURIComponent(current)}`
      );
      return;
    }

    // Already applied → nothing to do
    if (hasApplied || isApplying) return;

    // ───────────────────────────────────────
    // 2. Logged in → create / overwrite application
    // ───────────────────────────────────────
    try {
      setIsApplying(true);

      await createJobApplication(user.uid, {
        id: jobId,
        title,
        companyName,
        location,
        category,
      });

      setHasApplied(true);
    } catch (e) {
      console.error("Error applying to job", e);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={hasApplied ? "outline" : "default"}
      onClick={handleClick}
      disabled={isApplying || hasApplied}
    >
      {hasApplied ? "Applied" : isApplying ? "Applying..." : "Apply"}
    </Button>
  );
}
