"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/lib/hooks/useUserRole";
import { Card } from "@/components/ui/card";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, role, loading } = useUserRole();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login?role=employer"); // force login
      else if (role !== "admin") router.replace("/dashboard?role=employer"); // bounce non-admin
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <Card className="p-6 mt-10">
        <p className="text-sm text-gray-500">Checking permissions…</p>
      </Card>
    );
  }

  if (!user || role !== "admin") {
    // brief fallback while router redirects
    return null;
  }

  return <>{children}</>;
}
