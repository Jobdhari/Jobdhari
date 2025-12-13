// src/lib/navigation/dashboardRoute.ts
export type AppRole = "candidate" | "employer" | "admin";

export function getDashboardRoute(role: AppRole | null | undefined) {
  if (role === "employer") return "/employer/dashboard";
  if (role === "admin") return "/admin";
  // candidate (default)
  return "/";
}
