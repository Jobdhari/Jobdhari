/**
 * @feature Employer Dashboard
 * @responsibility Server wrapper that renders the client dashboard
 * @routes /employer/dashboard
 */

import EmployerDashboardClient from "./EmployerDashboardClient";

export const dynamic = "force-dynamic";

export default function EmployerDashboardPage() {
  return <EmployerDashboardClient />;
}
