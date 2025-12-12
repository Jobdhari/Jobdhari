"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Ensures a company doc exists for the logged-in employer/admin.
 * Uses employer's uid as companyId for simplicity and zero extra joins.
 */
export function useEnsureCompany() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const run = async () => {
      const user = auth.currentUser;
      if (!user) return setBooting(false);

      const companyRef = doc(db, "companies", user.uid);
      const snap = await getDoc(companyRef);

      if (!snap.exists()) {
        await setDoc(companyRef, {
          companyId: user.uid,
          ownerId: user.uid,
          name: "Your Company",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setBooting(false);
    };
    run();
  }, []);

  return { booting };
}
