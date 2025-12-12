// src/app/candidate/jobs/page.tsx

import { redirect } from "next/navigation";

export default function CandidateJobsPage() {
  // For now, just send candidates to the main jobs listing
  redirect("/jobs");
  return null;
}
