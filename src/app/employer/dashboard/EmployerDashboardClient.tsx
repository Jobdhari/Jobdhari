"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

import EmployerGate from "@/components/auth/EmployerGate";
import { auth } from "@/lib/firebase";
import {
  EmployerJob,
  listEmployerJobs,
} from "@/lib/firebase/employerJobsService";
import { updateJobStatus } from "@/lib/updateJobStatus";
import { getApplicationCountsByJobIds } from "@/lib/firebase/getApplicationCountsByJobIds";

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

            return (
              <button
                key={x.key}
                type="button"
                onClick={() => setStatus(x.key as any)}
                className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
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
export default function EmployerDashboardClient() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>(
    {}
  );

  const [employerUid, setEmployerUid] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<
    "all" | "open" | "closed" | "draft"
  >("all");
  const [search, setSearch] = useState("");

  /* ---------- Auth subscription ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setEmployerUid(u?.uid ?? null);
    });
    return () => unsub();
  }, []);

  /* ---------- URL → State ---------- */
  useEffect(() => {
    setStatus((searchParams.get("status") || "all") as any);
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  /* ---------- State → URL ---------- */
  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (search.trim()) params.set("q", search.trim());
    router.replace(params.toString() ? `${pathname}?${params}` : pathname);
  }, [status, search, pathname]);

  /* ---------- Fetch jobs ---------- */
  const fetchJobs = async () => {
    if (!employerUid) return;

    setLoading(true);
    try {
      const fetchedJobs = await listEmployerJobs({ employerUid });
      setJobs(fetchedJobs);

      const counts = await getApplicationCountsByJobIds(
        fetchedJobs.map((j) => j.id)
      );
      setResponseCounts(counts);
    } catch (e) {
      console.error("Employer dashboard fetchJobs failed:", e);
      setJobs([]);
      setResponseCounts({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [employerUid]);

  const statusCounts = useMemo(() => {
    const c = { open: 0, closed: 0, draft: 0 };
    jobs.forEach((j) => c[normalizeJobStatus(j.status)]++);
    return c;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = search.toLowerCase();
    return jobs.filter((j) => {
      const s = normalizeJobStatus(j.status);
      return (
        (status === "all" || s === status) &&
        (!q ||
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q))
      );
    });
  }, [jobs, status, search]);

  return (
    <EmployerGate>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden border bg-white p-6 lg:block">
          <FiltersPanel
            status={status}
            setStatus={setStatus}
            search={search}
            setSearch={setSearch}
            statusCounts={statusCounts}
            onClear={() => {
              setStatus("all");
              setSearch("");
            }}
          />
        </aside>

        <main className="space-y-6 p-6">
          <div className="flex justify-between">
            <div>
              <h1 className="text-3xl font-bold">Jobs & Responses</h1>
              <p className="text-gray-600">
                Manage your posted jobs and view responses.
              </p>
            </div>

            <Link href="/employer/post-job">
              <Button>+ Post New Job</Button>
            </Link>
          </div>

          <div className="rounded-lg border bg-white p-6">
            {loading ? (
              <div>Loading…</div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-16 text-center">No jobs found</div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const s = normalizeJobStatus(job.status);

                  return (
                    <div
                      key={job.id}
                      className="flex items-start justify-between gap-6 rounded-lg border p-4"
                    >
                      {/* Left */}
                      <div>
                        <div className="font-semibold">{job.title}</div>
                        <div className="text-sm text-gray-600">
                          {job.companyName} · {job.location}
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          <Badge variant="secondary">{s}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Responses:{" "}
                            <b>{responseCounts[job.id] ?? 0}</b>
                          </span>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex flex-col items-end gap-2">
                        {/* Primary */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/employer/jobs/${job.id}/responses`
                              )
                            }
                          >
                            View responses
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/employer/jobs/${job.id}/edit`
                              )
                            }
                          >
                            Edit
                          </Button>
                        </div>

                        {/* Secondary */}
                        <div className="flex items-center gap-2">
                          {s === "open" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await updateJobStatus(job.id, "closed");
                                fetchJobs();
                              }}
                            >
                              Close
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await updateJobStatus(job.id, "open");
                                fetchJobs();
                              }}
                            >
                              Reopen
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              await updateJobStatus(job.id, "draft");
                              fetchJobs();
                            }}
                          >
                            Move to Draft
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </EmployerGate>
  );
}
