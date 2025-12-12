"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/auth";

type SignupPageProps = {
  searchParams: {
    role?: string;
    redirect?: string;
  };
};

type Role = "candidate" | "employer" | "recruiter";

export default function SignupPage({ searchParams }: SignupPageProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────
  // Determine role from URL (?role=...)
  // Defaults to "candidate"
  // ─────────────────────────────────────────
  const roleParam = (searchParams?.role || "candidate").toLowerCase();

  let role: Role;
  if (roleParam === "employer") role = "employer";
  else if (roleParam === "consultant" || roleParam === "recruiter") role = "recruiter";
  else role = "candidate";

  const redirect = searchParams?.redirect;

  const heading =
    role === "candidate"
      ? "Create your JobDhari account"
      : role === "employer"
      ? "Create your JobDhari employer account"
      : "Create your JobDhari recruiter account";

  const subHeading =
    role === "candidate"
      ? "Sign up as a candidate. You can switch to employer later."
      : role === "employer"
      ? "Sign up as an employer to post jobs and track applications."
      : "Sign up as a recruiter / consultant to manage multiple companies' openings.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = cred.user;

      // Store user profile + role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role,
        createdAt: serverTimestamp(),
      });

      // Decide where to go after signup
      const fallbackRoute =
        role === "candidate"
          ? "/jobs"
          : role === "employer"
          ? "/employer"
          : "/recruiter";

      router.push(redirect || fallbackRoute);
    } catch (err: any) {
      console.error("Signup error", err);
      // Firebase gives useful messages, we can show them directly for now
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-2 text-slate-900">
          {heading}
        </h1>
        <p className="text-sm text-slate-600 mb-6">{subHeading}</p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href={`/login?role=${role}`}
            className="font-medium text-orange-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
