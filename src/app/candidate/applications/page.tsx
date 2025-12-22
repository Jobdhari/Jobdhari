// src/app/candidate/applications/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Non-MVP stub
 * Candidate application tracking UI is not in MVP.
 * MVP apply flow works via /apply/[id].
 */
export default function CandidateApplicationsStubPage() {
  return (
    <div className="mx-auto max-w-2xl p-8 space-y-4">
      <h1 className="text-2xl font-bold">My Applications</h1>
      <p className="text-muted-foreground">
        This page is disabled in MVP. You can still apply to jobs from the Jobs page.
      </p>

      <div className="flex gap-2">
        <Button asChild>
          <Link href="/jobs">Browse jobs</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/candidate/dashboard">Candidate dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
