// src/app/employer/create-job/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Non-MVP route stub
 * This page exists only to keep build green.
 * Use /employer/post-job for MVP job creation.
 */
export default function EmployerCreateJobStubPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Create Job</h1>
      <p className="text-muted-foreground">
        This page is not used in MVP. Please use the Employer dashboard to post a job.
      </p>

      <Button onClick={() => router.push("/employer/post-job")}>
        Go to Post Job
      </Button>
    </div>
  );
}
