"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import EmployerGate from "@/components/auth/EmployerGate";
import { Button } from "@/components/ui/button";
import { getEmployerJobById } from "@/lib/firebase/employerJobsService";

type JobDetails = Awaited<ReturnType<typeof getEmployerJobById>>;

export default function EmployerJobDetailsPage() {
  const params = useParams<{ id: string }>();
  const jobId = String(params?.id || "");
  const router = useRouter();

  const [job, setJob] = useState<JobDetails>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getEmployerJobById({ jobId });
        if (!alive) return;
        setJob(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load job");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [jobId]);

  if (loading) {
    return (
      <EmployerGate>
        <div className="p-6 text-muted-foreground">Loading job…</div>
      </EmployerGate>
    );
  }

  if (!job) {
    return (
      <EmployerGate>
        <div className="p-6 text-muted-foreground">Job not found.</div>
      </EmployerGate>
    );
  }

  return (
    <EmployerGate>
      <div className="mx-auto max-w-3xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <div className="text-sm text-muted-foreground">
              {job.companyName} • {job.location}
            </div>

            {job.jobDhariId ? (
              <div className="mt-2 inline-flex items-center rounded-md border px-2 py-1 text-xs font-mono text-gray-700">
                {job.jobDhariId}
              </div>
            ) : (
              <div className="mt-2 text-xs text-gray-400">
                JobDhari ID not available (legacy job)
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/employer/jobs/${jobId}/responses`}>
                View responses
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/employer/jobs/${jobId}/edit`}>Edit</Link>
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="text-sm">
            <span className="font-medium">Status:</span> {job.status}
          </div>
          <div className="text-sm">
            <span className="font-medium">Published:</span>{" "}
            {job.isPublished ? "Yes" : "No"}
          </div>
          <div className="text-sm">
            <span className="font-medium">Category:</span>{" "}
            {job.category || "—"}
          </div>

          {job.description ? (
            <div className="pt-2 text-sm whitespace-pre-wrap">
              {job.description}
            </div>
          ) : (
            <div className="pt-2 text-sm text-muted-foreground">
              No description
            </div>
          )}
        </div>

        {/* Share */}
        <div className="rounded-lg border p-4">
          <div className="font-medium mb-2">Share</div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!job.jobDhariId}
              onClick={async () => {
                if (!job.jobDhariId) return;
                await navigator.clipboard.writeText(job.jobDhariId);
                toast.success("Job ID copied");
              }}
            >
              Copy Job ID
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                const link = `${window.location.origin}/jobs/${jobId}`;
                await navigator.clipboard.writeText(link);
                toast.success("Public job link copied");
              }}
            >
              Copy Public Link
            </Button>

            <Button variant="ghost" onClick={() => router.push("/employer/my-jobs")}>
              Back
            </Button>
          </div>
        </div>
      </div>
    </EmployerGate>
  );
}
