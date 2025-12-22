/**
 * @feature Candidate Entry
 * @responsibility One entry page for candidate. Decides where to go.
 * @routes /candidate
 * @files src/app/candidate/page.tsx
 */


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getCandidateProfile } from "@/lib/firebase/candidateProfileService";

/**
 * @feature Candidate Entry
 * @responsibility One entry page for candidate. Decides where to go.
 * @routes /candidate
 * @files src/app/candidate/page.tsx
 */

export default function CandidateEntryPage() {
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      // 1) Not logged in → login first, come back to /candidate
      if (!user) {
        router.replace("/login?redirect=/candidate");
        return;
      }

      // 2) Logged in → check profile
      const profile = await getCandidateProfile(user.uid);

      // 3) No profile → force profile creation
      if (!profile) {
        router.replace("/candidate/profile?redirect=/candidate/dashboard");
        return;
      }

      // 4) Profile exists → dashboard
      router.replace("/candidate/dashboard");
    });

    return () => unsub();
  }, [auth, router]);

  return (
    <div className="p-8 text-muted-foreground">
      Loading candidate workspace…
    </div>
  );
}
