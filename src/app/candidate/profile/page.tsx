/**
 * @feature Candidate Profile
 * @responsibility Candidate profile creation & update (required before apply)
 * @routes /candidate/profile
 * @files src/app/candidate/profile/page.tsx
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  CandidateProfile,
  getCandidateProfile,
  upsertCandidateProfile,
} from "@/lib/firebase/candidateProfileService";

export default function CandidateProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/jobs";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [preferredRoles, setPreferredRoles] = useState(""); // comma-separated
  const [experienceLevel, setExperienceLevel] =
    useState<CandidateProfile["experienceLevel"]>("fresher");

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        router.replace(
          `/login?redirect=/candidate/profile?redirect=${encodeURIComponent(
            redirect
          )}`
        );
        return;
      }

      // Load existing profile if any
      const existing = await getCandidateProfile(u.uid);
      if (existing) {
        setFullName(existing.fullName || "");
        setPhone(existing.phone || "");
        setCurrentLocation(existing.currentLocation || "");
        setPreferredRoles((existing.preferredRoles || []).join(", "));
        setExperienceLevel(existing.experienceLevel || "fresher");
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router, redirect]);

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading profile…</div>;
  }

  async function onSave() {
    if (!user) return;

    const name = fullName.trim();
    const loc = currentLocation.trim();
    const roles = preferredRoles
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    if (!name) return toast.error("Full name is required.");
    if (!loc) return toast.error("Current location is required.");
    if (roles.length === 0)
      return toast.error("Add at least 1 preferred role.");

    setSaving(true);
    const t = toast.loading("Saving profile…");
    try {
      await upsertCandidateProfile(user.uid, {
        fullName: name,
        phone: phone.trim() || undefined,
        currentLocation: loc,
        preferredRoles: roles,
        experienceLevel,
      });
      toast.success("Profile saved.", { id: t });
      router.push(redirect);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to save profile.", { id: t });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Candidate Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Create your profile to apply for jobs.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Full name *</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Phone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Current location *</label>
          <Input
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
            placeholder="e.g., Vijayawada"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Preferred roles *</label>
          <Input
            value={preferredRoles}
            onChange={(e) => setPreferredRoles(e.target.value)}
            placeholder="e.g., Sales Executive, Delivery, Accountant"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Separate roles with commas.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Experience level</label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value as any)}
          >
            <option value="fresher">Fresher</option>
            <option value="1-3">1–3 years</option>
            <option value="3-5">3–5 years</option>
            <option value="5+">5+ years</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(redirect)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
