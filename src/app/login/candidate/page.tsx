"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function CandidateLogin() {
  const router = useRouter();
  const auth = getAuth(app);

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Prevent React hydration errors
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        alert("Please verify your email before login. A new verification link was sent.");
        return;
      }

      alert("Login successful!");
      router.push("/candidate/profile"); // redirect to candidate dashboard or profile
    } catch (err: any) {
      console.error("Login error:", err.code);
      if (err.code === "auth/user-not-found") setError("No account found. Please sign up first.");
      else if (err.code === "auth/wrong-password") setError("Incorrect password. Try again.");
      else if (err.code === "auth/invalid-email") setError("Enter a valid email address.");
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    border: "1px solid #aaa",
    borderRadius: "6px",
    marginBottom: "10px",
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "60px auto",
        padding: "24px",
        border: "1px solid #ccc",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        background: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Candidate Login</h2>

      <form onSubmit={handleLogin}>
        <label style={{ display: "block", marginBottom: "6px" }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={inputStyle}
          required
        />

        <label style={{ display: "block", marginBottom: "6px" }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          style={inputStyle}
          required
        />

        {error && (
          <p style={{ color: "red", fontSize: 14, marginTop: 4, marginBottom: 10 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: "#e45b00",
            color: "white",
            padding: "12px",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 14 }}>
        Don’t have an account?{" "}
        <a href="/signup/candidate" style={{ color: "#e45b00" }}>
          Sign up here
        </a>
      </p>
    </div>
  );
}
