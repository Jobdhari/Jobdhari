"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "candidate" | "employer" | "admin" | "recruiter" | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        if (!cancelled) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.exists() ? snap.data() : null;
        const r = (data?.role ?? null) as UserRole;

        if (!cancelled) setRole(r);
      } catch {
        if (!cancelled) setRole(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    const unsub = auth.onAuthStateChanged(() => run());
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return { role, loading };
}
