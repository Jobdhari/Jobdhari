// src/app/candidate/page.tsx
"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/auth";
import CandidateProfileForm from "@/components/candidate/CandidateProfileForm";
import ResumeUploader from "@/components/candidate/ResumeUploader";

export default function CandidatePage() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">Checking login…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-red-600">
          Please log in as a candidate to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          Candidate Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Keep your profile and resume updated so recruiters on JobDhari
          can find you for the best roles.
        </p>
      </header>

      <CandidateProfileForm userId={user.uid} />
      <ResumeUploader userId={user.uid} />
    </div>
  );
}
