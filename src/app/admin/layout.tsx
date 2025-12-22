"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

import {
  LayoutDashboard,
  Users,
  Briefcase,
  Shield,
  LogOut,
} from "lucide-react";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/employers", label: "Employers", icon: Users },
  { href: "/admin/recruiters", label: "Recruiters", icon: Shield },
  { href: "/admin/jobs", label: "All Jobs", icon: Briefcase },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login/admin");
    });
    return () => unsub();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 border-r bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-blue-800">
            JobDhari Admin
          </h1>
          <p className="mt-1 text-xs text-gray-500">Control Center</p>
        </div>

        <nav className="space-y-1 p-4">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                  active
                    ? "border border-blue-200 bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <Button
            variant="outline"
            className="flex w-full items-center justify-center gap-2"
            onClick={async () => {
              await signOut(auth);
              router.push("/");
            }}
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
