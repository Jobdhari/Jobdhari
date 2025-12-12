"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Item({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm ${
        active ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white p-4">
      <div className="mb-4 text-xs font-semibold text-gray-500">NAVIGATION</div>

      <nav className="flex flex-col gap-2">
        <Item href="/dashboard" label="Dashboard" />
        <Item href="/jobs" label="Jobs" />
        <Item href="/my-jobs" label="My Jobs" />
        <Item href="/settings" label="Settings" />
      </nav>
    </aside>
  );
}
