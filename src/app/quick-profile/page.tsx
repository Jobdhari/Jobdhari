"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CandidateQuickApplyPrefs from "@/components/candidate/CandidateQuickApplyPrefs";
import { Button } from "@/components/ui/button";

export default function QuickProfilePage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Quick Profile</h1>
        <p className="text-sm text-muted-foreground">
          Set your quick-apply preferences to speed up applications.
        </p>
      </div>

      <CandidateQuickApplyPrefs />

      <div className="flex justify-end">
        <Button
          onClick={() => router.push("/candidate/dashboard")}
          className="bg-orange-500 hover:bg-orange-600"
        >
          Done
        </Button>
      </div>
    </div>
  );
}
