// src/app/profile/page.tsx
"use client";

import CandidateProfileForm from "@/components/candidate/CandidateProfileForm";

export default function ProfilePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-8">
      <CandidateProfileForm />
    </div>
  );
}
