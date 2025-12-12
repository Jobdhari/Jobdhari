"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md">
        <ShieldAlert className="w-14 h-14 text-orange-500 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          You don’t have permission to view this page.
        </p>
        <Link href="/">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Go Back Home
          </Button>
        </Link>
      </div>
    </main>
  );
}
