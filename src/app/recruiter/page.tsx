"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RecruiterLanding() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
      <h1 className="text-3xl font-semibold mb-3 text-gray-900">
        Recruit with JobDhari
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Manage jobs, track candidates, and grow your network of employers and professionals — all in one place.
      </p>

      <div className="flex gap-4">
        <Link href="/recruiter/signup">
          <Button>Get Started Free</Button>
        </Link>
        <Link href="/recruiter/dashboard">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
