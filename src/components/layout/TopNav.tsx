"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export default function TopNav() {
  const pathname = usePathname();

  const isEmployer = pathname.startsWith("/employer");
  const isCandidate = pathname.startsWith("/candidate");

  // 🔹 Default (Public) nav — MVP simple
  let nav: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Jobs" },
  ];

  // 🔹 Employer nav
  if (isEmployer) {
    nav = [
      { href: "/employer/dashboard", label: "Jobs & Responses" },
      { href: "/employer/post-job", label: "Post a Job" },
      { href: "/employer/reports", label: "Reports" },
    ];
  }

  // 🔹 Candidate nav (NO profile in MVP)
  if (isCandidate) {
    nav = [
      { href: "/jobs", label: "Jobs" },
    ];
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b">
      <div className="h-full w-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
            J
          </div>
          <span className="font-semibold text-lg">JobDhari</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-8 text-sm">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

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
