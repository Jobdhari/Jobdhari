"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

/**
 * Friendly Firebase auth errors
 */
function friendlyAuthError(err: unknown) {
  const e = err as AuthError | undefined;
  const code = e?.code ?? "";

  if (code === "auth/invalid-email") return "Enter a valid email.";
  if (code === "auth/user-not-found") return "No account found for this email.";
  if (code === "auth/wrong-password") return "Wrong password. Try again.";
  if (code === "auth/invalid-credential") return "Wrong email or password.";
  if (code === "auth/too-many-requests")
    return "Too many attempts. Try again later or reset your password.";
  if (code === "auth/popup-closed-by-user")
    return "Google sign-in was cancelled.";
  if (code === "auth/account-exists-with-different-credential")
    return "This email is already used with another sign-in method.";

  return e?.message || "Login failed. Please try again.";
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const role = useMemo(
    () => (searchParams.get("role") || "candidate").toLowerCase().trim(),
    [searchParams]
  );

  const redirect = useMemo(
    () => searchParams.get("redirect") || "",
    [searchParams]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail) return toast.error("Enter your email.");
    if (!password) return toast.error("Enter your password.");

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);

      if (redirect) return router.push(redirect);
      if (role === "employer") return router.push("/employer/dashboard");
      return router.push("/jobs");
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return toast.error("Enter your email first.");
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      toast.success("Password reset link sent. Check Inbox/Spam.");
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setResetLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      if (redirect) return router.push(redirect);
      if (role === "employer") return router.push("/employer/dashboard");
      return router.push("/jobs");
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  const title = role === "employer" ? "Employer Login" : "Candidate Login";
  const subtitle = "Your next job starts here.";

  const signupHref =
    role === "employer"
      ? `/signup/employer${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`
      : `/signup/candidate${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {/* Google Sign-in */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 justify-center gap-2"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading || resetLoading}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.09 1.53 7.49 2.81l5.45-5.45C33.64 3.94 29.3 2 24 2 14.73 2 6.98 7.36 3.69 14.98l6.36 4.94C11.63 14.05 17.33 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.58-.14-3.09-.4-4.55H24v9.02h12.67c-.55 2.97-2.2 5.49-4.69 7.18l7.19 5.57C43.2 38.14 46.5 32.03 46.5 24.5z"/>
            <path fill="#FBBC05" d="M10.05 28.58c-.43-1.29-.68-2.66-.68-4.08 0-1.42.24-2.79.68-4.08l-6.36-4.94C2.55 18.1 2 21.01 2 24.5c0 3.49.55 6.4 1.69 9.02l6.36-4.94z"/>
            <path fill="#34A853" d="M24 47c5.3 0 9.76-1.74 13.01-4.73l-7.19-5.57c-2 1.35-4.57 2.15-5.82 2.15-6.67 0-12.37-4.55-13.95-10.42l-6.36 4.94C6.98 40.64 14.73 47 24 47z"/>
          </svg>
          {googleLoading ? "Please wait…" : "Continue with Google"}
        </Button>

        {/* OR Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-muted-foreground tracking-wide">
              OR
            </span>
          </div>
        </div>

        {/* Email / Password */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading || loading || googleLoading}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              {resetLoading ? "Sending…" : "Forgot password?"}
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? "Please wait…" : "Continue"}
          </Button>

          <div className="text-center text-sm text-muted-foreground pt-1">
            New to JobDhari?{" "}
            <Link href={signupHref} className="hover:underline underline-offset-4">
              Create an account
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
