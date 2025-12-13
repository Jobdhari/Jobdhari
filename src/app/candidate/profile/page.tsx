"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type CandidateProfile = {
  fullName: string;
  phone: string;
  city: string;
  experienceYears: string;
  role: string;
  updatedAt?: any;
  createdAt?: any;
};

const emptyProfile: CandidateProfile = {
  fullName: "",
  phone: "",
  city: "",
  experienceYears: "",
  role: "candidate",
};

export default function CandidateProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<CandidateProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1) Require login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login"); // if you have /login/candidate later, we’ll switch it
        return;
      }
      setUser(u);
      setLoading(false);

      // 2) Load existing profile (if any)
      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          setForm({
            fullName: data.fullName ?? "",
            phone: data.phone ?? "",
            city: data.city ?? "",
            experienceYears: data.experienceYears ?? "",
            role: data.role ?? "candidate",
          });
        }
      } catch (e) {
        console.error("Failed to load candidate profile", e);
      }
    });

    return () => unsub();
  }, [router]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.fullName.trim()) {
      alert("Full name is required");
      return;
    }

    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        {
          ...form,
          role: "candidate",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      alert("Profile saved ✅");
      router.push("/jobs");
    } catch (e) {
      console.error("Failed to save candidate profile", e);
      alert("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading profile…</p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 md:px-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Candidate Profile</h1>
        <p className="text-sm text-gray-600 mb-6">
          Create your profile so recruiters can find you.
        </p>

        <form
          onSubmit={onSave}
          className="space-y-4 bg-white border border-gray-200 rounded-xl p-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Krishna Potluri"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. +91 98xxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              name="city"
              value={form.city}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Hyderabad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Experience (years)</label>
            <input
              name="experienceYears"
              value={form.experienceYears}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. 3"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
