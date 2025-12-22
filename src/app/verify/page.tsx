"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        await user.reload();

        if (user.emailVerified) {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            await updateDoc(userRef, {
              emailVerified: true,
            });
          }

          router.replace(
            snap.data()?.role === "employer"
              ? "/employer/dashboard"
              : "/candidate/dashboard"
          );
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError("Verification failed. Please try again.");
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  const resendVerification = async () => {
    if (!auth.currentUser) return;

    try {
      await sendEmailVerification(auth.currentUser);
      alert("Verification email sent again.");
    } catch {
      alert("Failed to resend verification email.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        Verifying your email…
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Verify your email</h1>

      {error && <p className="text-red-600">{error}</p>}

      <p className="text-sm text-muted-foreground">
        We’ve sent a verification link to your email address.  
        Please verify to continue.
      </p>

      <button
        onClick={resendVerification}
        className="text-orange-600 hover:underline"
      >
        Resend verification email
      </button>
    </div>
  );
}
