"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function EmployerSignupPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ Check if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);
      if (currentUser) {
        // redirect only after render phase
        setTimeout(() => router.replace("/employer/post-job"), 0);
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Checking session...
      </div>
    );
  }

  // ✅ Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCred.user;

      // Send verification mail
      await sendEmailVerification(user);

      // Save employer data with role
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: form.email.toLowerCase(),
        companyName: form.companyName,
        role: "employer",
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => router.replace("/login/employer"), 2000);
    } catch (err: any) {
      console.error("Signup Error:", err);
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

  // ✅ If already logged in
  if (user) return null;

  // ✅ Signup Form UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Employer Signup
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm text-center">
              ✅ Signup successful! Please verify your email.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white rounded-md py-2 font-medium hover:bg-orange-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <a
            href="/login/employer"
            className="text-orange-600 hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
