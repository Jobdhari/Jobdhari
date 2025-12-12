// src/app/apply-wizard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import {
  TOP_LOCATIONS_IN_INDIA,
  POPULAR_COLLEGES,
  INDUSTRIES_OR_DOMAINS,
  filterSuggestions,
} from "@/lib/data/applyWizardOptions";

import {
  createJobApplication,
  JobSummaryForApplication,
} from "@/lib/firebase/applicationService";

import { CANDIDATE_COLLECTION } from "@/lib/firebase/userPreferences";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────
// Data we collect in this wizard
// ─────────────────────────────────────

type WizardAnswers = {
  preferredRole: string;
  preferredLocations: string[]; // multiple
  workType: "remote" | "onsite" | "hybrid" | "";
  experienceYears: string;
  highestEducation: string;
  college: string;
  industry: string;
};

const EMPTY_ANSWERS: WizardAnswers = {
  preferredRole: "",
  preferredLocations: [],
  workType: "",
  experienceYears: "",
  highestEducation: "",
  college: "",
  industry: "",
};

type ChatStep = {
  id: string;
  render: () => React.ReactNode;
  canContinue: () => boolean;
};

export default function ApplyWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user] = useAuthState(auth);

  const [answers, setAnswers] = useState<WizardAnswers>(EMPTY_ANSWERS);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Job info passed from Apply button
  const jobId = searchParams.get("jobId");
  const jobTitle = searchParams.get("jobTitle") ?? "Job";
  const companyName = searchParams.get("company") ?? "Company not specified";
  const jobLocation = searchParams.get("jobLoc") ?? "";
  const jobCategory = searchParams.get("jobCat") ?? "";

  // if user is not logged in, send back to jobs
  useEffect(() => {
    if (user === null) {
      router.replace("/jobs");
    }
  }, [user, router]);

  // Try to pre-fill from candidate profile (optional)
  useEffect(() => {
    async function loadExistingPrefs() {
      if (!user) return;

      try {
        const ref = doc(db, CANDIDATE_COLLECTION, user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as any;
          const prefs = data.jobPreferences || {};

          setAnswers((prev) => ({
            ...prev,
            preferredRole: prefs.preferredRole || prev.preferredRole,
            preferredLocations:
              prefs.preferredLocations || prev.preferredLocations,
            workType: prefs.workType || prev.workType,
            experienceYears: prefs.experienceYears || prev.experienceYears,
            highestEducation: prefs.highestEducation || prev.highestEducation,
            college: prefs.college || prev.college,
            industry: prefs.industry || prev.industry,
          }));
        }
      } catch (error) {
        console.error("Error preloading job preferences:", error);
      }
    }

    loadExistingPrefs();
  }, [user]);

  // ─────────────────────────────────────
  // Steps configuration
  // ─────────────────────────────────────

  const steps: ChatStep[] = [
    {
      id: "intro",
      render: () => (
        <BotMessage>
          Hi! 🎉 Let’s quickly tune your profile so recruiters on JobDhari can
          find you faster. We’ll finish in under 2 minutes.
        </BotMessage>
      ),
      canContinue: () => true,
    },
    {
      id: "preferredRole",
      render: () => (
        <>
          <BotMessage>
            What kind of role are you mainly looking for right now? (e.g.
            <b> Senior IT Recruiter, TA Lead, HRBP</b>)
          </BotMessage>
          <UserTextInput
            placeholder="e.g. Senior IT Recruiter"
            value={answers.preferredRole}
            onChange={(val) =>
              setAnswers((a) => ({ ...a, preferredRole: val }))
            }
          />
        </>
      ),
      canContinue: () => answers.preferredRole.trim().length > 2,
    },
    {
      id: "locations",
      render: () => (
        <>
          <BotMessage>
            Great. Which locations would you prefer? You can pick multiple.
          </BotMessage>
          <LocationSelector
            selected={answers.preferredLocations}
            onChange={(selected) =>
              setAnswers((a) => ({ ...a, preferredLocations: selected }))
            }
          />
        </>
      ),
      canContinue: () => answers.preferredLocations.length > 0,
    },
    {
      id: "workType",
      render: () => (
        <>
          <BotMessage>What’s your preferred work type?</BotMessage>
          <OptionChips
            options={[
              { value: "remote", label: "Remote" },
              { value: "onsite", label: "Work from office" },
              { value: "hybrid", label: "Hybrid" },
            ]}
            value={answers.workType}
            onChange={(value) =>
              setAnswers((a) => ({ ...a, workType: value as any }))
            }
          />
        </>
      ),
      canContinue: () => !!answers.workType,
    },
    {
      id: "experience",
      render: () => (
        <>
          <BotMessage>
            How many years of total experience do you have?
          </BotMessage>
          <OptionChips
            options={[
              { value: "0-1", label: "0–1 years" },
              { value: "1-3", label: "1–3 years" },
              { value: "3-6", label: "3–6 years" },
              { value: "6-10", label: "6–10 years" },
              { value: "10+", label: "10+ years" },
            ]}
            value={answers.experienceYears}
            onChange={(value) =>
              setAnswers((a) => ({ ...a, experienceYears: value }))
            }
          />
        </>
      ),
      canContinue: () => !!answers.experienceYears,
    },
    {
      id: "education",
      render: () => (
        <>
          <BotMessage>What is your highest education?</BotMessage>
          <OptionChips
            options={[
              { value: "UG", label: "Graduation (UG)" },
              { value: "PG", label: "Post-Graduation (PG)" },
              { value: "Diploma", label: "Diploma" },
              { value: "Other", label: "Other" },
            ]}
            value={answers.highestEducation}
            onChange={(value) =>
              setAnswers((a) => ({ ...a, highestEducation: value }))
            }
          />
        </>
      ),
      canContinue: () => !!answers.highestEducation,
    },
    {
      id: "college",
      render: () => (
        <>
          <BotMessage>Which college / university did you study at?</BotMessage>
          <SuggestInput
            placeholder="Start typing your college name…"
            suggestionsSource={POPULAR_COLLEGES}
            value={answers.college}
            onChange={(val) => setAnswers((a) => ({ ...a, college: val }))}
          />
        </>
      ),
      canContinue: () => answers.college.trim().length > 2,
    },
    {
      id: "industry",
      render: () => (
        <>
          <BotMessage>
            Which industry / domain do you mostly work in?
          </BotMessage>
          <SuggestInput
            placeholder="e.g. IT Services, Staffing, Manufacturing…"
            suggestionsSource={INDUSTRIES_OR_DOMAINS}
            value={answers.industry}
            onChange={(val) => setAnswers((a) => ({ ...a, industry: val }))}
          />
        </>
      ),
      canContinue: () => answers.industry.trim().length > 2,
    },
    {
      id: "summary",
      render: () => (
        <BotMessage>
          Awesome! ✅ I’m saving these preferences to your profile and will use
          them to match you with better roles on JobDhari.
        </BotMessage>
      ),
      canContinue: () => true,
    },
  ];

  const currentStep = steps[step];

  // Finish: save prefs + (optionally) create application
  async function handleFinish() {
    if (!user) return;
    setLoading(true);
    setErr(null);

    try {
      // 1. Save preferences in candidate document
      const userRef = doc(db, CANDIDATE_COLLECTION, user.uid);
      await setDoc(
        userRef,
        {
          jobPreferences: {
            ...answers,
            updatedAt: new Date().toISOString(),
          },
        },
        { merge: true }
      );

      // 2. If we came from a job, create application now
      if (jobId) {
        const jobSummary: JobSummaryForApplication = {
          id: jobId,
          title: jobTitle,
          companyName,
          location: jobLocation,
          category: jobCategory,
        };

        await createJobApplication(user.uid, jobSummary);
      }

      router.push("/my-jobs");
    } catch (error) {
      console.error("Error saving preferences or applying:", error);
      setErr("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function handleNext() {
    if (step === steps.length - 1) {
      void handleFinish();
    } else if (currentStep.canContinue()) {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (step === 0 || loading) return;
    setStep((s) => s - 1);
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-1">Quick Apply Setup</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Answer a few questions so we can auto-match you to jobs. This is a
        one-time setup for faster applies.
      </p>

      <div className="border rounded-2xl bg-white shadow-sm p-4 space-y-4">
        {steps.slice(0, step + 1).map((s, index) => (
          <div key={s.id} className="space-y-2">
            {s.render()}
            {index === step && err && (
              <p className="text-xs text-red-600">{err}</p>
            )}
          </div>
        ))}

        <div className="flex justify-between pt-3 border-t mt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0 || loading}
          >
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!currentStep.canContinue() || loading}
          >
            {step === steps.length - 1
              ? loading
                ? "Finishing…"
                : jobId
                ? "Save & Apply"
                : "Save Preferences"
              : "Next"}
          </Button>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────
// Chat-style UI helpers
// ─────────────────────────────

function BotMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm">
        J
      </div>
      <div className="bg-gray-50 rounded-2xl px-3 py-2 text-sm text-gray-800">
        {children}
      </div>
    </div>
  );
}

function UserTextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="ml-10 mt-2">
      <input
        className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function OptionChips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="ml-10 mt-2 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-full text-xs border ${
            value === opt.value
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white text-gray-800 border-gray-200 hover:border-orange-400"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SuggestInput({
  value,
  onChange,
  placeholder,
  suggestionsSource,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestionsSource: string[];
}) {
  const [query, setQuery] = useState(value);
  const suggestions = filterSuggestions(suggestionsSource, query);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  return (
    <div className="ml-10 mt-2 space-y-2">
      <input
        className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
      />
      {suggestions.length > 0 && (
        <div className="border rounded-xl bg-white shadow-sm max-h-40 overflow-y-auto text-sm">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onChange(item);
                setQuery(item);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-orange-50"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LocationSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const suggestions = filterSuggestions(TOP_LOCATIONS_IN_INDIA, query);

  const toggle = (loc: string) => {
    if (selected.includes(loc)) {
      onChange(selected.filter((l) => l !== loc));
    } else {
      onChange([...selected, loc]);
    }
  };

  return (
    <div className="ml-10 mt-2 space-y-2">
      <input
        className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a city name…"
      />
      <div className="flex flex-wrap gap-2">
        {suggestions.map((loc) => {
          const active = selected.includes(loc);
          return (
            <button
              key={loc}
              type="button"
              onClick={() => toggle(loc)}
              className={`px-3 py-1 rounded-full text-xs border ${
                active
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-800 border-gray-200 hover:border-orange-400"
              }`}
            >
              {loc}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-gray-600">
          Selected: {selected.join(" • ")}
        </p>
      )}
    </div>
  );
}
