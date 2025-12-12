// src/components/UpgradeModal.tsx
"use client";

import { useState } from "react";
import { upgradePlan } from "@/lib/billing/subscription";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function UpgradeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState<"pro" | "enterprise" | null>(null);

  if (!open) return null;

  const handleUpgrade = async (plan: "pro" | "enterprise") => {
    try {
      setLoading(plan);
      // In real world: launch UPI/Razorpay/Stripe and verify txn first.
      await upgradePlan(plan);
      alert(`Upgraded to ${plan.toUpperCase()}!`);
      onClose();
    } catch (e) {
      alert("Upgrade failed. Try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center">
      <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upgrade Plan</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          You’ve reached your monthly posting limit. Upgrade to continue posting.
        </p>

        <div className="grid gap-3">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Pro</p>
                <p className="text-xs text-gray-500">10 posts / month</p>
              </div>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading !== null}
                onClick={() => handleUpgrade("pro")}
              >
                {loading === "pro" ? "Upgrading..." : "Upgrade ₹199"}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Enterprise</p>
                <p className="text-xs text-gray-500">100 posts / month</p>
              </div>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading !== null}
                onClick={() => handleUpgrade("enterprise")}
              >
                {loading === "enterprise" ? "Upgrading..." : "Upgrade ₹999"}
              </Button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mt-4">
          * Payment flow is mocked here. Connect Razorpay/Stripe later and write the result to <code>/payments</code>.
        </p>
      </div>
    </div>
  );
}
