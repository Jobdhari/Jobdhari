// src/app/quick-profile/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CandidateQuickApplyPrefs } from "@/components/candidate/CandidateQuickApplyPrefs";
import { Button } from "@/components/ui/button";

export default function QuickProfilePage() {
  const router = useRouter();

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Quick Profile</h1>
          <p className="text-sm text-muted-foreground">
            Tell JobDhari your preferred roles & locations so we can match you
            to better jobs.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push("/jobs")}
          className="whitespace-nowrap"
        >
          Back to Jobs
        </Button>
      </header>

      <CandidateQuickApplyPrefs
        onSubmit={() => {
          // For now just stay on this page.
          // Later we can auto-redirect based on "came from apply" flag.
          console.log("Quick profile saved");
        }}
      />
    </main>
  );
}
