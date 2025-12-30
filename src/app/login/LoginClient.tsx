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

/* ---------- Google Icon ---------- */
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.2 0 5.9 1.1 8.1 3.1l6-6C34.3 2.9 29.5 1 24 1 14.6 1 6.5 6.4 2.7 14.3l7 5.4C11.6 13.6 17.3 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.1-2.7-.4-4H24v8h12.6c-.3 2-1.8 5-5.1 7.1l7.8 6c4.6-4.2 7.3-10.4 7.3-17.1z"
      />
      <path
        fill="#FBBC05"
        d="M9.7 28.7c-.5-1.4-.8-2.8-.8-4.2s.3-2.8.8-4.2l-7-5.4C1.3 18 1 21 1 24.5s.3 6.5 1.7 9.6l7-5.4z"
      />
      <path
        fill="#34A853"
        d="M24 47c5.5 0 10.1-1.8 13.5-4.9l-7.8-6c-2.1 1.4-4.9 2.4-8.7 2.4-6.7 0-12.4-4.1-14.3-10l-7 5.4C6.5 41.6 14.6 47 24 47z"
      />
    </svg>
  );
}

/* ---------- Errors ---------- */
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

/* ---------- Component ---------- */
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

        {/* ✅ FIXED GOOGLE BUTTON */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 bg-white hover:bg-white border border-zinc-300 flex items-center justify-center gap-2"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Continue with Google</span>
        </Button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
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

          <Button type="submit" disabled={loading} className="w-full h-11">
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
