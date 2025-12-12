"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { db, auth } from "@/lib/firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ApplyButton({ jobId, resumeURL }: { jobId: string; resumeURL: string | null }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = auth.currentUser;

  const apply = async () => {
    if (!user) {
      return router.push("/candidate/login");
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "applications"), {
        jobId,
        candidateId: user.uid,
        resumeURL,
        message: "",
        status: "submitted",
        appliedAt: new Date().toISOString()
      });

      router.push("/candidate/applications");

    } catch (err) {
      console.error(err);
      alert("Error applying. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={apply} disabled={loading} className="w-full bg-brand-blue text-white">
      {loading ? "Applying..." : "Apply with Resume"}
    </Button>
  );
}
