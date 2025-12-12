"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/auth";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

type StoredRole = "employer" | "recruiter" | "admin" | null;

export default function ChooseRolePage() {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [role, setRole] = useState<StoredRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Watch auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  // 2) Load existing role from Firestore
  useEffect(() => {
    const loadRole = async () => {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as any;
          const existingRole = (data.role ?? null) as StoredRole;

          if (existingRole) {
            setRole(existingRole);

            // Already has a role → send to relevant dashboard
            if (existingRole === "employer") {
              router.replace("/employer/dashboard");
              return;
            }
            if (existingRole === "recruiter") {
              router.replace("/recruiter/dashboard");
              return;
            }
            if (existingRole === "admin") {
              router.replace("/admin");
              return;
            }
          }
        }
      } catch (err) {
        console.error("Error loading user role:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [firebaseUser, router]);

  const saveRole = async (
    newRole: StoredRole,
    extra: { employerType?: "company" | "consultant" } = {}
  ) => {
    if (!firebaseUser || !newRole) return;
    setError(null);

    try {
      setSaving(true);

      const ref = doc(db, "users", firebaseUser.uid);
      await setDoc(
        ref,
        {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: newRole,
          employerType: extra.employerType ?? null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setRole(newRole);

      if (newRole === "employer") {
        router.replace("/employer/dashboard");
      } else if (newRole === "recruiter") {
        router.replace("/recruiter/dashboard");
      } else if (newRole === "admin") {
        router.replace("/admin");
      }
    } catch (err: any) {
      console.error("Error saving role:", err);
      setError(err.message ?? "Could not save role. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading your account…</p>
      </main>
    );
  }

  if (!firebaseUser) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <h1 className="text-lg font-semibold mb-2">Login required</h1>
          <p className="text-gray-500 text-sm mb-4">
            Please log in before choosing your role.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 md:px-12 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-semibold mb-2">Choose Your Role</h1>
        <p className="text-gray-500 text-sm mb-4">
          Tell JobDhari how you plan to use this account. You can change this
          later if needed.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <p className="text-xs text-gray-400 mb-4">
          Logged in as <span className="font-medium">{firebaseUser.email}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Candidate option – just sends them to candidate area (no role needed) */}
          <button
            type="button"
            onClick={() => router.push("/candidate/dashboard")}
            className="text-left border border-gray-200 rounded-xl p-4 hover:border-orange-400 hover:shadow-sm transition bg-white"
          >
            <h2 className="font-semibold text-sm mb-1">I&apos;m a Candidate</h2>
            <p className="text-xs text-gray-500">
              I&apos;m looking for jobs and want to apply to openings.
            </p>
          </button>

          {/* Employer – company */}
          <button
            type="button"
            disabled={saving}
            onClick={() => saveRole("employer", { employerType: "company" })}
            className="text-left border border-gray-200 rounded-xl p-4 hover:border-orange-400 hover:shadow-sm transition bg-white disabled:opacity-60"
          >
            <h2 className="font-semibold text-sm mb-1">
              Employer – Company
            </h2>
            <p className="text-xs text-gray-500">
              I hire for my own company&apos;s openings.
            </p>
          </button>

          {/* Employer – consultant */}
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              saveRole("employer", { employerType: "consultant" })
            }
            className="text-left border border-gray-200 rounded-xl p-4 hover:border-orange-400 hover:shadow-sm transition bg-white disabled:opacity-60"
          >
            <h2 className="font-semibold text-sm mb-1">
              Employer – Consultant
            </h2>
            <p className="text-xs text-gray-500">
              I work at a consultancy / agency and hire for multiple companies.
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}
