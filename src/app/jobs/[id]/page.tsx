"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getPublicJobById } from "@/lib/firebase/publicJobById";
import type { PublicJob } from "@/lib/firebase/publicJobsService";

export default function PublicJobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = useState<PublicJob | null>(null);
  const [loading, setLoading] = useState(true);

  const jobId = params?.id;

  useEffect(() => {
    (async () => {
      if (!jobId) return;
      setLoading(true);
      try {
        const data = await getPublicJobById(jobId);
        setJob(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button asChild>
          <Link href={`/apply/${jobId}`}>Apply</Link>
        </Button>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : !job ? (
          <div className="py-12 text-center text-muted-foreground">
            Job not found (or not published).
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <p className="mt-2 text-muted-foreground">
                {job.companyName || "—"} • {job.location || "—"}
              </p>
              {job.category && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Category: {job.category}
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold">Job description</h2>
              <p className="mt-2 whitespace-pre-wrap text-gray-700">
                {job.description || "No description provided."}
              </p>
            </div>

            <div className="border-t pt-4 flex gap-2">
              <Button asChild>
                <Link href={`/apply/${jobId}`}>Apply</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/jobs">Back to jobs</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
