"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { getPublicJobById } from "@/lib/firebase/publicJobById";
import type { PublicJob } from "@/lib/firebase/publicJobsService";

export default function ApplyGatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const auth = getAuth();

  const jobId = params?.id;

  const [job, setJob] = useState<PublicJob | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Auth gate
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, [auth]);

  // 📄 Job validation
  useEffect(() => {
    (async () => {
      if (!jobId) return;
      const data = await getPublicJobById(jobId);
      setJob(data);
      setLoading(false);
    })();
  }, [jobId]);

  if (loading) {
    return (
      <div className="p-8 text-muted-foreground">
        Checking application…
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">Job not available</h1>
        <p className="mt-2 text-muted-foreground">
          This job may be closed or unpublished.
        </p>
        <Button className="mt-4" onClick={() => router.push("/jobs")}>
          Browse jobs
        </Button>
      </div>
    );
  }

  // 🔐 Not logged in → login
  if (!user) {
    return (
      <div className="p-8 max-w-xl">
        <h1 className="text-2xl font-bold">Apply for {job.title}</h1>
        <p className="mt-2 text-muted-foreground">
          You need to login to apply for this job.
        </p>

        <Button
          className="mt-6"
          onClick={() =>
            router.push(`/login?redirect=/apply/${jobId}`)
          }
        >
          Login to apply
        </Button>
      </div>
    );
  }

  // ✅ Logged in → profile gate comes next
  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold">Almost there</h1>
      <p className="mt-2 text-muted-foreground">
        You are logged in, but we still need your profile before you can apply.
      </p>

      <Button
        className="mt-6"
        onClick={() =>
          router.push(`/candidate/profile?redirect=/apply/${jobId}`)
        }
      >
        Create profile
      </Button>
    </div>
  );
}
