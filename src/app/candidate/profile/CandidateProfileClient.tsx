"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";

import { auth } from "@/lib/firebase";
import {
  getCandidateProfile,
} from "@/lib/firebase/candidateProfileService";

import { Button } from "@/components/ui/button";

export default function CandidateProfileClient() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{
    fullName?: string;
    phone?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace("/login?role=candidate");
        return;
      }

      setUser(u);

      try {
        const p = await getCandidateProfile(u.uid);
        setProfile(p);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  if (loading) {
    return <div className="p-6">Loading profile…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Candidate Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal and professional details
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Name</div>
          <div className="font-medium">
            {profile?.fullName || "Not provided"}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Email</div>
          <div className="font-medium">
            {user?.email || "—"}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Phone</div>
          <div className="font-medium">
            {profile?.phone || "Not provided"}
          </div>
        </div>

        <Button
          onClick={() => router.push("/candidate/profile/edit")}
          className="mt-4"
        >
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
