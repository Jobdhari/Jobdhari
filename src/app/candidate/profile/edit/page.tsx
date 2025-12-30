"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  getCandidateProfile,
  upsertCandidateProfile,
} from "@/lib/firebase/candidateProfileService";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function EditCandidateProfilePage() {
  const router = useRouter();

  const [uid, setUid] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔐 Ensure user is logged in + load profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login?role=candidate");
        return;
      }

      setUid(user.uid);

      const profile = await getCandidateProfile(user.uid);
      if (profile) {
        setName(profile.fullName ?? "");
        setPhone(profile.phone ?? "");
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  async function handleSave() {
    if (!uid) return;

    setSaving(true);
    try {
      await upsertCandidateProfile(uid, { fullName: name, phone });
      toast.success("Profile updated");
      router.push("/candidate/profile");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Edit Profile</h1>

        <Input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </Card>
    </div>
  );
}
