"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import {
  applyToJob,
  JobSummaryForApplication,
} from "@/lib/firebase/applicationService";

export default function ApplyJobButton({
  job,
  applied,
  onApplied,
}: {
  job: JobSummaryForApplication;
  applied: boolean;
  onApplied?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const label = useMemo(() => {
    if (applied) return "Applied";
    return loading ? "Applying..." : "Apply";
  }, [applied, loading]);

  const disabled = applied || loading;

  const handleApply = async () => {
    const user = auth.currentUser;

    if (!user) {
      toast.error("Please login to apply");
      return;
    }

    try {
      setLoading(true);

      const res = await applyToJob({
        jobId: job.id,
        userId: user.uid,
      });

      toast.success(`Applied ✅ (${res.applicationId})`);
      onApplied?.();
    } catch (err: any) {
      console.error("Apply failed:", err);
      toast.error(err?.message || "Missing or insufficient permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleApply}
      disabled={disabled}
      className={`px-3 py-2 text-sm rounded-lg ${
        disabled
          ? "bg-gray-200 text-gray-700 cursor-not-allowed"
          : "bg-orange-500 text-white hover:bg-orange-600"
      }`}
    >
      {label}
    </button>
  );
}
