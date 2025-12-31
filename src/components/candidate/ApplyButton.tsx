"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { applyToJob } from "@/lib/firebase/applicationService";

export default function ApplyButton({
  jobId,
  resumeURL,
}: {
  jobId: string;
  resumeURL: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function apply() {
    const user = auth.currentUser;

    if (!user) {
      router.push("/login?role=candidate&redirect=/candidate/jobs");
      return;
    }

    try {
      setLoading(true);

      await applyToJob({
        userId: user.uid,
        jobId,
        resumeURL: resumeURL ?? null,
      });

      // ✅ canonical landing
      router.push("/candidate/dashboard?applied=1");
    } catch (err) {
      console.error(err);
      alert("Error applying. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={apply}
      disabled={loading}
      className="w-full bg-brand-blue text-white"
    >
      {loading ? "Applying..." : "Apply with Resume"}
    </Button>
  );
}
