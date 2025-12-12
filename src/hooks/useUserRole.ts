"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type RoleState = {
  user: User | null;
  role: "admin" | "employer" | "candidate" | null;
  loading: boolean;
};

export function useUserRole(): RoleState {
  const [state, setState] = useState<RoleState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setState({ user: null, role: null, loading: false });
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const role = (snap.exists() ? (snap.data().role as RoleState["role"]) : null) || null;
        setState({ user: u, role, loading: false });
      } catch {
        setState({ user: u, role: null, loading: false });
      }
    });
    return () => unsub();
  }, []);

  return state;
}
