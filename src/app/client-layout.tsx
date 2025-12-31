"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * @layout ClientLayout
 * @responsibility Global client header + page wrapper
 * @note Hides public "Jobs" link inside /candidate routes
 */

export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // ✅ Detect candidate area
  const inCandidate = pathname.startsWith("/candidate");

  return (
    <div className="min-h-screen flex flex-col">
      {/* ---------------- Header ---------------- */}
      <header className="h-14 border-b bg-white">
        <div className="mx-auto max-w-7xl h-full px-4 flex items-center justify-between">
          {/* Left: Brand */}
          <Link href="/" className="text-lg font-semibold">
            JobDhari
          </Link>

          {/* Right: Global nav */}
          <nav className="flex items-center gap-4 text-sm">
            {/* ✅ HIDE public Jobs when inside candidate */}
            {!inCandidate && (
              <Link
                href="/jobs"
                className="hover:text-brand-blue transition"
              >
                Jobs
              </Link>
            )}

            <Link
              href="/login"
              className="hover:text-brand-blue transition"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------------- Page ---------------- */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
