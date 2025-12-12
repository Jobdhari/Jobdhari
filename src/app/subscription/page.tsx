"use client";

import { useEffect, useState } from "react";
import { ensureSubscription, getSubscription, SubscriptionDoc } from "@/lib/billing/subscription";
import UpgradeModal from "@/components/UpgradeModal";
import { Button } from "@/components/ui/button";

export default function SubscriptionPage() {
  const [sub, setSub] = useState<SubscriptionDoc | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await ensureSubscription();
      const latest = await getSubscription();
      setSub(latest);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">My Subscription</h1>

      {!sub ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="max-w-xl bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Current plan</p>
          <p className="text-lg font-semibold">
            {sub.plan.toUpperCase()} — {sub.postsThisMonth}/{sub.jobPostLimit} posts used
          </p>
          {sub.activeUntil && (
            <p className="text-xs text-gray-500 mt-1">Active until: {new Date(sub.activeUntil).toLocaleDateString()}</p>
          )}

          <div className="mt-6 flex gap-2">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setOpen(true)}>
              Upgrade
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/employer/post-job"}>
              Post a Job
            </Button>
          </div>
        </div>
      )}

      <UpgradeModal open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
