// src/components/candidate/CandidateQuickApplyPrefs.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  getCandidateQuickPrefs,
  saveCandidateQuickPrefs,
} from "@/lib/firebase/candidatePrefsService";

export function CandidateQuickApplyPrefs({
  onSubmit,
}: {
  onSubmit?: (prefs: any) => void;
}) {
  const [user] = useAuthState(auth);

  // form state
  const [role, setRole] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [industry, setIndustry] = useState("");

  // ui state
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const allLocations = ["Hyderabad", "Bangalore", "Chennai", "Mumbai", "Delhi"];
  const allIndustries = ["IT", "BPO", "Manufacturing", "Healthcare", "Finance"];

  // ────────────────────────────────
  // 1) Load existing prefs (if any)
  // ────────────────────────────────
  useEffect(() => {
    const loadPrefs = async () => {
      setInitialLoading(true);
      setError(null);
      setSaved(false);

      if (!user) {
        setInitialLoading(false);
        return;
      }

      try {
        const prefs = await getCandidateQuickPrefs(user.uid);
        if (prefs) {
          setRole(prefs.preferredRole);
          setLocations(prefs.preferredLocations);
          setExperience(prefs.experienceLevel);
          setIndustry(prefs.preferredIndustry);
        }
      } catch (err) {
        console.error("🔥 Error loading quick prefs:", err);
        setError("Could not load your preferences. You can still edit & save.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadPrefs();
  }, [user]);

  // ────────────────────────────────
  // helpers
  // ────────────────────────────────
  function toggleLocation(loc: string) {
    setLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  }

  async function handleSubmit() {
    setError(null);
    setSaved(false);

    if (!user) {
      setError("Please log in to save your preferences.");
      return;
    }

    try {
      setSaving(true);

      await saveCandidateQuickPrefs(user.uid, {
        preferredRole: role,
        preferredLocations: locations,
        experienceLevel: experience,
        preferredIndustry: industry,
      });

      setSaved(true);

      if (onSubmit) {
        onSubmit({
          preferredRole: role,
          preferredLocations: locations,
          experienceLevel: experience,
          preferredIndustry: industry,
        });
      }
    } catch (err) {
      console.error("🔥 Error saving quick prefs:", err);
      setError("Could not save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm text-sm text-muted-foreground">
        Loading your preferences…
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold">Quick Job Preferences</h2>

      {!user && (
        <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 px-3 py-2 rounded">
          You&apos;re not logged in. You can fill this form, but it will only be
          saved once you log in.
        </p>
      )}

      {/* ROLE INPUT */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Preferred Job Role</label>
        <input
          className="border rounded px-3 py-2 w-full"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Senior IT Recruiter"
        />
      </div>

      {/* LOCATIONS MULTI SELECT */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Preferred Locations</label>

        <div className="flex flex-wrap gap-2">
          {allLocations.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => toggleLocation(loc)}
              className={`px-3 py-1 rounded-full border text-sm ${
                locations.includes(loc)
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        {locations.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Selected: {locations.join(", ")}
          </p>
        )}
      </div>

      {/* EXPERIENCE */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Experience Level</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        >
          <option value="">Select…</option>
          <option value="Fresher">Fresher</option>
          <option value="0-2 years">0–2 years</option>
          <option value="2-5 years">2–5 years</option>
          <option value="5+ years">5+ years</option>
        </select>
      </div>

      {/* INDUSTRY */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Preferred Industry</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option value="">Select…</option>
          {allIndustries.map((ind) => (
            <option key={ind}>{ind}</option>
          ))}
        </select>
      </div>

      {/* STATUS + SAVE BUTTON */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded">
          {error}
        </p>
      )}

      {saved && !error && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded">
          Preferences saved!
        </p>
      )}

      <Button onClick={handleSubmit} className="w-full" disabled={saving}>
        {saving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
}
