"use client";

import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  // ❌ Do NOT render sidebar on employer dashboard
  if (pathname.startsWith("/employer/dashboard")) {
    return null;
  }

  const isEmployerArea = pathname.startsWith("/employer");

  if (!isEmployerArea) return null;

  // Sidebar intentionally empty for now
  // (kept for future employer pages if needed)
  return null;
}
