/**
 * @feature Employer Dashboard * @responsibility Employer dashboard (job CRUD + response counts)
 * @routes /employer/dashboard
 * @files src/app/employer/dashboard/page.tsx
 */

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
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import EmployerGate from "@/components/auth/EmployerGate";
import ConfirmCloseDialog from "@/components/employer/ConfirmCloseDialog";

import {
  EmployerJob,
  listEmployerJobs,
} from "@/lib/firebase/employerJobsService";
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

  /* ---------- Auth ---------- */
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

  /* ---------- Response count batching ---------- */
  const fetchResponseCounts = async (jobIds: string[]) => {
    if (jobIds.length === 0) {
      setResponseCounts({});
      return;
    }

    const counts: Record<string, number> = {};
    const chunks: string[][] = [];

    for (let i = 0; i < jobIds.length; i += 10) {
      chunks.push(jobIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const q = query(
        collection(db, "applications"),
        where("jobId", "in", chunk)
      );

      const snap = await getDocs(q);
      for (const d of snap.docs) {
        const jobId = d.data().jobId;
        counts[jobId] = (counts[jobId] || 0) + 1;
      }
    }

    setResponseCounts(counts);
  };

  /* ---------- Fetch jobs ---------- */
  const fetchJobs = async () => {
    if (!employerId) return;
    setLoading(true);
    try {
      const fetchedJobs = await listEmployerJobs({ employerUid: employerId });
      setJobs(fetchedJobs);
      await fetchResponseCounts(fetchedJobs.map((j) => j.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [employerId]);

  /* ---------- Job actions ---------- */
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
        {/* …rest of file unchanged */}
      </div>
    </EmployerGate>
  );
}
