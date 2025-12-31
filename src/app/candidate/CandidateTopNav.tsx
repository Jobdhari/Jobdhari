"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

/* ---------------- Tab Link ---------------- */

function TabLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "px-3 py-2 text-sm rounded-md transition",
        active
          ? "bg-muted font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

/* ---------------- Component ---------------- */

export default function CandidateTopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isProfile = pathname.startsWith("/candidate/profile");
  const isApps =
    pathname.startsWith("/candidate/dashboard") ||
    pathname.startsWith("/candidate/applications");

  // ✅ FIXED: candidate jobs only
  const isJobs = pathname.startsWith("/candidate/jobs");

  async function handleLogout() {
    await signOut(auth);
    router.push("/login?role=candidate&redirect=/candidate/dashboard");
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <TabLink
          href="/candidate/profile"
          label="Profile"
          active={isProfile}
        />

        <TabLink
          href="/candidate/dashboard"
          label="Applications"
          active={isApps}
        />

        {/* ✅ FIXED: stays inside candidate */}
        <TabLink
          href="/candidate/jobs"
          label="Browse Jobs"
          active={isJobs}
        />
      </div>

      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}
