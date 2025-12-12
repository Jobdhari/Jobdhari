// src/components/candidate/CandidateProfileForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "@/lib/firebase/auth";
import { saveCandidateProfile, getCandidateProfile } from "@/lib/firebase/candidateService";
import type { CandidateProfile } from "@/lib/types/candidate";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CandidateProfileForm() {
  const [user] = useAuthState(auth);

  // ─────────────────────
  // Form state
  // ─────────────────────
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [preferredWorkType, setPreferredWorkType] = useState("remote");
  const [skills, setSkills] = useState("");
  const [summary, setSummary] = useState("");

  // Smart-match fields
  const [targetIndustries, setTargetIndustries] = useState("");
  const [targetRoles, setTargetRoles] = useState("");
  const [targetCompanies, setTargetCompanies] = useState("");
  const [targetLocations, setTargetLocations] = useState("");
  const [jobSearchStatus, setJobSearchStatus] = useState("actively-looking");
  const [jobAlerts, setJobAlerts] = useState(true);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────
  // Load existing profile from Firestore
  // ─────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getCandidateProfile(user.uid);
        if (!profile) {
          setIsLoading(false);
          return;
        }

        setFullName(profile.fullName ?? "");
        setHeadline(profile.headline ?? "");
        setExperience(profile.experience?.toString() ?? "");
        setLocation(profile.location ?? "");
        setPreferredWorkType(profile.preferredWorkType ?? "remote");
        setSkills((profile.skills ?? []).join(", "));

        setSummary(profile.summary ?? "");

        setTargetIndustries((profile.targetIndustries ?? []).join(", "));
        setTargetRoles((profile.targetRoles ?? []).join(", "));
        setTargetCompanies((profile.targetCompanies ?? []).join(", "));
        setTargetLocations((profile.targetLocations ?? []).join(", "));

        setJobSearchStatus(profile.jobSearchStatus ?? "actively-looking");
        setJobAlerts(profile.jobAlerts ?? true);
      } catch (err) {
        console.error("Error loading candidate profile", err);
        setError("Could not load profile. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // ─────────────────────
  // Submit handler
  // ─────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) {
      setError("You must be logged in as a candidate to save your profile.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const data: Partial<CandidateProfile> = {
        uid: user.uid,
        email: user.email,
        fullName: fullName.trim(),
        headline: headline.trim(),
        experience: experience ? Number(experience) : undefined,
        location: location.trim(),
        preferredWorkType,
        skills: splitCsv(skills),
        summary: summary.trim(),

        targetIndustries: splitCsv(targetIndustries),
        targetRoles: splitCsv(targetRoles),
        targetCompanies: splitCsv(targetCompanies),
        targetLocations: splitCsv(targetLocations),

        jobSearchStatus,
        jobAlerts,
        // resumeUrl will be added later when Storage is enabled
      };

      await saveCandidateProfile(user.uid, data);
      setMessage("Profile saved successfully.");
    } catch (err) {
      console.error("Error saving candidate profile", err);
      setError("Could not save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="mt-8 text-center text-sm text-muted-foreground">
        Please log in as a candidate to view your dashboard.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8 text-center text-sm text-muted-foreground">
        Loading your profile…
      </div>
    );
  }

  // ─────────────────────
  // UI
  // ─────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 max-w-4xl mx-auto pb-12"
    >
      <div>
        <h2 className="text-xl font-semibold mb-2">Candidate Profile</h2>
        <p className="text-sm text-muted-foreground">
          Keep your profile updated so recruiters on JobDhari can
          find you for the best roles.
        </p>
      </div>

      {message && (
        <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Sri Krishna"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Headline (e.g. Senior IT Recruiter)
          </label>
          <Input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Senior IT Recruiter"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Experience (years)
            </label>
            <Input
              type="number"
              min={0}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Location (City, PIN)
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Hyderabad, 500081"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Preferred Work Type
            </label>
            <Select
              value={preferredWorkType}
              onValueChange={setPreferredWorkType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="onsite">Onsite</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Skills (comma separated)
            </label>
            <Input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Sourcing, Screening, C2C, LinkedIn"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            About / Summary
          </label>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            placeholder="Short summary about you, what roles you are looking for, etc."
          />
        </div>
      </section>

      {/* Smart-match preferences */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Job Preferences</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Target Industries (comma separated)
            </label>
            <Input
              value={targetIndustries}
              onChange={(e) => setTargetIndustries(e.target.value)}
              placeholder="IT Services, BPO, Product, Startup"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Target Roles / Titles (comma separated)
            </label>
            <Input
              value={targetRoles}
              onChange={(e) => setTargetRoles(e.target.value)}
              placeholder="US IT Recruiter, TA Specialist, HRBP"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Dream / Target Companies
            </label>
            <Input
              value={targetCompanies}
              onChange={(e) => setTargetCompanies(e.target.value)}
              placeholder="Amazon, Infosys, Iplace"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Preferred Locations
            </label>
            <Input
              value={targetLocations}
              onChange={(e) => setTargetLocations(e.target.value)}
              placeholder="Hyderabad, Bangalore, Pune"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Job Search Status
            </label>
            <Select
              value={jobSearchStatus}
              onValueChange={setJobSearchStatus}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actively-looking">
                  Actively looking
                </SelectItem>
                <SelectItem value="open">
                  Open to good opportunities
                </SelectItem>
                <SelectItem value="not-looking">
                  Not looking right now
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 mt-7">
            <input
              id="job-alerts"
              type="checkbox"
              className="h-4 w-4"
              checked={jobAlerts}
              onChange={(e) => setJobAlerts(e.target.checked)}
            />
            <label htmlFor="job-alerts" className="text-sm text-muted-foreground">
              Send me job alerts & role recommendations on JobDhari
            </label>
          </div>
        </div>
      </section>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save Profile"}
        </Button>
      </div>

      {/* Note about resume – future work */}
      <p className="text-xs text-muted-foreground pt-4">
        Resume upload & parsing will be added once Firebase Storage is enabled.
      </p>
    </form>
  );
}
