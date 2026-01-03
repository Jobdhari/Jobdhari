"use client";

/**
 * @feature Public Jobs
 * @responsibility List and search published jobs for candidates
 * @routes /jobs
 */

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ApplyJobButton from "@/components/jobs/ApplyJobButton";
import { listPublicJobs, PublicJob } from "@/lib/firebase/publicJobsService";
import { getUserAppliedJobIds } from "@/lib/firebase/applicationService";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type ExpKey = "any" | "fresher" | "1-3" | "3-5" | "5+";

export default function JobsClient() {
  const searchParams = useSearchParams();

  const qParam = (searchParams.get("q") || "").toLowerCase();
  const locParam = (searchParams.get("loc") || "").toLowerCase();
  const expParamRaw = (searchParams.get("exp") || "any").toLowerCase();

  const expAllowed = new Set<ExpKey>(["any", "fresher", "1-3", "3-5", "5+"]);
  const expParam: ExpKey = expAllowed.has(expParamRaw as ExpKey)
    ? (expParamRaw as ExpKey)
    : "any";

  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState(qParam);
  const [loc, setLoc] = useState(locParam);
  const [exp, setExp] = useState<ExpKey>(expParam);

  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => setQuery(qParam), [qParam]);
  useEffect(() => setLoc(locParam), [locParam]);
  useEffect(() => setExp(expParam), [expParam]);

  /**
   * 🔹 NEW: Load cached applied jobIds instantly (prevents flicker)
   */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("jobdhari_appliedJobIds");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setAppliedJobIds(new Set(parsed));
        }
      }
    } catch {
      // ignore cache errors
    }
  }, []);

  /**
   * 🔹 NEW: Persist applied jobIds whenever they change
   */
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "jobdhari_appliedJobIds",
        JSON.stringify(Array.from(appliedJobIds))
      );
    } catch {
      // ignore storage errors
    }
  }, [appliedJobIds]);

  // Load jobs
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

  /**
   * 🔹 Existing Firestore sync (source of truth) — DO NOT REMOVE
   */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAppliedJobIds(new Set());
        return;
      }
      try {
        const ids = await getUserAppliedJobIds(user.uid);
        setAppliedJobIds(ids); // Firestore overrides cache if needed
      } catch (err) {
        console.error("Failed to load applied job ids:", err);
      }
    });

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const l = loc.trim().toLowerCase();

    return jobs.filter((j) => {
      const haystack = [j.title, j.companyName, j.location, j.category]
        .join(" ")
        .toLowerCase();

      return (!q || haystack.includes(q)) &&
        (!l || String(j.location || "").toLowerCase().includes(l));
    });
  }, [jobs, query, loc]);

  const searchHref = useMemo(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (loc.trim()) params.set("loc", loc.trim());
    if (exp !== "any") params.set("exp", exp);
    return params.toString() ? `/jobs?${params}` : "/jobs";
  }, [query, loc, exp]);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">Jobs</h1>

      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} />
        <select
          value={exp}
          onChange={(e) => setExp(e.target.value as ExpKey)}
          className="h-10 rounded-md border px-3"
        >
          <option value="any">Experience</option>
          <option value="fresher">Fresher</option>
          <option value="1-3">1–3 years</option>
          <option value="3-5">3–5 years</option>
          <option value="5+">5+ years</option>
        </select>
        <Input value={loc} onChange={(e) => setLoc(e.target.value)} />
        <Button asChild>
          <Link href={searchHref}>Search</Link>
        </Button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        filtered.map((job) => {
          const applied = appliedJobIds.has(job.id);

          return (
            <div key={job.id} className="border p-4 rounded">
              <div className="font-semibold">{job.title}</div>
              <div className="text-sm text-muted-foreground">
                {job.companyName} • {job.location}
              </div>

              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/jobs/${job.id}`}>View</Link>
                </Button>

                <ApplyJobButton
                  job={{
                    id: job.id,
                    title: job.title,
                    companyName: job.companyName,
                    location: job.location,
                    category: job.category,
                  }}
                  applied={applied}
                  onApplied={() => {
                    setAppliedJobIds((prev) => new Set(prev).add(job.id));
                  }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
