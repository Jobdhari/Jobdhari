"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

export default function EmployerGate({
  children,
  redirectTo = "/employer/login",
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) router.replace(redirectTo);
    });
    return () => unsub();
  }, [router, redirectTo]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  // If not logged in, we already redirected. Render nothing.
  if (!user) return null;

  return <>{children}</>;
}
