"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export default function TopNav() {
  const pathname = usePathname();

  const isEmployer = pathname.startsWith("/employer");
  const isCandidate = pathname.startsWith("/candidate");

  let nav: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Jobs" },
    { href: "/candidate/profile", label: "Profile" },
  ];

  // Employer header (like your Naukri screenshot)
  if (isEmployer) {
    nav = [
      { href: "/employer/dashboard", label: "Jobs & Responses" },
      { href: "/employer/post-job", label: "Post a Job" },
      { href: "/employer/reports", label: "Reports" },
    ];
  }

  // Candidate header (you can adjust later)
  if (isCandidate) {
    nav = [
      { href: "/candidate/home", label: "Home" },
      { href: "/jobs", label: "Jobs" },
      { href: "/candidate/profile", label: "Profile" },
    ];
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b">
      {/* IMPORTANT: This container controls the logo spacing */}
      <div className="h-full w-full px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
            J
          </div>
          <span className="font-semibold text-lg">JobDhari</span>
        </Link>

        <nav className="flex items-center gap-8 text-sm">
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
