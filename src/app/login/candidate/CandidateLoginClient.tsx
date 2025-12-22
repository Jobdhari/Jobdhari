"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "sonner";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CandidateLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo =
    searchParams.get("redirect") || "/candidate/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // if already logged in, go where user intended
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) router.replace(redirectTo);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectTo]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const t = toast.loading("Logging in...");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success("Logged in", { id: t });
      router.replace(redirectTo);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Login failed", { id: t });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 space-y-4">
        <h1 className="text-2xl font-bold">Candidate Login</h1>

        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <div className="text-sm font-medium">Email</div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">Password</div>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </div>

          <Button className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
