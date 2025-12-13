"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import EmployerTopNav from "@/components/layout/EmployerTopNav";
import Sidebar from "@/components/layout/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isEmployer = pathname.startsWith("/employer");
  const showSidebar = isEmployer; // keep sidebar for employer only (clean + predictable)

  return (
    <>
      {isEmployer ? <EmployerTopNav /> : <TopNav />}

      {/* Everything below the fixed header */}
      <div className="pt-16">
        {showSidebar ? (
          <div className="flex min-h-[calc(100vh-64px)]">
            <Sidebar />
            <main className="flex-1">{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </div>
    </>
  );
}
