"use client";

/**
 * @feature Employer Jobs
 * @responsibility Non-MVP page placeholder (redirect to dashboard)
 * @routes /employer/my-jobs
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployerMyJobsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/employer/dashboard");
  }, [router]);

  return (
    <div className="p-6 text-muted-foreground">
      Redirecting…
    </div>
  );
}
