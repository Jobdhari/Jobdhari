"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  // Detect which section user is in based on URL
  const isEmployer = pathname.startsWith("/employer");
  const isCandidate = pathname.startsWith("/candidate");

  // Choose correct dashboard route
  const dashboardHref = isEmployer
    ? "/employer/dashboard"
    : isCandidate
    ? "/candidate/dashboard"
    : "/dashboard"; // fallback (if you keep a generic dashboard)

  const items = [
    { label: "Dashboard", href: dashboardHref },
    { label: "Jobs", href: "/jobs" },
    { label: "My Jobs", href: isEmployer ? "/employer/my-jobs" : "/candidate/my-jobs" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="w-64 border-r bg-white min-h-screen pt-16">
      <nav className="p-4 space-y-2">
        <div className="text-xs font-semibold text-gray-400 px-3 mb-2">
          NAVIGATION
        </div>

        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm ${
                active ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
