// src/app/employer/layout.tsx
import AppShell from "@/components/layout/AppShell";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
