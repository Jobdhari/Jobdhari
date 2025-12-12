"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Briefcase, Shield, LogOut } from "lucide-react";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/employers", label: "Employers", icon: Users },
  { href: "/admin/recruiters", label: "Recruiters", icon: Shield },
  { href: "/admin/jobs", label: "All Jobs", icon: Briefcase },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login/admin");
    });
    return () => unsub();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r shadow-sm">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold text-blue-800">JobDhari Admin</h1>
          <p className="text-xs text-gray-500 mt-1">Control Center</p>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  active ? "bg-blue-50 text-blue-700 border border-blue-200" : "hover:bg-gray-100"
                }`}
              >
                <Icon size={16} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={async () => {
              await signOut(auth);
              router.push("/");
            }}
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
