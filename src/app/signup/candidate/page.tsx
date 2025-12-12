"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function CandidateSignup() {
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  // ✅ All hooks are declared at the top (React rule)
  const [isReady, setIsReady] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Hydration safe mount
  useEffect(() => {
    setIsReady(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCred.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: form.fullName,
        email: form.email.toLowerCase(),
        phone: form.phone,
        role: "candidate",
        createdAt: serverTimestamp(),
      });

      setError("✅ Signup successful! Please verify your email before login.");
      setTimeout(() => router.push("/login/candidate"), 2000);
    } catch (err: any) {
      console.error("Signup error:", err.message);
      if (err.code === "auth/email-already-in-use")
        setError("Email already registered.");
      else if (err.code === "auth/invalid-email")
        setError("Invalid email address.");
      else if (err.code === "auth/weak-password")
        setError("Password too weak (min 6 characters).");
      else setError("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Return only after hydration
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="text-center text-xl text-gray-800">
            Candidate Signup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && (
              <p
                className={`text-sm text-center ${
                  error.startsWith("✅")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login/candidate"
                className="text-orange-600 hover:underline"
              >
                Login
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
