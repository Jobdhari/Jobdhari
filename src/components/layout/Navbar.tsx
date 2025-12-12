// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "Profile", href: "/profile" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
            J
          </span>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            JobDhari
          </span>
        </Link>

        {/* Main nav (desktop) */}
        <nav className="hidden gap-6 text-sm font-medium text-gray-600 md:flex">
          {mainNav.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative pb-1 transition-colors hover:text-orange-600",
                  isActive ? "text-orange-600" : "text-gray-600"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-orange-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side – placeholder for future things (avatar, language, etc.) */}
        <div className="flex items-center gap-3">
          {/* You can put user avatar or a logout button here later */}
        </div>
      </div>
    </header>
  );
}
