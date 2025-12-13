"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function EmployerTopNav() {
  const pathname = usePathname();

  const nav = [
    { href: "/employer/dashboard", label: "Jobs & Responses" },
    { href: "/employer/post-job", label: "Post a Job" },
    { href: "/employer/reports", label: "Reports" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b">
      {/* This wrapper is the important part: mx-auto + px */}
      <div className="h-full w-full px-6 flex items-center justify-between">
        <Link href="/employer/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
            J
          </div>
          <span className="font-semibold text-lg">JobDhari</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-2 ${
                  active
                    ? "text-orange-600 font-medium border-b-2 border-orange-500"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
