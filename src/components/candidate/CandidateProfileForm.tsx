"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { CandidateProfile, JobSearchStatus } from "@/lib/types/candidate";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const splitCsv = (value: string): string[] =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

export default function CandidateProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [summary, setSummary] = useState("");

  const [targetIndustries, setTargetIndustries] = useState("");
  const [targetRoles, setTargetRoles] = useState("");
  const [targetCompanies, setTargetCompanies] = useState("");
  const [targetLocations, setTargetLocations] = useState("");

  const [preferredWorkType, setPreferredWorkType] = useState<
    "remote" | "onsite" | "hybrid" | ""
  >("");

  const [jobSearchStatus, setJobSearchStatus] =
    useState<JobSearchStatus>("actively-looking");

  const [jobAlerts, setJobAlerts] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return;

      try {
        const ref = doc(db, "candidates", auth.currentUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const profile = snap.data() as CandidateProfile;

          setFullName(profile.fullName ?? "");
          setHeadline(profile.headline ?? "");
          setExperience(
            profile.experience !== undefined
              ? String(profile.experience)
              : ""
          );
          setLocation(profile.location ?? "");
          setSkills((profile.skills ?? []).join(", "));
          setSummary(profile.summary ?? "");

          setTargetIndustries((profile.targetIndustries ?? []).join(", "));
          setTargetRoles((profile.targetRoles ?? []).join(", "));
          setTargetCompanies((profile.targetCompanies ?? []).join(", "));
          setTargetLocations((profile.targetLocations ?? []).join(", "));

          setPreferredWorkType(profile.preferredWorkType ?? "");
          setJobSearchStatus(
            profile.jobSearchStatus ?? "actively-looking"
          );
          setJobAlerts(profile.jobAlerts ?? true);
        }
      } catch (err) {
        console.error("Error loading candidate profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;

    setSaving(true);
    try {
      const ref = doc(db, "candidates", auth.currentUser.uid);

      await updateDoc(ref, {
        fullName: fullName.trim(),
        headline: headline.trim(),
        experience: experience ? Number(experience) : undefined,
        location: location.trim(),
        preferredWorkType: preferredWorkType || undefined,
        skills: splitCsv(skills),
        summary: summary.trim(),

        targetIndustries: splitCsv(targetIndustries),
        targetRoles: splitCsv(targetRoles),
        targetCompanies: splitCsv(targetCompanies),
        targetLocations: splitCsv(targetLocations),

        jobSearchStatus,
        jobAlerts,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading profile…</div>;
  }

  return (
    <div className="space-y-6">
      <Input
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <Input
        placeholder="Headline (e.g. Senior Recruiter)"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
      />

      <Input
        placeholder="Total experience (years)"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
      />

      <Input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <Input
        placeholder="Skills (comma separated)"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
      />

      <Input
        placeholder="Professional summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />

      <Input
        placeholder="Target industries"
        value={targetIndustries}
        onChange={(e) => setTargetIndustries(e.target.value)}
      />

      <Input
        placeholder="Target roles"
        value={targetRoles}
        onChange={(e) => setTargetRoles(e.target.value)}
      />

      <Input
        placeholder="Target companies"
        value={targetCompanies}
        onChange={(e) => setTargetCompanies(e.target.value)}
      />

      <Input
        placeholder="Target locations"
        value={targetLocations}
        onChange={(e) => setTargetLocations(e.target.value)}
      />

      <select
        value={preferredWorkType}
        onChange={(e) =>
          setPreferredWorkType(
            e.target.value as "remote" | "onsite" | "hybrid" | ""
          )
        }
        className="h-10 w-full rounded-md border px-3"
      >
        <option value="">Preferred work type</option>
        <option value="remote">Remote</option>
        <option value="onsite">Onsite</option>
        <option value="hybrid">Hybrid</option>
      </select>

      <select
        value={jobSearchStatus}
        onChange={(e) =>
          setJobSearchStatus(e.target.value as JobSearchStatus)
        }
        className="h-10 w-full rounded-md border px-3"
      >
        <option value="actively-looking">Actively looking</option>
        <option value="open-to-opportunities">Open to opportunities</option>
        <option value="not-looking">Not looking</option>
      </select>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={jobAlerts}
          onChange={(e) => setJobAlerts(e.target.checked)}
        />
        Receive job alerts
      </label>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-orange-500 hover:bg-orange-600"
      >
        {saving ? "Saving…" : "Save Profile"}
      </Button>
    </div>
  );
}
