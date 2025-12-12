// src/components/SubscriptionBadge.tsx
"use client";

import { useEffect, useState } from "react";
import { getSubscription, SubscriptionDoc } from "@/lib/billing/subscription";

export default function SubscriptionBadge() {
  const [sub, setSub] = useState<SubscriptionDoc | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await getSubscription();
        setSub(s);
      } catch {}
    })();
  }, []);

  const color =
    sub?.plan === "enterprise"
      ? "bg-emerald-600"
      : sub?.plan === "pro"
      ? "bg-indigo-600"
      : "bg-gray-500";

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`px-2 py-0.5 rounded text-white text-xs ${color}`}>
        {sub?.plan?.toUpperCase() || "FREE"}
      </span>
      {sub && (
        <span className="text-xs text-gray-500">
          {sub.postsThisMonth ?? 0}/{sub.jobPostLimit ?? 1} used
        </span>
      )}
    </div>
  );
}
