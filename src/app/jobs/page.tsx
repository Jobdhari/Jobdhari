/**
 * @feature Public Jobs
 * @responsibility List and search published jobs for candidates
 * @routes /jobs
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ApplyJobButton from "@/components/jobs/ApplyJobButton";

import { listPublicJobs, PublicJob } from "@/lib/firebase/publicJobsService";

type ExpKey = "any" | "fresher" | "1-3" | "3-5" | "5+";

export default function JobsPage() {
  const searchParams = useSearchParams();

  // URL params from Home hero search
  const qParam = (searchParams.get("q") || "").toLowerCase();
  const locParam = (searchParams.get("loc") || "").toLowerCase();
  const expParamRaw = (searchParams.get("exp") || "any").toLowerCase();

  const expAllowed = new Set<ExpKey>(["any", "fresher", "1-3", "3-5", "5+"]);
  const expParam: ExpKey = expAllowed.has(expParamRaw as ExpKey)
    ? (expParamRaw as ExpKey)
    : "any";

  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);

  // local UI state
  const [query, setQuery] = useState(qParam);
  const [loc, setLoc] = useState(locParam);
  const [exp, setExp] = useState<ExpKey>(expParam);

  // keep inputs in sync with URL
  useEffect(() => setQuery(qParam), [qParam]);
  useEffect(() => setLoc(locParam), [locParam]);
  useEffect(() => setExp(expParam), [expParam]);

  // fetch jobs
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listPublicJobs();
        setJobs(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // local filtering (MVP-safe)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const l = loc.trim().toLowerCase();

    return jobs.filter((j) => {
      const haystack = [j.title, j.companyName, j.location, j.category]
        .join(" ")
        .toLowerCase();

      const matchesQ = !q || haystack.includes(q);
      const matchesLoc =
        !l || String(j.location || "").toLowerCase().includes(l);

      return matchesQ && matchesLoc;
    });
  }, [jobs, query, loc]);

  // build Search URL
  const searchHref = useMemo(() => {
    const params = new URLSearchParams();

    const q = query.trim();
    const l = loc.trim();

    if (q) params.set("q", q);
    if (l) params.set("loc", l);
    if (exp !== "any") params.set("exp", exp);

    return params.toString() ? `/jobs?${params}` : "/jobs";
  }, [query, loc, exp]);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jobs</h1>
        <p className="text-muted-foreground">Browse open jobs on JobDhari</p>
      </div>

      {/* Search bar */}
      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Skills / role / company…"
        />

        <select
          value={exp}
          onChange={(e) => setExp(e.target.value as ExpKey)}
          className="h-10 w-full rounded-md border bg-white px-3 text-sm"
        >
          <option value="any">Experience</option>
          <option value="fresher">Fresher</option>
          <option value="1-3">1–3 years</option>
          <option value="3-5">3–5 years</option>
          <option value="5+">5+ years</option>
        </select>

        <Input
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          placeholder="Location / pincode…"
        />

        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href={searchHref}>Search</Link>
        </Button>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        {loading ? (
          <div>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No jobs found.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((job) => (
              <div key={job.id} className="rounded-xl border p-4">
                <div className="font-semibold text-lg">{job.title}</div>
                <div className="text-sm text-muted-foreground">
                  {job.companyName} • {job.location}
                </div>

                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/jobs/${job.id}`}>View</Link>
                  </Button>

                  {/* Apply CTA (state-aware) */}
                  <ApplyJobButton
                    jobId={job.id}
                    title={job.title}
                    companyName={job.companyName}
                    location={job.location}
                    category={job.category}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
