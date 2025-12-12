"use client";

import { useEffect, useState } from "react";
import RequireAdmin from "@/components/auth/RequireAdmin";
import { db } from "@/lib/firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  limit,
  query,
} from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Briefcase, FileText } from "lucide-react";

type Job = { id: string; title: string; location?: string; createdAt?: any };
type Application = {
  id: string;
  jobId: string;
  candidateId: string;
  note?: string;
  createdAt?: any;
};

export default function AdminPage() {
  const [counts, setCounts] = useState({ users: 0, jobs: 0, applications: 0 });
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [latestApps, setLatestApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // counts (simple scan; fine for MVP)
        const [usersSnap, jobsSnap, appsSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "jobs")),
          getDocs(collection(db, "applications")),
        ]);

        setCounts({
          users: usersSnap.size,
          jobs: jobsSnap.size,
          applications: appsSnap.size,
        });

        // latest jobs
        const jobsQ = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(5));
        const jobsRes = await getDocs(jobsQ);
        setLatestJobs(jobsRes.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));

        // latest applications
        const appsQ = query(collection(db, "applications"), orderBy("createdAt", "desc"), limit(5));
        const appsRes = await getDocs(appsQ);
        setLatestApps(appsRes.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      } catch (e) {
        console.error(e);
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <RequireAdmin>
      <div className="min-h-[80vh] py-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-heading text-primary">Admin Portal</h1>
          <p className="text-gray-500 mt-1">Overview of platform activity</p>
        </div>

        {/* KPI Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gray-100">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Users</div>
              <div className="text-2xl font-semibold">{counts.users}</div>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gray-100">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Jobs</div>
              <div className="text-2xl font-semibold">{counts.jobs}</div>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gray-100">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Applications</div>
              <div className="text-2xl font-semibold">{counts.applications}</div>
            </div>
          </Card>
        </div>

        {/* Latest Lists */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-heading text-primary">Latest Jobs</h2>
              <Button variant="outline" size="sm">View all</Button>
            </div>
            {loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : latestJobs.length ? (
              <ul className="divide-y">
                {latestJobs.map((j) => (
                  <li key={j.id} className="py-3">
                    <div className="font-medium">{j.title || "Untitled role"}</div>
                    <div className="text-xs text-gray-500">{j.location || "—"}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No jobs yet.</p>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-heading text-primary">Latest Applications</h2>
              <Button variant="outline" size="sm">View all</Button>
            </div>
            {loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : latestApps.length ? (
              <ul className="divide-y">
                {latestApps.map((a) => (
                  <li key={a.id} className="py-3">
                    <div className="font-medium">Application #{a.id.slice(0, 6)}</div>
                    <div className="text-xs text-gray-500">
                      job: {a.jobId || "—"} • candidate: {a.candidateId || "—"}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No applications yet.</p>
            )}
          </Card>
        </div>
      </div>
    </RequireAdmin>
  );
}
