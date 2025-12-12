"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  BarChart3,
  FileText,
  Briefcase,
  Plus,
  LayoutDashboard,
  Bell,
  Moon,
  Sun,
} from "lucide-react";

const navItems = [
  { href: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/recruiter/my-jobs", label: "My Jobs", icon: Briefcase },
  { href: "/recruiter/my-submissions", label: "My Submissions", icon: FileText },
  { href: "/recruiter/add-submission", label: "Add Submission", icon: Plus },
  { href: "/recruiter/analytics", label: "Analytics", icon: BarChart3 },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [recruiter, setRecruiter] = useState<{ name?: string; email?: string } | null>(
    null
  );
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setRecruiter({
          name: user.displayName || "Recruiter",
          email: user.email || "",
        });
      } else {
        setRecruiter(null);
      }
    });
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login/recruiter");
  };

  return (
    <div
      className={`flex min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Sidebar */}
      <aside
        className={`w-64 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-r shadow-sm flex flex-col`}
      >
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
            JobDhari Recruiter
          </h1>
          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
            Empowering your hiring flow
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleSignOut}
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Navbar */}
        <header
          className={`sticky top-0 z-10 flex justify-between items-center px-6 py-3 border-b backdrop-blur-md ${
            darkMode ? "bg-gray-800/70 border-gray-700" : "bg-white/70 border-gray-200"
          }`}
        >
          <div>
            <h2 className="font-semibold text-blue-800 dark:text-blue-300">
              {recruiter?.name || "Recruiter"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {recruiter?.email || "No email"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => alert("Notifications coming soon")}
            >
              <Bell size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
