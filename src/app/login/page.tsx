"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    const paramRole = searchParams.get("role");
    if (paramRole === "employer" || paramRole === "candidate") {
      setRole(paramRole);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields.");

    setLoading(true);
    try {
      if (isSignup) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCred.user.uid), {
          email,
          role,
          createdAt: new Date().toISOString(),
        });
        toast.success("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login successful!");
      }

      setTimeout(() => {
        router.push(role === "employer" ? "/employer/dashboard" : "/candidate/dashboard");
      }, 1000);
    } catch (err: any) {
      toast.error(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Enter your email first");
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent to your email");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reset email");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm border border-[var(--color-border)] shadow-soft">
        <h2 className="text-center text-2xl font-heading text-primary mb-2">
          {isSignup
            ? `Create ${role === "employer" ? "Employer" : "Candidate"} Account`
            : `${role === "employer" ? "Employer" : "Candidate"} Login`}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Welcome to <span className="text-accent font-semibold">JobDhari</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full mt-2"
          >
            {isSignup ? "Sign Up" : "Log In"}
          </Button>

          <div className="flex justify-between text-sm mt-3">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-primary hover:text-accent transition"
            >
              {isSignup ? "Already have an account?" : "New user? Create one"}
            </button>

            {!isSignup && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-primary hover:text-accent transition"
              >
                Forgot password?
              </button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
