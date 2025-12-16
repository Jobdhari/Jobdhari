"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

import EmployerGate from "@/components/auth/EmployerGate";
import ConfirmCloseDialog from "@/components/employer/ConfirmCloseDialog";

import {
  EmployerJob,
  listEmployerJobs,
} from "@/lib/firebase/employerJobsService";
import { getApplicationCountsByJobIds } from "@/lib/firebase/getApplicationCountsByJobIds";
import { updateJobFields } from "@/lib/updateJobFields";

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
export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>(
    {}
  );
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );

  const [employerId, setEmployerId] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<
    "all" | "open" | "closed" | "draft"
  >("all");
  const [search, setSearch] = useState("");

  /* ---------- Auth sync ---------- */
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setEmployerId(u?.uid ?? null);
    });
    return () => unsub();
  }, []);

  /* ---------- URL sync ---------- */
  useEffect(() => {
    const urlStatus = (searchParams.get("status") || "all").toLowerCase();
    const urlQ = searchParams.get("q") || "";
    setStatus(
      ["all", "open", "closed", "draft"].includes(urlStatus)
        ? (urlStatus as any)
        : "all"
    );
    setSearch(urlQ);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    status !== "all" ? params.set("status", status) : params.delete("status");
    search ? params.set("q", search) : params.delete("q");
    router.replace(params.toString() ? `${pathname}?${params}` : pathname);
  }, [status, search, pathname]);

  /* ---------- Fetch jobs ---------- */
  const fetchJobs = async () => {
    if (!employerId) return;
    setLoading(true);
    try {
      const fetchedJobs = await listEmployerJobs({ employerUid: employerId });
      setJobs(fetchedJobs);

      const counts = await getApplicationCountsByJobIds(
        fetchedJobs.map((j) => j.id)
      );
      setResponseCounts(counts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [employerId]);

  /* ---------- Toast-enabled job action ---------- */
  const runJobAction = async (
    jobId: string,
    fn: () => Promise<void>,
    messages?: { loading?: string; success?: string; error?: string }
  ) => {
    setActionLoading((prev) => ({ ...prev, [jobId]: true }));

    const toastId = messages?.loading
      ? toast.loading(messages.loading)
      : null;

    try {
      await fn();
      await fetchJobs();

      if (toastId)
        toast.success(messages?.success || "Done", { id: toastId });
      else if (messages?.success) toast.success(messages.success);
    } catch (e: any) {
      const msg =
        messages?.error ||
        e?.message ||
        "Action failed. Please try again.";

      if (toastId) toast.error(msg, { id: toastId });
      else toast.error(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [jobId]: false }));
    }
  };

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
            <h1 className="text-4xl font-bold">Jobs & Responses</h1>
            <Link href="/employer/post-job">
              <Button className="bg-orange-500 hover:bg-orange-600">
                + Post New Job
              </Button>
            </Link>
          </div>

          {filteredJobs.map((job) => {
            const s = normalizeJobStatus(job.status);

            return (
              <div key={job.id} className="rounded-xl border p-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="font-semibold">{job.title}</div>
                    <div className="text-sm text-gray-600">
                      {job.companyName} • {job.location}
                    </div>
                    <Badge className="mt-1">{s}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading[job.id]}
                      onClick={() =>
                        router.push(`/employer/jobs/${job.id}/edit`)
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading[job.id]}
                      onClick={() =>
                        runJobAction(
                          job.id,
                          async () => {
                            await updateJobFields(job.id, {
                              status: "open",
                              isPublished: true,
                            });
                          },
                          {
                            loading: "Reposting…",
                            success: "Reposted (bumped to top).",
                            error: "Repost failed.",
                          }
                        )
                      }
                    >
                      Repost
                    </Button>

                    {s === "draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading[job.id]}
                        onClick={() =>
                          runJobAction(
                            job.id,
                            async () => {
                              await updateJobFields(job.id, {
                                status: "open",
                                isPublished: true,
                              });
                            },
                            {
                              loading: "Publishing…",
                              success: "Job published.",
                              error: "Publish failed.",
                            }
                          )
                        }
                      >
                        Publish
                      </Button>
                    )}

                    {s !== "draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading[job.id]}
                        onClick={() =>
                          runJobAction(
                            job.id,
                            async () => {
                              await updateJobFields(job.id, {
                                status: "draft",
                                isPublished: false,
                              });
                            },
                            {
                              loading: "Moving to draft…",
                              success: "Moved to draft.",
                              error: "Failed to move to draft.",
                            }
                          )
                        }
                      >
                        Move to Draft
                      </Button>
                    )}

                    {s === "closed" ? (
                      <Button
                        size="sm"
                        disabled={actionLoading[job.id]}
                        onClick={() =>
                          runJobAction(
                            job.id,
                            async () => {
                              await updateJobFields(job.id, {
                                status: "open",
                                isPublished: true,
                              });
                            },
                            {
                              loading: "Reopening…",
                              success: "Job reopened.",
                              error: "Failed to reopen job.",
                            }
                          )
                        }
                      >
                        Reopen
                      </Button>
                    ) : (
                      <ConfirmCloseDialog
                        disabled={actionLoading[job.id]}
                        onConfirm={async () => {
                          await runJobAction(
                            job.id,
                            async () => {
                              await updateJobFields(job.id, {
                                status: "closed",
                                isPublished: false,
                              });
                            },
                            {
                              loading: "Closing…",
                              success: "Job closed.",
                              error: "Failed to close job.",
                            }
                          );
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </EmployerGate>
  );
}
