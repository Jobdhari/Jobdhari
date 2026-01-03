import { Suspense } from "react";
import JobsPageClient from "@/app/jobs/JobsPageClient";

export default function CandidateJobsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading jobs…</div>}>
      <JobsPageClient />
    </Suspense>
  );
}
