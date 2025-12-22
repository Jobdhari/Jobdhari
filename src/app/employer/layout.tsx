import type { ReactNode } from "react";
import Link from "next/link";

/**
 * @feature Employer Dashboard
 * @responsibility Employer navigation shell + content outlet
 * @routes /employer/*
 */

export default function EmployerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Top navigation */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
            J
          </div>
          <div className="font-semibold">JobDhari</div>
        </div>

        <nav className="flex gap-6 text-sm">
          <Link className="hover:underline" href="/employer/dashboard">
            Jobs & Responses
          </Link>
          <Link className="hover:underline" href="/employer/post-job">
            Post a Job
          </Link>
          <Link className="hover:underline" href="/employer/reports">
            Reports
          </Link>
        </nav>
      </header>

      {/* 🔑 REQUIRED: page content outlet */}
      <main className="min-h-[calc(100vh-72px)]">{children}</main>
    </div>
  );
}
