"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

export default function CandidateLogin() {
  const router = useRouter();
  const auth = getAuth(); // uses already-initialized Firebase app

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!result.user.emailVerified) {
        await sendEmailVerification(result.user);
        setError("Please verify your email. Verification link sent.");
        return;
      }

      router.push("/jobs");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-bold">Candidate Login</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-md border p-2"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-md border p-2"
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full rounded-md bg-orange-500 py-2 text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {loading ? "Logging in…" : "Login"}
      </button>
    </div>
  );
}
