import { Suspense } from "react";
import CandidateProfileClient from "./CandidateProfileClient";

export const dynamic = "force-dynamic";

export default function CandidateProfilePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading profile…</div>}>
      <CandidateProfileClient />
    </Suspense>
  );
}
