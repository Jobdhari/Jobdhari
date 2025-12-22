import { Suspense } from "react";
import JobsPageClient from "./JobsPageClient";

export const dynamic = "force-dynamic";

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading jobs…</div>}>
      <JobsPageClient />
    </Suspense>
  );
}
