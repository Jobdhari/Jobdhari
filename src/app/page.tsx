"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [exp, setExp] = useState("any");
  const [loc, setLoc] = useState("");

  function onSearch() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (exp !== "any") params.set("exp", exp);
    if (loc.trim()) params.set("loc", loc.trim());

    router.push(params.toString() ? `/jobs?${params}` : "/jobs");
  }

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find your next job near you
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Bilingual • Mobile-first • Built for Tier-2/3 hiring
          </p>

          {/* 🔍 Search Bar */}
          <div className="mx-auto mt-10 max-w-4xl rounded-full border bg-white p-2 shadow-sm">
            <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
              <div className="px-2 sm:px-3">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Skills / role / company"
                  className="border-0 focus-visible:ring-0"
                />
              </div>

              <div className="px-2 sm:border-l sm:px-3">
                <select
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  className="h-10 w-full rounded-md bg-transparent px-2 text-sm outline-none"
                >
                  <option value="any">Experience</option>
                  <option value="fresher">Fresher</option>
                  <option value="1-3">1–3 years</option>
                  <option value="3-5">3–5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>

              <div className="px-2 sm:border-l sm:px-3">
                <Input
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                  placeholder="Location / pincode"
                  className="border-0 focus-visible:ring-0"
                />
              </div>

              <div className="px-2">
                <Button
                  onClick={onSearch}
                  className="w-full rounded-full bg-orange-500 hover:bg-orange-600 sm:w-auto"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Tip: try{" "}
            <span className="font-medium text-foreground">Delivery</span> or{" "}
            <span className="font-medium text-foreground">Sales</span>
          </div>

          {/* 👇 Existing CTA buttons preserved */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Browse Jobs
            </Link>

            <Link
              href="/login/employer"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              I&apos;m Hiring / Post a Job
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
