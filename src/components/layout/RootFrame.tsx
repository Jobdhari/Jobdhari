"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TopNav from "@/components/layout/TopNav";

export default function RootFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide TopNav on employer (and any admin/dashboard) areas
  const hideTopNav =
    pathname.startsWith("/employer") || pathname.startsWith("/dashboard");

  return (
    <>
      {!hideTopNav && <TopNav />}
      <div className={!hideTopNav ? "pt-16" : ""}>{children}</div>
    </>
  );
}
