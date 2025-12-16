"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listPublicJobs, PublicJob } from "@/lib/firebase/publicJobsService";

export default function JobsPage() {
  const searchParams = useSearchParams();
  const qParam = (searchParams.get("q") || "").toLowerCase();

  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(qParam);

  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

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

  const filtered = useMemo(() => {
    if (!query) return jobs;
    return jobs.filter((j) =>
      [
        j.title,
        j.companyName,
        j.location,
        j.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [jobs, query]);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jobs</h1>
        <p className="text-muted-foreground">
          Browse open jobs on JobDhari
        </p>
      </div>

      <div className="flex gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search job title, company, location…"
        />
        <Button asChild>
          <Link href={query ? `/jobs?q=${query}` : "/jobs"}>
            Search
          </Link>
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
              <div
                key={job.id}
                className="rounded-xl border p-4"
              >
                <div className="font-semibold text-lg">
                  {job.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  {job.companyName} • {job.location}
                </div>

                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/jobs/${job.id}`}>
                      View
                    </Link>
                  </Button>

                  <Button size="sm" asChild>
                    <Link href={`/apply/${job.id}`}>
                      Apply
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
