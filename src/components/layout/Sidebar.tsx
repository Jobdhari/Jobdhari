"use client";

import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const isEmployerArea =
    pathname.startsWith("/employer") || pathname.startsWith("/dashboard/employer");

  // For now: sidebar is only shown in employer area (AppShell already controls visibility)
  if (!isEmployerArea) return null;

  return (
    <aside className="w-64 border-r bg-white px-6 py-6">
      <div className="text-xs font-semibold tracking-wide text-muted-foreground">
        FILTERS
      </div>

      <div className="mt-6 space-y-6">
        <section>
          <div className="text-sm font-semibold">Job status</div>

          <div className="mt-3 space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              Active jobs
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              Closed jobs
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              Drafts
            </label>
          </div>
        </section>

        <section>
          <div className="text-sm font-semibold">Search</div>
          <input
            placeholder="Search by title or ID"
            className="mt-3 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
          />
        </section>
      </div>
    </aside>
  );
}
