"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";      // wherever your auth is
import { createJob, JobFormValues } from "@/lib/firebase/jobService";
import { toast } from "sonner";

// ...

const [user] = useAuthState(auth);

// This is the handler you pass to JobForm
async function onSubmit(values: JobFormValues) {
  if (!user) {
    toast.error("Please log in as an employer to post a job.");
    return;
  }

  try {
    await createJob(values, user.uid);
    toast.success("Job created successfully!");
    // optional: redirect to /employer/my-jobs
  } catch (error: unknown) {
    console.error("onSubmit error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    toast.error(`Could not create job: ${message}`);
  }
}
