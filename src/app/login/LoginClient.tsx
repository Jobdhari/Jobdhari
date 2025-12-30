"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  AuthError,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function friendlyAuthError(err: unknown) {
  const e = err as AuthError | undefined;
  const code = e?.code ?? "";

  if (code === "auth/invalid-email") return "Enter a valid email.";
  if (code === "auth/user-not-found") return "No account found for this email.";
  if (code === "auth/wrong-password") return "Wrong password.";
  if (code === "auth/too-many-requests")
    return "Too many attempts. Try again later.";

  return e?.message || "Login failed.";
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const role = useMemo(
    () => (searchParams.get("role") || "candidate").toLowerCase(),
    [searchParams]
  );

  const redirectTo = useMemo(
    () => searchParams.get("redirect") || "",
    [searchParams]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (loading) return;

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      toast.error("Enter email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);

      // 1️⃣ explicit redirect always wins
      if (redirectTo) {
        router.replace(redirectTo);
        return;
      }

      // 2️⃣ employer
      if (role === "employer") {
        router.replace("/employer/dashboard");
        return;
      }

      // 3️⃣ candidate → dashboard (NEVER jobs)
      router.replace("/candidate/dashboard");
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (loading) return;
    setLoading(true);

    try {
      await signInWithPopup(auth, new GoogleAuthProvider());

      if (redirectTo) {
        router.replace(redirectTo);
        return;
      }

      if (role === "employer") {
        router.replace("/employer/dashboard");
        return;
      }

      router.replace("/candidate/dashboard");
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      toast.error("Enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast.success("Password reset link sent.");
    } catch (err) {
      toast.error(friendlyAuthError(err));
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 space-y-4">
        <h1 className="text-2xl font-semibold">
          {role === "employer" ? "Employer Login" : "Candidate Login"}
        </h1>

        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          Continue with Google
        </Button>

        <form
          onSubmit={(e) => {
            e.preventDefault(); // 🔒 FIXES “LOGIN TWICE”
            handleLogin();
          }}
          className="space-y-4"
        >
          <Input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-muted-foreground hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Continue"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          New here?{" "}
          <Link href={`/signup/${role}`} className="underline">
            Create account
          </Link>
        </p>
      </Card>
    </div>
  );
}
