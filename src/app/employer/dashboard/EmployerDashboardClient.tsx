"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function EmployerDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login?role=employer");
    });
  }, [router]);

  return <div className="p-6">Employer Dashboard</div>;
}
