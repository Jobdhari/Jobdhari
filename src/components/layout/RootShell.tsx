"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TopNav from "@/components/layout/TopNav";

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide public TopNav on employer area, because employer has its own header
  const isEmployerArea = pathname.startsWith("/employer");

  return (
    <>
      {!isEmployerArea && <TopNav />}

      {/* push content below fixed header if header exists */}
      <div className={!isEmployerArea ? "pt-16" : ""}>{children}</div>
    </>
  );
}
