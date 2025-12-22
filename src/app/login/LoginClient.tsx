"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "candidate" || r === "employer") setRole(r);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
          email,
          role,
          createdAt: new Date().toISOString(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      router.push(
        role === "employer"
          ? "/employer/dashboard"
          : "/candidate/dashboard"
      );
    } catch (err: any) {
      toast.error(err?.message ?? "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input value={email} onChange={e => setEmail(e.target.value)} />
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Please wait…" : isSignup ? "Sign up" : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
