"use client";

import { useEffect, useState } from "react";
import RequireAdmin from "@/components/auth/RequireAdmin";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminPage() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const snap = await getDocs(collection(db, "jobs"));
      setCount(snap.size);
    };

    fetchStats();
  }, []);

  return (
    <RequireAdmin>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-2">Admin Overview</h1>
        <p className="text-gray-600">
          Total jobs in system:{" "}
          <span className="font-semibold">
            {count === null ? "Loading…" : count}
          </span>
        </p>
      </div>
    </RequireAdmin>
  );
}
