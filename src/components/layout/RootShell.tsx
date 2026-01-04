"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TopNav from "@/components/layout/TopNav";

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide public TopNav on authenticated areas
  const isEmployerArea = pathname.startsWith("/employer");
  const isCandidateArea = pathname.startsWith("/candidate");

  const hidePublicNav = isEmployerArea || isCandidateArea;

  return (
    <>
      {!hidePublicNav && <TopNav />}

      <div className={!hidePublicNav ? "pt-16" : ""}>
        {children}
      </div>
    </>
  );
}
