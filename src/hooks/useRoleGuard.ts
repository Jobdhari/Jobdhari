"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

/**
 * Restricts access to pages based on user role.
 * Usage: const { loading } = useRoleGuard(["employer", "admin"]);
 */
export function useRoleGuard(allowedRoles: string[]) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          router.replace("/login");
          return;
        }

        // Fetch user role from Firestore
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          router.replace("/login");
          return;
        }

        const userData = snap.data();
        const role = userData?.role;

        if (!allowedRoles.includes(role)) {
          router.replace("/unauthorized");
          return;
        }
      } catch (error) {
        console.error("Role check failed:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router, allowedRoles]);

  return { loading };
}
