"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import {
  EmployerJob,
  listEmployerJobs,
} from "@/lib/firebase/employerJobsService";
import { updateJobStatus } from "@/lib/updateJobStatus";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/* =========================
   Status Normalizer
========================= */
function normalizeJobStatus(raw: unknown): "open" | "closed" | "draft" {
  const s = String(raw ?? "").toLowerCase().trim();

  if (s === "open" || s === "closed" || s === "draft") return s;
  if (s === "active" || s === "approved" || s === "published") return "open";
  if (s === "inactive") return "closed";

  return "open";
}

/* =========================
   Filters Panel
========================= */
function FiltersPanel({
  status,
  setStatus,
  search,
  setSearch,
  statusCounts,
  onClear,
}: {
  status: "all" | "open" | "closed" | "draft";
  setStatus: (v: "all" | "open" | "closed" | "draft") => void;
  search: string;
  setSearch: (v: string) => void;
  statusCounts: { open: number; closed: number; draft: number };
  onClear: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-xs font-semibold tracking-wide text-muted-foreground">
        FILTERS
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Search</div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Title, company, location…"
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Job status</div>

        <div className="space-y-2">
          {[
            { key: "all", label: "All" },
            { key: "open", label: "Open" },
            { key: "closed", label: "Closed" },
            { key: "draft", label: "Draft" },
          ].map((x) => {
            const count =
              x.key === "open"
                ? statusCounts.open
                : x.key === "closed"
                ? statusCounts.closed
                : x.key === "draft"
                ? statusCounts.draft
                : statusCounts.open +
                  statusCounts.closed +
                  statusCounts.draft;

            const active = status === x.key;

            return (
              <button
                key={x.key}
                type="button"
                onClick={() => setStatus(x.key as any)}
                className={[
                  "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm",
                  active
                    ? "bg-muted font-medium"
                    : "hover:bg-muted/50",
                ].join(" ")}
              >
                <span>{x.label}</span>
                <Badge>{count}</Badge>
              </button>
            );
          })}
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}

/* =========================
   Page
========================= */
export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>(
    {}
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<
    "all" | "open" | "closed" | "draft"
  >("all");
  const [search, setSearch] = useState("");

  const employerUid = getAuth().currentUser?.uid;

  /* ---------- URL → State ---------- */
  useEffect(() => {
    const urlStatus = (searchParams.get("status") || "all").toLowerCase();
    const urlQ = searchParams.get("q") || "";

    const allowed = new Set(["all", "open", "closed", "draft"]);
    const safeStatus = allowed.has(urlStatus)
      ? (urlStatus as any)
      : "all";

    setStatus((prev) => (prev === safeStatus ? prev : safeStatus));
    setSearch((prev) => (prev === urlQ ? prev : urlQ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ---------- State → URL ---------- */
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (status !== "all") params.set("status", status);
    else params.delete("status");

    const q = search.trim();
    if (q) params.set("q", q);
    else params.delete("q");

    router.replace(
      params.toString() ? `${pathname}?${params}` : pathname
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search, pathname]);

  /* ---------- Fetch response counts ---------- */
  const fetchResponseCounts = async (jobIds: string[]) => {
    if (jobIds.length === 0) {
      setResponseCounts({});
      return;
    }

    const q = query(
      collection(db, "applications"),
      where("jobId", "in", jobIds.slice(0, 10))
    );

    const snap = await getDocs(q);

    const counts: Record<string, number> = {};
    for (const d of snap.docs) {
      const jobId = d.data().jobId;
      counts[jobId] = (counts[jobId] || 0) + 1;
    }

    setResponseCounts(counts);
  };

  /* ---------- Fetch jobs (REPLACED AS REQUESTED) ---------- */
  const fetchJobs = async () => {
    if (!employerUid) {
      setJobs([]);
      setResponseCounts({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const fetchedJobs = await listEmployerJobs({ employerUid });
      setJobs(fetchedJobs);
      await fetchResponseCounts(fetchedJobs.map((j) => j.id));
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Trigger fetch ---------- */
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employerUid]);

  /* ---------- Counts ---------- */
  const statusCounts = useMemo(() => {
    const counts = { open: 0, closed: 0, draft: 0 };
    for (const j of jobs) {
      counts[normalizeJobStatus(j.status)]++;
    }
    return counts;
  }, [jobs]);

  /* ---------- Filtered jobs ---------- */
  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();

    return jobs.filter((j) => {
      const s = normalizeJobStatus(j.status);
      return (
        (status === "all" || s === status) &&
        (q === "" ||
          String(j.title).toLowerCase().includes(q) ||
          String(j.companyName).toLowerCase().includes(q) ||
          String(j.location).toLowerCase().includes(q))
      );
    });
  }, [jobs, status, search]);

  const clearFilters = () => {
    setStatus("all");
    setSearch("");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="hidden rounded-lg border bg-white p-6 lg:block">
        <FiltersPanel
          status={status}
          setStatus={setStatus}
          search={search}
          setSearch={setSearch}
          statusCounts={statusCounts}
          onClear={clearFilters}
        />
      </aside>

      <main className="space-y-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">Jobs & Responses</h1>
            <p className="mt-2 text-gray-600">
              Manage your posted jobs and view responses.
            </p>
          </div>

          <Link href="/employer/post-job">
            <Button className="bg-orange-500 hover:bg-orange-600">
              + Post New Job
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          {loading ? (
            <div className="text-gray-600">Loading…</div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-16 text-center text-gray-700">
              No jobs match your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const s = normalizeJobStatus(job.status);

                return (
                  <div
                    key={job.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
                  >
                    <div>
                      <div className="font-semibold">{job.title}</div>
                      <div className="text-sm text-gray-600">
                        {job.companyName} • {job.location}
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <Badge variant="secondary">{s}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Responses: {responseCounts[job.id] || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/employer/jobs/${job.id}/edit`)
                        }
                      >
                        Edit
                      </Button>

                      {s === "draft" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await updateJobStatus(job.id, "open");
                            await fetchJobs();
                          }}
                        >
                          Publish
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await updateJobStatus(job.id, "draft");
                            await fetchJobs();
                          }}
                        >
                          Move to Draft
                        </Button>
                      )}

                      {s === "closed" ? (
                        <Button
                          size="sm"
                          onClick={async () => {
                            await updateJobStatus(job.id, "open");
                            await fetchJobs();
                          }}
                        >
                          Reopen
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            await updateJobStatus(job.id, "closed");
                            await fetchJobs();
                          }}
                        >
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
