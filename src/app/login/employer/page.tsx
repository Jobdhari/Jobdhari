"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function EmployerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setIsSubmitting(true);

      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("Employer logged in:", cred.user.uid);

      toast.success("Logged in as employer");
      router.push("/employer/dashboard");
    } catch (error: any) {
      const code = error?.code || "unknown-error";
      const msg = error?.message || "No message";
      const readable = `Firebase error: ${code} — ${msg}`;

      setErrorMessage(readable);
      toast.error(readable);
      console.error("Employer login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-orange-50 to-orange-25 shadow-lg border border-orange-100 p-8">
        <h1 className="text-2xl font-semibold text-center text-orange-600">
          Employer Login
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Only verified employers can access JobDhari.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1"
              placeholder="employer@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={isSubmitting}
            className="w-full rounded-lg bg-orange-500 text-white py-2.5 text-sm font-medium hover:bg-orange-600 disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
