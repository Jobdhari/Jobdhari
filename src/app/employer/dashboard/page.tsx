import { Suspense } from "react";
import EmployerDashboardClient from "./EmployerDashboardClient";

export const dynamic = "force-dynamic";

export default function EmployerDashboardPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading dashboard…</div>}>
      <EmployerDashboardClient />
    </Suspense>
  );
}
