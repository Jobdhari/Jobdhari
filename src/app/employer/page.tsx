"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/auth";

export default function EmployerRootPage() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Not logged in → go to employer login
        router.replace("/login?mode=employer");
      } else {
        // Logged in → go straight to dashboard
        router.replace("/employer/dashboard");
      }
    });

    return () => unsub();
  }, [router]);

  return (
    <main className="flex-1 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Opening employer dashboard…</p>
    </main>
  );
}
