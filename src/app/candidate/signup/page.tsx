"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db, auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CandidateSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      await setDoc(doc(db, "candidates", res.user.uid), {
        name: form.name,
        email: form.email,
        createdAt: serverTimestamp(),
        profileCompleted: false,
      });
      router.push("/candidate/profile");
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <form
        onSubmit={handleSignup}
        className="bg-white shadow-md rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-2">Candidate Signup</h2>

        <Input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
    </main>
  );
}
